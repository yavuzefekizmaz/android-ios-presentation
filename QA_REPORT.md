# Kalite Kontrol Raporu

**Tarih:** 16 Ekim 2026 (Türkiye saati)
**Ortam:** Kullanıcının Windows bilgisayarı; Node.js 24.15.0, npm lock dosyası, Python 3.14.5, Playwright Chromium 156.0.8078.4.

Bu rapor bu bilgisayarda gerçekten çalıştırılan kontrollere aittir. Önceki uzak ortamın raporu ve Firefox/performans ölçümleri `qa/previous-environment/` içindedir; burada yeni test kanıtı sayılmamıştır.

## Yerel sonuçlar

| Kontrol | Sonuç ve kanıt |
| --- | --- |
| Bağımlılıklar | `npm ci` başarılı; 0 npm güvenlik açığı |
| Üretim derlemesi | `npm run build` başarılı; TypeScript hatası yok |
| Kaynak içerik | 31 slayt, sıra 1–31, 6 HTML tablo, Türkçe karakterler ve isimler; `scripts/check-content.mjs` başarılı |
| PPTX metin karşılaştırması | `python scripts/verify-source.py`: 319 metin öğesi / tablo hücresi eşleşti |
| Özgün dosyalar | 115 dosya kaynak ZIP ile birebir aynı; slayt verileri, görseller, font/lisanslar, PPTX ve PDF korunmuştur. `qa/source-integrity.json` |
| Yerel üretim önizlemesi | `npm test`: 20/20 başarılı. `qa/test-results.json` |
| Windows çevrimdışı başlatıcı | Üretilen `offline/Baslat-Windows.bat` gerçekten çalıştırıldı; 127.0.0.1:8765 üzerinde Python sunucusu açıldı |
| Bağımsız paket | Bu BAT ile açılan sunucuda `npm test`: 20/20 başarılı. `qa/offline-test-results.json` |
| Dosya ve önbellek denetimi | 81 sunulan dosya `dist/` ile SHA-256 olarak eşleşti. Service Worker kök kapsamı, etkin sürüm, eski önbelleğin temizlenmesi, ağ kapalı yeniden yükleme ve gezinme başarılı. `qa/local-assets-results.json` |
| Paketleme | `npm run package` başarılı; kaynak, Cloudflare ve bağımsız çevrimdışı ZIP'leri üretildi |

20 etkileşim kontrolü; varsayılan okuma, bütün slaytlar ve tablolar, bölüm bağlantıları, ekrana sığdırma, gerçek tam ekran, sağ/sol/PageDown/PageUp/Space/Home/End/Escape, hızlı gezinme ve sınırlar, fare düğmeleri, görünür çıkış, son slayta dönüş, modlar arası konum, tarayıcı tam ekranından çıkış, tam ekran reddi durumunda pencere sunumu, görsel decode ve metin sınırları, PDF içeriği, ağ kapalı yeniden yükleme, 320/390/768/1024 px taşma kontrolü, mobil tablolar, dokunmatik kaydırma, yatay dönüş, azaltılmış hareket ve konsol/JavaScript hatalarını kapsar.

İlk Windows koşusunda yalnızca mobil dönüş testinde Chromium'un yerel penceresinin tam ekrandan henüz çıkmaması nedeniyle `Browser.setWindowBounds` hatası oluştu. Test, tam ekran düğmesini ve DOM çıkışını doğruladıktan sonra CDP ile test penceresini normal duruma getirir. Ardından gerçek viewport döndürme ve sahne boyutu/çıkış kontrolleri çalıştırılır. Uygulama tasarımı ve akademik içerik değiştirilmedi. İlgili yeniden koşu 20/20 başarılıdır. Kaynak karşılaştırma aracında Windows için UTF-8 açıkça belirtildi.

## GitHub ve Cloudflare

Public depo GitHub CLI ile `yavuzefekizmaz/android-ios-presentation` olarak oluşturuldu ve kaynaklar `main` dalına push edildi. Önceki `createRepository` entegrasyon engeli giderildi. GitHub Actions, Node.js 22 üzerinde derlemeyi ve 20 Chromium kontrolünü başarıyla tamamladı: https://github.com/yavuzefekizmaz/android-ios-presentation/actions/runs/38874563718 . Kanıt: `qa/github-actions.json`.

Cloudflare CLI cihaz koduyla başarıyla yetkilendirildi (hesap/kullanıcı okuma ve Pages yazma). GitHub bağlantılı proje oluşturma isteği Cloudflare tarafından HTTP 403 / `8000077: Your user email must been verified` hatasıyla reddedildi. Hesabın e-posta doğrulaması bekleniyor; kalıcı Pages yayını ve canlı HTTPS testleri henüz tamamlanmadı. Kanıt: `qa/cloudflare-provisioning.json`.

## Sınırlar

Dokunmatik ve mobil kontroller Chromium emülasyonudur. Bu oturumda fiziksel iPhone/Android/tablet, Safari, ayrı Microsoft Edge veya sınıf projeksiyonu test edilmedi. Önceki Firefox ve performans sayıları yeni test olarak sunulmaz. PWA için ilk tam önbellek kurulumu ve tarayıcı depolamasının korunması gerekir. Bağımsız paket Python 3 ile tamamen yerel çalışır. Kaynak akademik ifadeler değiştirilmedi ve yeniden araştırılmadı.
