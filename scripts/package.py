"""Create reproducible source/deployment/offline handoff archives."""
from pathlib import Path
import shutil,zipfile
root=Path(__file__).resolve().parents[1]
output=root/'offline'
if output.exists():shutil.rmtree(output)
shutil.copytree(root/'dist',output)
shutil.copy(root/'scripts/offline-server.py',output/'server.py')
(output/'Baslat-Windows.bat').write_bytes(b'@echo off\r\ncd /d "%~dp0"\r\npy -3 --version >nul 2>&1\r\nif errorlevel 1 (\r\n  python server.py\r\n) else (\r\n  py -3 server.py\r\n)\r\npause\r\n')
(output/'BASLANGIC.txt').write_text('''ANDROID VE iOS KARŞILAŞTIRMASI — ÇEVRİMDIŞI PAKET

Bu klasördeki bütün dosyaları birlikte saklayın. İnternet gerekmez.
Windows: Python 3 kuruluysa Baslat-Windows.bat dosyasına çift tıklayın.
Python, kurulum sırasında PATH seçeneği açık olacak şekilde önceden kurulmalıdır.
Adres: http://127.0.0.1:8765/
Sunucu penceresini açık tutun; durdurmak için Ctrl+C kullanın.

macOS / Linux: Bu klasörde terminal açıp python3 server.py çalıştırın.
Alternatif: python -m http.server 8765 --bind 127.0.0.1
Ardından tarayıcıdan http://127.0.0.1:8765/ adresini açın.
Port doluysa: python server.py --port 8766

index.html dosyasını file:// ile açmayın. Tarayıcı modülleri ve Service Worker
HTTP / localhost gerektirir. Yerel sunucu yalnızca bilgisayarınızda çalışır.
İki görüntüleme modu ve bütün görseller bu paketle internet olmadan çalışır.
PWA önbelleği için ilk ziyaretin tamamlanması gerekir; bu yerel paket ise
gerekli bütün dosyaları zaten içerir. Python'un önceden kurulu olması yeterlidir.

Sunum: Sunumu Başlat. Sağ/sol ok, PageDown/PageUp, Space, Home/End, Esc.
Telefon/tablet: Sunumda sağa/sola kaydırın. Görünür Çıkış düğmesiyle dönün.
PDF yedeği: documents/android-ios.pdf
PowerPoint: documents/android-ios.pptx
''',encoding='utf-8')

def archive(path,files,prefix=''):
 with zipfile.ZipFile(path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for f in sorted(files):z.write(f,prefix+str(f.relative_to(root if not prefix else output)))
# Cloudflare direct upload archive has index.html at archive root.
with zipfile.ZipFile(root/'cloudflare-pages-dist.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted((root/'dist').rglob('*')):
  if f.is_file():z.write(f,str(f.relative_to(root/'dist')))
archive(root/'offline-package.zip',[f for f in output.rglob('*') if f.is_file()],'offline/')
exclude={'node_modules','.git','.wrangler','dist','offline','__pycache__','test-results','playwright-report'}
files=[f for f in root.rglob('*') if f.is_file() and not any(p in exclude for p in f.relative_to(root).parts) and f.suffix not in {'.zip','.log'} and not f.name.startswith(('.env','.dev.vars')) and not (f.parent.name=='qa' and (f.name.startswith(('asset-','slide-','browser-','comparison-'))))]
with zipfile.ZipFile(root/'android-ios-presentation-source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted(files):z.write(f,'android-ios-presentation/'+str(f.relative_to(root)))
for name in ['cloudflare-pages-dist.zip','offline-package.zip','android-ios-presentation-source.zip']:print(name,round((root/name).stat().st_size/1024/1024,2),'MiB')
