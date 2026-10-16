"""Use after node scripts/inspect.mjs; produce an ordered PDF / HTML contact sheet."""
from pathlib import Path
import fitz
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
pdf=fitz.open(root/'public/documents/android-ios.pdf')
rows=(len(pdf)+1)//2
out=Image.new('RGB',(1920,rows*295),'#18212d')
for i,page in enumerate(pdf):
 pix=page.get_pixmap(matrix=fitz.Matrix(.5,.5));ref=Image.frombytes('RGB',(pix.width,pix.height),pix.samples)
 web=Image.open(root/f'qa/slide-{i+1:02}.png');web.thumbnail((480,270))
 x=(i%2)*960;y=(i//2)*295
 out.paste(ref,(x,y+22));out.paste(web,(x+480,y+22));ImageDraw.Draw(out).text((x+8,y+4),f'{i+1:02}  PDF | HTML',fill='#e8ebf0')
out.save(root/'qa/comparison-all.jpg',quality=88)
print('qa/comparison-all.jpg: PDF left, HTML right, 31 slides')
