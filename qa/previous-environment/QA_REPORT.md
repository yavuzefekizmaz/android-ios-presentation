# Kalite Kontrol Raporu

**Tarih:** 16 Ekim 2026  
**Sürüm:** 1.0.0  
**Kapsam:** Kullanıcının verdiği son PPTX ve aynı sürüm PDF'nin 31 slaytlık statik web dönüşümü.

## İçerik doğrulaması

| Kontrol | Sonuç / kanıt |
| --- | --- |
| 31 slayt ve kaynak sırası | Başarılı; numaralar 1–31 |
| Kaynak metinlerin aktarılması | Başarılı; 319 metin öğesi / tablo hücresi PPTX ile birebir karşılaştırıldı |
| İstenen teşekkür başlığı | “Dinlediğiniz İçin Teşekkürler” ve “Hazırlayanlar” harf düzeni uygulandı |
| Hazırlayanlar, ders, öğretim görevlisi ve bölüm | Kaynaktaki isimler ve Türkçe karakterler doğrulandı |
| Karşılaştırma tabloları | 6 gerçek HTML tablo |
| Görseller | 34 benzersiz özgün PPTX varlığı; orijinaller `sources/media/` içinde |
| Görsel oranları | Özgün oranlar korundu; kırpma uygulanmadı |
| Kaynak PDF / PPTX | Değişmeden korundu |
| Yeni akademik bilgi | Eklenmedi; kaynak akademik ifadeleri yeniden yazılmadı |
| Gamma | PPTX/HTML içerik taraması ve PDF metin taramasında yok; 31 sayfalık görsel denetimde filigran görülmedi |

`python scripts/verify-source.py` bütün metin öğelerini ve hücreleri kaynağa karşı doğrular. Fark yalnızca kullanıcının istediği son slayt harf düzenlemesidir. Kaynaktaki görseller üzerinde OCR tabanlı her-piksel filigran garantisi verilmez.

## Çalıştırılan tarayıcı testleri

`npm test` içindeki **20 etkileşim kontrolünün tamamı başarılıdır**. Aynı test paketi bağımsız `offline/` Python sunucusunda da çalıştırıldı ve başarılı oldu. Ham kayıt, tarih ve Chromium sürümü `qa/test-results.json` içindedir.

1. Varsayılan okuma modu, 31 slayt ve 6 HTML tablo.
2. Bütün sürüm dosyaları tamamlandıktan sonra çevrimdışı hazır durumu.
3. Üst gezinme çubuğunun daraltılıp açılması.
4. Dört bölüm bağlantısı ve 31 doğrudan slayt bağlantısı.
5. Okuma görünümünde ekrana sığdırma.
6. Seçilen slayttan başlatma, gerçek Fullscreen API ve orantılı sahne.
7. Sağ/sol, PageDown/PageUp, Space, Home/End.
8. 60 kez ileri ve 60 kez geri tuş dizisi; sınırların korunması ve tek sahne.
9. Fare düğmeleri, görünür çıkış ve son slayta dönüş.
10. Mod değişiminde okuma konumunun korunması.
11. Tarayıcı tam ekranından çıkıldığında okuma moduna dönüş.
12. Fullscreen API reddedildiğinde çalışır pencere sunumu.
13. 31 slaytın tamamında HTML metinleri, görsel decode ve genel sahne sınırları.
14. PDF yedeğinin gerçek PDF içeriğiyle yanıt vermesi.
15. Ağ kapatıldıktan sonra yeniden yükleme, 31 slaytın görselleri ve gezinme.
16. 320, 390, 768 ve 1024 piksel genişliklerde yatay sayfa taşması olmaması.
17. Mobil bölüm geçişleri ve 6 tablonun okunabilir akış düzeni.
18. DOM TouchEvent ile sola/sağa kaydırma, yatay boyuta uyum ve görünür çıkış.
19. `prefers-reduced-motion` ile CSS / slayt animasyonlarının kapanması.
20. Konsol ve JavaScript hatası olmaması.

Dokunmatik testler Chromium cihaz emülasyonunda yapıldı. Pencere boyutu değişikliği, headless Chromium'un tam ekran pencereyi yeniden boyutlandırma kısıtı nedeniyle yerel tam ekran görünür düğmeyle kapatıldıktan sonra, sunum açık tutularak test edildi.

## Firefox doğrulaması

Playwright Firefox **157.0** üzerinde ayrıca 8 kontrol başarılı oldu: 31 okuma slaytı, 6 tablo, bütün sunum görselleri, Home/End/Escape, tamamlanmış çevrimdışı önbellek, ağ kapalı yeniden yükleme ve sunum, 390 px görünüm ve JavaScript hatası olmaması. Kanıt `qa/firefox-results.json` içindedir.

## Görsel karşılaştırma

31 PDF sayfası, karşılık gelen HTML sunum ekranıyla yan yana incelendi. Kapaklar, fotoğraflar, kart sütunları, tablolar, vurgu renkleri ve metin hiyerarşisi korundu. `node scripts/inspect.mjs` ve `python scripts/compare-pdf.py` bu karşılaştırmayı yeniden üretir. `qa/comparison-all.jpg` PDF solda / HTML sağda düzenindedir; geçici ekran görüntüleri Git'e alınmaz.

PDF'de bazı özgün PPTX fontlarının Noto Sans ile değiştirildiği görüldü. Web sürümü PDF'deki bu eşleştirmeyi yerel fontlarla uygular. Metin kutusuna sığdırma, kaynak programdaki otomatik sığdırma davranışına yaklaştırıldı. Tarayıcı font rasterlemesi ve tablo satır ölçümü nedeniyle **piksel düzeyinde özdeşlik iddia edilmez**.

İkinci slaytın uzun başlığı PPTX metin kutusunun nominal sağ kenarını yaklaşık 14 kaynak pikseli aşar; kaynak PDF'de de benzer uzama vardır. Başlık 16:9 sahne içinde tam görünür, kırpılmaz ve başka içerikle çakışmaz. Mobilde 16:9 düzen bilinçli olarak okunabilir akışa çevrilir; tablolar etiketli satırlar hâlinde gösterilir.

## Derleme ve statik çıktı

- `npm install` ve `npm run build` başarılı; TypeScript hata sayısı 0.
- `npm run preview` ile üretim çıktısı test edildi.
- `dist/` yalnızca HTML, CSS, JS, Service Worker, manifest ve statik varlıklar içerir.
- Derleme çıktısı yaklaşık **11,1 MiB**; WebP slayt varlıkları toplam **2,95 MiB**.
- Görseller responsive boyutlarla, oranları belirtilerek ve lazy loading ile sunulur.
- İlk slayt görselleri öncelikli; sunumda önceki/mevcut/sonraki görseller hazırlanır.
- Çalışma sırasında dış CDN, Google Fonts isteği veya backend gerekmiyor.
- Cloudflare Pages için `dist/`, Direct Upload ZIP'i ve GitHub Actions yapılandırması hazırlandı.

## Çevrimdışı doğrulama

Üretim önizlemesinde Service Worker'ın bütün dosyaları saklaması beklendi. Tarayıcı bağlamında ağ kapatıldı, sayfa yeniden yüklendi ve 31 slaytın her birindeki görseller decode edilerek sunumda gezildi. Sonuç başarılıdır. Önbellek durumu, yalnızca sürümün bütün dosyaları başarıyla yazıldıktan sonra “Çevrimdışı hazır” olur.

`offline-package.zip`, aynı üretim çıktısını, orijinal PDF'yi, bağımsız Python sunucusunu ve Windows başlatıcısını içerir. Yerel paket ilk kez internet olmadan kullanılabilir; Python 3'ün önceden kurulu olması gerekir. `file://` desteklenmez. PWA ise ilk tam ziyaret tamamlanmadan çevrimdışı kullanımı garanti etmez.

## Performans ölçümünün sınırları

`node scripts/measure-scroll.mjs` ile headless Chromium'da 1440×1000 boyutunda 120 karelik sentetik kaydırma örneği alındı. Ölçüm `qa/performance.json` içindedir. Tek başına çalıştırılan örnekte medyan yaklaşık **16,7 ms**, p95 **33,3 ms**, en uzun kare **183,3 ms** idi. Paralel test yükü altında daha yavaş örnekler de görüldü.

Bu sonuç sürekli 60 FPS garantisi vermez. İlk görsel çözme, donanım ve ekran kartı sonuçları etkiler. Uzun süreli sınıf/projeksiyon donanımı ölçümü yapılmadı. Sürekli arka plan animasyonu, ağır animasyon kütüphanesi, scroll olayında senkron yerleşim hesabı veya yaygın `will-change` kullanılmadı.

## Yapılmayan kontroller ve bilinen sınırlar

- Gerçek iPhone, Android telefon, tablet, Windows bilgisayar ve sınıf projeksiyonu fiziksel olarak test edilmedi.
- Safari/iOS ve Microsoft Edge ayrı uygulama olarak çalıştırılmadı; Chromium emülasyonu fiziksel cihaz testi yerine geçmez.
- Windows `.bat` dosyası Windows üzerinde yürütülmedi; eşdeğer Python yerel sunucusu Linux ortamında doğrulanır.
- Cloudflare hesabında gerçek Pages dağıtımı / alan adı / HTTPS üretim uç noktası oluşturulmadı. Git entegrasyonu README'deki ayarlarla bağlanmalıdır.
- Tarayıcının depolama temizliği, kota yönetimi veya özel gezinme sınırlamaları PWA önbelleğini etkileyebilir.
- Akademik ifadelerin doğruluğu kaynak dışı araştırmayla yeniden değerlendirilmedi; amaç kaynak içeriğini korumaktır.

## GitHub ve teslim durumu

GitHub hesabı `yavuzefekizmaz` olarak doğrulandı. Yeni public `android-ios-presentation` reposunu oluşturmak için `gh repo create` çağrıldı; GitHub **`GraphQL: Resource not accessible by integration (createRepository)`** hatası döndürdü. Bağlı entegrasyon repository oluşturma işlemini yetkilendirmedi. Repo oluşturulmadı ve push yapılmadı; var olmayan bir repository veya canlı site bağlantısı raporlanmıyor.

Yerel kaynak kodu, `dist/`, `cloudflare-pages-dist.zip`, `offline/`, `offline-package.zip`, `android-ios-presentation-source.zip`, README ve test raporları tamamlandı. Üç ZIP'in CRC bütünlüğü kontrol edildi; bağımsız paketteki üretim dosyaları `dist/` ile SHA-256 olarak karşılaştırıldı. GitHub yayını için yeniden çalıştırılabilecek adımlar `PUBLISH_GITHUB.md` içindedir. Bu erişim engeli web sitesinin yerel ve Cloudflare'a hazır çıktılarının çalışmasını etkilemez.
