# CircleCI ile React UI/UX Testleri

Bu ödev, örnek bir React e-ticaret uygulamasının UI ve temel kullanılabilirlik akışlarını Playwright ile test eder. CircleCI testleri Chromium ile çalıştırır. Ödeme sistemi ve gerçek kullanıcı araştırması içermez.

## Dosya yapısı

```text
.circleci/config.yml       CircleCI iş akışı
public/index.html          Türkçe HTML şablonu
src/App.jsx                Ana sayfa, ürünler ve sepet
src/index.js               React giriş dosyası
src/index.css              Yerel Tailwind stilleri
scripts/lint-translations.js
tests/example.spec.js      14 UI/UX senaryosu
playwright.config.js       Tarayıcı, sunucu ve rapor ayarları
docs/INCELEME.md           Sorunlar ve düzeltmeler
docs/SUNUM-NOTLARI.md      24 Kasım için güncel anlatım
```

## Kurulum ve Çalıştırma

1. Proje klasörünü açın ve terminalde bağımlılıkları yükleyin:
   ```bash
   npx --yes yarn@1.22.22 install --frozen-lockfile
   ```
2. Geliştirme sunucusunu başlatın:
   ```bash
   npm start
   ```

## Kalite Kontrolleri

Node.js 22 ve Yarn Classic 1.22 kullanın. CI, Node.js 22.12.0 kullanır.
Windows PowerShell betikleri engellerse `npm.cmd` ve `npx.cmd` kullanın.

```bash
npm run lint
npm run lint:translations
npm run build
```

`lint:translations`, şu an tek dil olan Türkçe arayüz için sayfanın `lang` değerini ve başlığını doğrular. Çeviri kataloğu veya çoklu dil altyapısı henüz bulunmamaktadır.

## UI/UX uçtan uca testleri

14 senaryo: Türkçe içerik, alışverişe geçiş, bütün kategoriler ve filtre sıfırlama, aynı üründen birden fazla ekleme, farklı ürünlerin toplamı, kaldırma sonrası yeniden hesaplama, boş sepet, örnek sipariş mesajı, klavye ile alışveriş, sepet değişikliği bildirimi ve 320/375/768/1280 px ekranlarda ana sayfa/ürünler/dolu sepet. Stil çıktısının yüklendiği de doğrulanır. Bunlar tam UX araştırması veya tam erişilebilirlik denetimi değildir.

```bash
npx playwright install chromium
npm run test:e2e
npx playwright show-report
```

Playwright kendi sunucusunu açar; testten önce 3000 portundaki geliştirme sunucusunu kapatın.
HTML raporu `playwright-report/`, JUnit ve hata kanıtları `test-results/` altında oluşturulur.
Unit test dosyası bulunmadığı için CI'da boş testleri başarılı gösteren komut yerine build ve gerçek E2E testleri çalıştırılır.
Sipariş testi yalnızca demo tarayıcı mesajını doğrular; ödeme veya sipariş servisi yoktur.

## CircleCI'da çalıştırma

1. Düzeltilmiş dosyaları bu GitHub deposuna yükleyin.
2. CircleCI hesabında `ffnobari/sistem-analizi-ui-ux-testler2` deposunu bağlayıp `.circleci/config.yml` ile pipeline başlatın.
3. `build-and-test` işindeki kontrolleri ve test sonuçlarını açın.
4. Artifacts içinden `playwright-report/index.html` dosyasını gösterin. JUnit sonuçları test sonuçları sekmesine aktarılır. Hatalarda ekran görüntüsü ve trace, görünüm testlerinde sepet ekran görüntüsü saklanır.
5. Gerçek run bağlantısını, commit kimliğini ve tarihi sunuma ekleyin. Yerel başarı CircleCI başarısı değildir.

Varsayılan `ui-ux-tests` workflow'u yalnızca ödev kontrollerini çalıştırır. Mevcut deploy işi korunmuştur; yayın için pipeline parametresi `run_deploy=true` verilmelidir. Bu ek workflow `main` üzerindeki başarılı testlerden sonra Cloudflare Pages yayını, sürüm artırımı ve GitHub release işlemleri yapar. Yayın için CircleCI ortamında `CLOUDFLARE_API_TOKEN` ve `GITHUB_TOKEN`, bildirimler için `SLACK_WEBHOOK_URL` gerekir. Cloudflare hesap kimliği yapılandırmada bulunur. `GITHUB_REPOSITORY` verilmezse CircleCI proje değişkenlerinden hesaplanır. Ödev testleri bu yayın anahtarlarına ihtiyaç duymaz. İnceleme sırasında deploy, Slack bildirimi veya GitHub'a push yapılmamıştır.

## Sunum

Eski `UI-UX-CircleCI-Sunum.pptx`, başka depo adını ve önceki 4 testlik yerel sonucu içerir; güncel kanıt olarak kullanılmamalıdır. Doğru depo adı ve yeni kapsam için [sunum notlarını](docs/SUNUM-NOTLARI.md), tespitler için [inceleme raporunu](docs/INCELEME.md) kullanın. Ramazan Hoca'nın dokümanı depoda bulunmadığından onun özel koşulları ayrıca kontrol edilmelidir.

Kaynaklar: [CircleCI](https://circleci.com/docs/reference/configuration-reference/), [Playwright CI](https://playwright.dev/docs/ci), [React Scripts klasörleri](https://create-react-app.dev/docs/folder-structure/).
