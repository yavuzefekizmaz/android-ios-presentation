# GitHub yayını

Public depo: https://github.com/yavuzefekizmaz/android-ios-presentation

16 Ekim 2026 tarihinde Windows bilgisayardaki GitHub CLI, `yavuzefekizmaz` hesabında `repo` ve `workflow` yetkileriyle doğrulandı. Yeni public depo başarıyla oluşturuldu; önceki bağlı entegrasyonun `createRepository` engeli giderildi.

Tekrarlanabilir yerel doğrulama:

```powershell
npm ci
npm run build
npx playwright install chromium
npm run preview -- --port 4173
```

Başka terminalde:

```powershell
npm test
python scripts/verify-source.py
npm run package
```

Kaynaklar `main` dalında tutulur. GitHub Actions, push/PR ile Node.js 22 üzerinde derleme ve Chromium testlerini çalıştırır. Sonuç ve artifact'lar deponun Actions sekmesindedir.

Release indirmeleri: https://github.com/yavuzefekizmaz/android-ios-presentation/releases

Canlı Pages adresi: https://android-ios-presentation.pages.dev/

Pages yayını yetkili yerel Wrangler oturumundan Direct Upload ile yapılır. Cloudflare'ın mevcut Git kurulumundaki `8000011` hatası nedeniyle otomatik Pages dağıtımı kurulmadı; GitHub Actions derleme ve test doğrulamasını sürdürür. Üretim çıktısı `dist/`, üretim dalı `main` ve Node.js ayarı `22`'dir. Kimlik bilgileri GitHub'a aktarılmadı.

`.gitignore` bağımlılıkları, ZIP/derleme/geçici dosyaları, `.env*`, `.dev.vars*` ve `.wrangler/` klasörünü dışlar. Cloudflare giriş bilgileri kaynaklara veya Release'e konmaz. Güncel yerel ve canlı denetim kanıtları `QA_REPORT.md` ve `qa/` altındadır.
