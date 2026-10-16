# Android ve iOS Karşılaştırması

İstinye Üniversitesi, Bilgisayar Programcılığı bölümü **İşletim Sistemlerine Giriş** dersi için hazırlanan 31 slaytlık interaktif web sunumu. OBSIDIAN TECH tasarımı; koyu yüzeyler, mat Android yeşili ve iOS çelik mavisi ayrımıyla korunur.

**Öğretim görevlisi:** Öğr. Gör. Yıldız Taş  
**Hazırlayanlar:** Yavuz Efe Kızmaz, Kaan İsmail Çakır, Kerem Muhammed Ece, Kaan İnan, Efe Can

## Özellikler

- Varsayılan dikey okuma modu, 31 slayt ve doğrudan bölüm bağlantıları.
- Masaüstünde özgün 16:9 yerleşimler; telefonda okunabilir metin akışı.
- Tam ekran sunum, sayaç, ilerleme çubuğu, fare ve dokunmatik gezinme.
- Fullscreen API çalışmadığında pencereyi kaplayan sunum görünümü.
- Gerçek HTML metinleri ve 6 HTML tablo; PPTX'ten çıkarılmış 34 benzersiz görsel.
- Yerel WebP görselleri, responsive boyutlar, lazy loading ve komşu slayt hazırlığı.
- Azaltılmış hareket desteği, klavyeyle kullanım ve daraltılabilir araç çubuğu.
- Service Worker ile çevrimdışı önbellek, orijinal PDF ve bağımsız yerel paket.
- Backend, hesap, veritabanı veya çalışma sırasında CDN bağımlılığı yoktur.

## Kurulum

Node.js **22.12 veya üzeri** ve npm gerekir.

```bash
npm ci
npm run dev
```

Vite'ın gösterdiği yerel adresi açın. Geliştirme modunda Service Worker kaydedilmez.

```bash
npm run build
npm run preview
```

Derleme TypeScript kontrolünü yapar ve `dist/` klasörünü üretir. Önizleme varsayılan olarak `http://localhost:4173/` adresindedir. PWA kontrolünü bu üretim önizlemesinde veya HTTPS üzerinde yapın.

## Kullanım

Sayfa okuma moduyla açılır. **Sunumu Başlat** görünürdeki slayttan başlatır; ilk açılışta bu slayt 1'dir. Her slaytın yanındaki **Sun ↗** düğmesi doğrudan o slaytı açar. Çıkışta sunulan son slayta dönülür. `#slayt-18` gibi adresler doğrudan paylaşılabilir.

| Tuş / işlem | Davranış |
| --- | --- |
| Sağ ok, PageDown, Space | Sonraki slayt |
| Sol ok, PageUp | Önceki slayt |
| Home / End | İlk / son slayt |
| Escape veya Çıkış | Okuma moduna dön |
| Sola / sağa kaydırma | Dokunmatik ekranda ileri / geri |
| Tam ekran | Tarayıcı tam ekranını aç / kapat |

Sunum kontrolleri kullanılmadığında soluklaşır; çıkış düğmesi görünür kalır. Telefonda sunum için yatay tutuş daha büyük görüntü sağlar. Mobil okuma modunda 16:9 yerine okunabilir metin akışı kullanılır.

## Cloudflare Pages'e yayımlama

### GitHub üzerinden otomatik dağıtım

1. Cloudflare panelinde **Workers & Pages → Create → Pages → Connect to Git** yolunu izleyin.
2. `android-ios-presentation` reposunu ve `main` dalını seçin.
3. Framework preset: **Vite**; build command: **`npm run build`**.
4. Build output directory: **`dist`**; root directory: repo kökü.
5. Ortam değişkeni olarak **`NODE_VERSION=22`** ayarlayın.
6. **Save and Deploy** ile ilk dağıtımı başlatın. Sonraki `main` push'ları otomatik dağıtılır.

GitHub Actions iş akışı her push/PR'da üretim derlemesini ve Chromium etkileşim testlerini çalıştırır; `dist/` çıktısını indirilebilir artifact olarak saklar. Cloudflare hesabı bu projeye bağlanmadan veya bir Pages projesi oluşturulmadan canlı URL oluşmaz. Repoya Cloudflare erişim anahtarı eklemeyin.

### Doğrudan yükleme

`dist/` içeriğini Cloudflare Pages Direct Upload alanına sürükleyin veya `cloudflare-pages-dist.zip` paketini yükleyin. ZIP'in kökünde `index.html` vardır. `node_modules`, `src` veya bütün kaynak ZIP'ini dağıtım klasörü olarak yüklemeyin.

## Çevrimdışı kullanım

**PWA:** İlk çevrimiçi açılışta HTML, CSS, JS, fontlar, bütün slayt görselleri ve PDF önbelleğe alınır. Üst alanda **Çevrimdışı hazır** görünmeden bağlantısız kullanım garanti edilmez. Tarayıcı depolaması silinirse yeniden tam yükleme gerekir. İlk ziyaretten önce PWA çevrimdışı çalışmaz.

**Bağımsız paket:** `offline-package.zip` dosyasını tamamen çıkartın. Python 3'ü önceden kurun. Windows'ta `Baslat-Windows.bat` dosyasını açın. Alternatif olarak `offline/` klasöründe:

```powershell
py -3 server.py
```

macOS / Linux:

```bash
python3 server.py
```

Sunum `http://127.0.0.1:8765/` adresinde açılır. Sunucu penceresi açık kalmalıdır; Ctrl+C ile kapanır. Bu yöntem internet kullanmaz, yalnızca yerel dosyaları sunar. Port doluysa `python server.py --port 8766` kullanın. Python kurulumunun önceden tamamlanmış olması gerekir.

`file://` üzerinden çift tıklayarak açma desteklenmez; ES modülleri ve Service Worker için HTTP/localhost gerekir. PDF yedeği `documents/android-ios.pdf` içindedir ve doğrudan açılabilir.

## İçerik düzenleme

Slaytların metinleri, tabloları, görselleri, renkleri ve koordinatları **`src/data/slides/slides.json`** dosyasında ayrı tutulur. İlgili slaytı düzenleyip yeniden derleyin. Bütün uygulamayı değiştirmeniz gerekmez.

- `src/render.ts`: HTML metin, tablo ve görsel üretimi.
- `src/main.ts`: gezinme, modlar, Fullscreen API ve çevrimdışı durum.
- `src/styles/main.css`: arayüz, slayt ve mobil stiller.
- `sources/android-ios.pptx`: değişmeden korunan kaynak sunum.
- `sources/media/`: orijinal çözünürlükte çıkarılmış görseller.
- `sources/extraction-manifest.json`: varlık eşleştirmeleri ve kaynak ölçüleri.
- `public/documents/android-ios.pdf`: değişmeden korunan görsel referans ve yedek.
- `public/assets/fonts/`: yerel fontlar ve lisansları.
- `scripts/`: aktarım, kontrol, Service Worker ve paketleme araçları.
- `qa/`: çalıştırılmış test sonuçları ve PDF görsel envanteri.

PDF dışa aktarımında bazı PPTX fontları Noto Sans ile değiştirilmiştir. Webde PDF'ye yakın satırlanma için bu eşleştirme uygulanır; kaynak font adları JSON'da korunur. Başlık ve gövde metinleri HTML'dir; 9 ve 13. slaytlardaki küçük grafik parçaları ile 25. slayttaki karmaşık şema özgün görsel varlıklardır. Görseller kırpılmaz, yeni akademik içerik eklenmez.

Aktarımı yeniden üretmek için isteğe bağlı Python araçları:

```bash
pip install -r requirements-tools.txt
python scripts/extract.py sources/android-ios.pptx
python scripts/verify-source.py
```

Yeniden aktarım JSON'daki el ile değişiklikleri üzerine yazar. Kaynak metinle fark yalnızca istenen 31. slayt başlık ve “Hazırlayanlar” büyük/küçük harf düzenlemesidir. Kaynakta bulunan akademik ifadeler, görsel içerikler ve kaynak imla tercihleri değiştirilmez.

## Test ve paketleme

Önce üretim önizlemesini bir terminalde açık tutun:

```bash
npm run build
npm run preview -- --port 4173
```

Başka terminalde:

```bash
npx playwright install chromium
npm test
npm run package
```

Sistem Chromium'u için `CHROMIUM_PATH` değişkeni kullanılabilir. `QA_URL` farklı sunucu adresini belirler. Test sonuçları `qa/test-results.json` dosyasına yazılır. PPTX karşılaştırması için `python scripts/verify-source.py` çalıştırın. Gerçekleştirilen kontroller ve sınırlar [QA_REPORT.md](QA_REPORT.md) dosyasındadır.

Paketleme şu çıktıları üretir:

| Çıktı | Kullanım |
| --- | --- |
| `dist/` | Statik barındırma |
| `cloudflare-pages-dist.zip` | Cloudflare Direct Upload |
| `offline/`, `offline-package.zip` | İnternetsiz yerel sunum |
| `android-ios-presentation-source.zip` | Kaynaklar, görseller, belgeler ve yapılandırma |

Üretilmiş paketler ve `dist/` Git'e alınmaz; kaynaklardan yeniden üretilebilir. `node_modules`, geçici ekran görüntüleri ve ortam dosyaları `.gitignore` ile dışlanır.

## Yayın ve Windows doğrulaması

Public GitHub deposu: [yavuzefekizmaz/android-ios-presentation](https://github.com/yavuzefekizmaz/android-ios-presentation).
İndirmeler: [GitHub Releases](https://github.com/yavuzefekizmaz/android-ios-presentation/releases).

Önceki entegrasyonun repo oluşturma engeli, Windows bilgisayardaki yetkili GitHub CLI kullanılarak giderildi. 16 Ekim 2026 tarihinde Node.js 24.15.0 ile `npm ci`, üretim derlemesi, 20 Chromium kontrolü ve Windows başlatıcısıyla çalışan bağımsız pakette aynı 20 kontrol başarıyla tamamlandı. 319 kaynak metni/tablo hücresi PPTX ile karşılaştırıldı. Güncel kanıtlar [QA_REPORT.md](QA_REPORT.md) ve `qa/` altındadır; önceki ortamın raporları `qa/previous-environment/` içinde ayrıca etiketlenmiştir.

Windows'ta kurulu çevrimdışı sürümü proje kökündeki `Baslat-Sunum.bat` ile açabilirsiniz. Kaynak geliştirme için `npm run dev`, üretim önizlemesi için `npm run preview` kullanılır.
