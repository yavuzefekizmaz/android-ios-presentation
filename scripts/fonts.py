from pathlib import Path
from urllib.request import urlopen
import json,io
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[1]/'public/assets/fonts'
for family in ['inter','manrope','bricolagegrotesque','sora','ibmplexsans']:
 listing=json.load(urlopen('https://api.github.com/repos/google/fonts/contents/ofl/'+family))
 for item in listing:
  name=item['name']
  if (name.endswith('.ttf') and 'Italic' not in name) or name=='OFL.txt':
   data=urlopen(item['download_url']).read()
   if name.endswith('.ttf'):
    font=TTFont(io.BytesIO(data));font.flavor='woff2';font.save(root/(family+'.woff2'));print(family, len(data))
   else:(root/(family+'-OFL.txt')).write_bytes(data)
