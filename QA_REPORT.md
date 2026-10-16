# Kalite Kontrol Raporu

## 1.1.0 mobil düzeltmesi ve belge seçimi

Üst alandaki OBSIDIAN TECH ve görünür çevrimdışı durum etiketi kaldırıldı. Ekrana sığdırma anahtarı en az 44 px tıklama yüksekliği, klavye odağı ve belirgin seçili durumla yenilendi. Yerel Chromium kontrolünde etiketlerin görünmediği, anahtarın okuma görünümünü değiştirdiği ve çevrimdışı önbelleğin yine tamamlandığı doğrulandı.

İlk 1.1.0 Actions koşusu (`38881118601`) tam ekran testleri arasında tarayıcı geçişi tamamlanmadan sonraki test başladığı için `Document not active` ile başarısız oldu. Test, önceki çıkışı ve sonraki tam ekran girişini bekleyecek, ilgili sayfayı öne alacak şekilde düzeltildi; uygulama kodu değişmedi. Başarısız koşu başarılı test kanıtı sayılmaz. Sonraki koşunun sonucu GitHub Actions geçmişinde izlenir.

Mobil okuma görünümü kaynak nesneleri tek tek sıralamak yerine ilişkili kart ve ikon gruplarını korur. 3 ve 4. slayttaki kapatılmış eski fotoğraflar yalnızca mobil akıştan çıkartıldı; üstteki doğru fotoğraflar korunur. 9. slayttaki dört saydam görüntü ve numaraları tek ölçeklenebilir şemada kalır. 31 slaydın özgün metinleri korunur; 320, 390 ve 700 px genişliklerde metin kapsamı ve yatay taşma denetlenir. Kaynak slayt JSON'u değiştirilmedi.

PDF ve PowerPoint seçimini sunan yerel diyalog; açma/kapama, Escape ve odak dönüşüyle test edilir. İndirilen PPTX, kaynak dosyanın SHA-256 değeriyle karşılaştırılır. Her iki dosya ağ kapalı yeniden yükleme sonrasında Service Worker üzerinden okunur. `npm test`: 20 temel + 8 yeni kontrol. Güncel mobil kanıtlar `qa/mobile-results.json` ve canlı karşılıklarıdır.

Masaüstü için 3, 4, 9, 13, 15 ve 31. slaytların yeni ekran görüntülerinin çözülmüş RGB pikselleri, yayımlanmış 1.0.1 ile birebir aynı bulundu. Kanıt: `qa/desktop-unchanged.json`. PNG dosyasının sıkıştırma/metaveri farkları görsel fark sayılmaz. Temel paket bütün 31 sunum slaydının metin, görsel ve sınır kontrollerini de çalıştırır.

Yeni kısa adres https://android-vs-ios.pages.dev/; eski https://android-ios-presentation.pages.dev/ adresi de aynı sürüm için korunur. Yayımlama Direct Upload'dır; bilgisayar kapalıyken site çalışır. GitHub push ve Actions erişimi çalışır; önceki Cloudflare Git kurulum hatası nedeniyle otomatik Pages dağıtımı kurulmamıştır.

| 1.1.0 doğrulaması | Sonuç / kanıt |
| --- | --- |
| Yerel üretim | 20 temel + 8 mobil/belge kontrolü başarılı; `qa/test-results.json`, `qa/mobile-results.json` |
| Kısa HTTPS adresi | 28/28 başarılı; `qa/live-test-results.json`, `qa/live-mobile-results.json` |
| Önceki HTTPS adresi | 28/28 başarılı; `qa/legacy-live-test-results.json`, `qa/legacy-live-mobile-results.json` |
| Canlı dosyalar | 82 dosya `dist/` ile SHA-256 olarak eşleşti; `qa/live-assets-results.json` |
| Önceki üretim önbelleği | Açık tarayıcıda 1.0.1'den yeni sürüme geçiş, eski önbelleğin silinmesi ve ağ kapalı 31 slayt/görsel gezinmesi geçti; `qa/sw-upgrade-results.json` |
| Windows bağımsız paket | Gerçek `Baslat-Windows.bat` ile başlatıldı; 28/28 başarılı; `qa/offline-test-results.json`, `qa/offline-mobile-results.json` |
| Kaynaklar | 319 metin/tablo hücresi PPTX ile eşleşti; kaynak JSON, PDF ve PPTX değişmedi. Yeni indirilebilir PPTX kaynakla aynı SHA-256 değerine sahip |
| Tiresiz ad sorgusu | `androidvsios.pages.dev` için DNS NXDOMAIN; adres oluşturulmadı. Kesin tahsis uygunluğu DNS ile doğrulanamaz; `qa/domain-availability.json` |

Uzun mobil metni kısaltan ek bir görünüm bu sürüme eklenmedi; kullanıcı mevcut hata düzeltmeleriyle devam etmeyi tercih etti. Testler fiziksel telefon testi değil, Chromium mobil emülasyonudur.

## 1.0.1 kurulumu ve önceki doğrulamalar

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
| Canlı HTTPS sunumu | https://android-ios-presentation.pages.dev/ üzerinde 20/20 Chromium kontrolü başarılı. `qa/live-test-results.json` |
| Canlı varlıklar ve PWA | 81 dosya `dist/` ile birebir eşleşti; görsel/font/JS/CSS/PDF eksik isteği yok. Kök kapsamı, sürümlü önbellek, tam ekran, mobil ve ağ kapalı yeniden yükleme/gezinme başarılı. `qa/live-assets-results.json` |
| Mevcut üretim önbelleğinin güncellenmesi | Aynı açık tarayıcıda önceki üretim Service Worker'ı yeni sürüme geçti; eski önbellek temizlendi, ardından ağ kapalı yeniden yükleme ve 31 slaydın bütün görselleriyle gezinme geçti. `qa/sw-upgrade-results.json` |
| Paketleme | `npm run package` başarılı; kaynak, Cloudflare ve bağımsız çevrimdışı ZIP'leri üretildi |

20 etkileşim kontrolü; varsayılan okuma, bütün slaytlar ve tablolar, bölüm bağlantıları, ekrana sığdırma, gerçek tam ekran, sağ/sol/PageDown/PageUp/Space/Home/End/Escape, hızlı gezinme ve sınırlar, fare düğmeleri, görünür çıkış, son slayta dönüş, modlar arası konum, tarayıcı tam ekranından çıkış, tam ekran reddi durumunda pencere sunumu, görsel decode ve metin sınırları, PDF içeriği, ağ kapalı yeniden yükleme, 320/390/768/1024 px taşma kontrolü, mobil tablolar, dokunmatik kaydırma, yatay dönüş, azaltılmış hareket ve konsol/JavaScript hatalarını kapsar.

İlk Windows koşusunda yalnızca mobil dönüş testinde Chromium'un yerel penceresinin tam ekrandan henüz çıkmaması nedeniyle `Browser.setWindowBounds` hatası oluştu. Test, tam ekran düğmesini ve DOM çıkışını doğruladıktan sonra CDP ile test penceresini normal duruma getirir. Ardından gerçek viewport döndürme ve sahne boyutu/çıkış kontrolleri çalıştırılır. Uygulama tasarımı ve akademik içerik değiştirilmedi. İlgili yeniden koşu 20/20 başarılıdır. Kaynak karşılaştırma aracında Windows için UTF-8 açıkça belirtildi.

## GitHub ve Cloudflare

Public depo GitHub CLI ile `yavuzefekizmaz/android-ios-presentation` olarak oluşturuldu ve kaynaklar `main` dalına push edildi. Önceki `createRepository` entegrasyon engeli giderildi. GitHub Actions, Node.js 22 üzerinde derlemeyi ve 20 Chromium kontrolünü başarıyla tamamladı: https://github.com/yavuzefekizmaz/android-ios-presentation/actions/runs/38874563718 . Kanıt: `qa/github-actions.json`.

Cloudflare CLI cihaz koduyla başarıyla yetkilendirildi (hesap/kullanıcı okuma ve Pages yazma). Hesabın e-posta doğrulaması kullanıcı tarafından tamamlandı ve ilk `8000077` engeli kalktı. GitHub bağlantısı bu kez mevcut Cloudflare Git kurulumundaki `8000011` hatasıyla reddedildi; kullanıcının izin verdiği Direct Upload alternatifiyle kalıcı Pages yayını tamamlandı. Proje `android-ios-presentation`, üretim dalı `main`, derleme komutu `npm run build`, çıktı `dist/`, kök repo klasörü ve yapılandırılmış Node.js `22`'dir. GitHub Actions doğrulama yapar; **otomatik Pages dağıtımı kurulmadı**. Canlı URL: https://android-ios-presentation.pages.dev/ . Kanıtlar: `qa/cloudflare-provisioning.json`, `qa/cloudflare-deployment.json`.

İlk canlı sürümde Cloudflare `/index.html` için `308 /` yönlendirmesi döndürdü. Eski Service Worker önbelleğindeki HTML yanıtının `redirected=true` olması Chromium'da ağ kapalı yeniden yüklemeyi engelledi. İlk başarısız test `qa/diagnostics/cloudflare-before-sw-fix.json` içinde saklandı. Üretimdeki ilk deneme başarılı test olarak sayılmadı.

Düzeltme, HTML gövdesini yönlendirme özelliği taşımayan yeni bir Response olarak hem kök adreste hem `index.html` anahtarında önbelleğe alır. Service Worker üretici kodu da sürüm hash'ine dâhil edilir; yalnızca mantık değiştiğinde bile yeni önbellek kurulur. Hazır mesajı sürüm kimliğini taşır. Yeniden yayından sonra güncel canlı 20 kontrol, 81 dosya doğrulaması ve gerçek üretim önbelleği yükseltme kontrolü geçti. Sunumun akademik içeriği ve OBSIDIAN TECH tasarımı değiştirilmedi.

## Sınırlar

Dokunmatik ve mobil kontroller Chromium emülasyonudur. Bu oturumda fiziksel iPhone/Android/tablet, Safari, ayrı Microsoft Edge veya sınıf projeksiyonu test edilmedi. Önceki Firefox ve performans sayıları yeni test olarak sunulmaz. PWA için ilk tam önbellek kurulumu ve tarayıcı depolamasının korunması gerekir. Bağımsız paket Python 3 ile tamamen yerel çalışır. Kaynak akademik ifadeler değiştirilmedi ve yeniden araştırılmadı.
