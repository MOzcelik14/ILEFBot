# İLEFBot

BAİBÜ İletişim Fakültesi öğrencileri için bağımsız, istemci tarafında çalışan genel rehber.

## Özellikler

- Sunucu, yapay zekâ modeli veya API anahtarı gerektirmez.
- Ders kaydı, Erasmus, staj, akademik takvim, danışman, transkript, mezuniyet ve iletişim hakkında genel yönlendirme.
- `localStorage` üzerinden cihazda sohbet geçmişi (son 100 mesaj).
- TXT dışa aktarma ve onaylı geçmiş temizleme.
- Mobil tasarım, Türkçe arama, klavye kullanımı ve temel erişilebilirlik.

## Çalıştırma

`index.html` dosyasını tarayıcıda aç veya statik web barındırmaya yükle. Derleme gerektirmez.

## Bilgi tabanını güncelleme

`index.html` içindeki `knowledge` dizisine `terms` (Türkçe anahtar ifadeler) ve `answer` ekle. Öğrenciye gösterilen yanıtları yayımlamadan önce güncel resmî kaynaklardan doğrula.

## Sınırlar ve gizlilik

Bu sürüm üretken yapay zekâ değil, anahtar kelime tabanlı bir rehberdir. Resmî BAİBÜ hizmeti değildir ve kesin öğrenci işlemi yönlendirmesi vermez. Mesajlar ağ üzerinden gönderilmez; tarayıcının yerel depolama alanında saklanır ve aynı tarayıcı profilini kullanan biri tarafından görülebilir. Ortak cihazlarda geçmişi temizle.
