# İLEFBot — BAİBÜ İletişim Fakültesi Asistanı

OpenRouter destekli, mobil uyumlu, bağımsız öğrenci sohbet uygulaması. **Resmî BAİBÜ hizmeti değildir.** Güncel akademik işlemlerde [fakültenin resmî sayfası](https://ilef.ibu.edu.tr/) ve akademik danışman esas alınmalıdır.

## Özellikler
- OpenRouter `openrouter/free` ile ücretsiz model yönlendirme; sunucu yalnızca ücretsiz model varyantlarına izin verir.
- OpenRouter'ın mevcut sıfır maliyetli ücretsiz modellerinden seçim; katalog alınamıyorsa otomatik ücretsiz yönlendirme.
- Çoklu sohbet; yeniden adlandırma, silme, eski sürümden sohbet aktarımı ve TXT dışa aktarma.
- Mobil arayüz, koyu/açık/sistem teması, hızlı soru önerileri, yanıtı durdurma, mesaj kopyalama ve Ctrl+K.
- Sohbetler tarayıcıda saklanır (en fazla 30 sohbet ve sohbet başına 60 mesaj).
- Yerel deneme için kişisel OpenRouter anahtarı; yalnızca `sessionStorage` içinde.

## Vercel kurulumu
1. GitHub deposunu Vercel'e bağla; **Framework Preset: Other**. Proje kökünü kullan, build komutu ve output directory ayarlarını boş bırak.
2. [OpenRouter anahtarı oluştur](https://openrouter.ai/settings/keys). Özellikle bu demo için ayrı bir anahtar kullan ve mümkünse harcama limiti koy.
3. Vercel → Project → Settings → Environment Variables: `OPENROUTER_API_KEY` ekle. Production ve test edeceğin Preview ortamlarına ata; yeniden deploy et.
4. Sitede Ayarlar → kişisel anahtar alanını **boş** bırakırsan ziyaretçiler Vercel sunucu fonksiyonunu kullanır. Sunucu anahtarı tarayıcıya iletilmez.

**Güvenlik ve kota:** Herkese açık `/api/chat` demo endpoint'i ortak OpenRouter kotasını tüketir. Origin kontrolü kimlik doğrulaması değildir. Trafiğe açmadan önce kalıcı IP/kullanıcı bazlı hız sınırlama, Vercel Firewall/bot koruması ve hesap kotası izlemesi önerilir. Ücretli modellere bilerek izin verilmemiştir.

## Yerelde deneme
`index.html` dosyasını açabilirsin. Yapay zekâ yanıtı için Ayarlar'a kendi OpenRouter anahtarını gir. Tarayıcı `file://` bağlantılarında çapraz kaynak API çağrısını engelliyorsa `python3 -m http.server 8000` komutuyla `http://localhost:8000` aç. Sunucu fonksiyonlarını yerelde çalıştırmak için `vercel dev` kullan.

## Gizlilik
Sohbet geçmişi tarayıcıdaki `localStorage` içinde tutulur. Yanıt vermek için son mesajlar OpenRouter'a ve seçilen model sağlayıcısına gönderilir. Paylaşılan bilgisayarda geçmişi sil; şifre, kimlik numarası vb. hassas bilgileri yazma. Kişisel API anahtarı uygulama koduna eklenmez.

## Teknoloji
Vanilla HTML, CSS, JavaScript ve Vercel Node serverless fonksiyonları. Derleme veya paket yükleme gerektirmez.
