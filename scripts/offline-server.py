"""No external packages needed. Serves only on loopback; never requires Internet."""
import http.server
import socketserver
import webbrowser
from pathlib import Path
from functools import partial
import argparse
parser=argparse.ArgumentParser(description='Android ve iOS yerel sunum sunucusu')
parser.add_argument('--port',type=int,default=8765)
args=parser.parse_args()
root=Path(__file__).resolve().parent
handler=partial(http.server.SimpleHTTPRequestHandler,directory=str(root))
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
try:
 with Server(('127.0.0.1',args.port),handler) as server:
  url=f'http://127.0.0.1:{args.port}/'
  print(f'Sunum: {url}\nKapatmak icin Ctrl+C. Bu pencereyi sunum boyunca acik tutun.')
  webbrowser.open(url)
  server.serve_forever()
except KeyboardInterrupt:print('\nSunum sunucusu kapatildi.')
except OSError as error:print(f'Sunucu acilamadi: {error}\nBaska port deneyin: python server.py --port 8766');raise SystemExit(1)
