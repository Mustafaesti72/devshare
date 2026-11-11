# Product workspace redesign

## Amaç

İlk boş katalog kabuğunu tutarlı, ayrıntılı ve denenebilir bir keşif ürününe dönüştürmek. Ana akış: ara → incele → kaydet → karşılaştır. İngilizce ürün metinleri doğrudan işlevi anlatır.

## Yapılan işler

Sol gezinme, üst konum bilgisi, editoryal koleksiyon alanları, proje kartları ve sağ seçki sütunu. Responsive düzen, açık/koyu tema ve çizgi ikon sistemi. Altı kurgusal proje ve üç örnek koleksiyon, her sayfada demo açıklamasıyla sunulur. Gerçek creator doğrulaması ima edilmez.

Canlı arama, kategori/dil/lisans filtreleri, sıralama, grid/list, local save ve üçlü compare çalışır. Proje/creator/koleksiyon rotaları server-rendered başlangıç HTML sunar. README içeriği bu sürümde statik React metnidir; harici HTML render edilmez.

Creator studio: dönem seçimi, örnek chart, örnek kaynak kırılımı, tablo ve CSV export. Para ekranında sayı üretilmez; payout kapalı. Dört adımlı import/publish sandbox herhangi bir GitHub çağrısı veya server mutation yapmaz. Rapor formu dışarı veri göndermez.

## Bileşenler

src/components: workspace, discovery, project-card, project-detail, comparison, creator-studio, icon.
src/lib/catalog.ts: typed fictional fixtures.
src/app: route wrappers, metadata ve responsive CSS tokens.
Browser state: useSyncExternalStore, localStorage + memory fallback, storage event subscriptions. Secret/token içermez.

## Kabul ve test

Kullanıcı arama/filtre ile sonuçları daraltır; save yenileme sonrası kalır; karşılaştırma en fazla üç proje alır; onboarding tüm dört adımı geçer; forms zorunlu alanları doğrular; 390px mobilde yatay taşma olmaz; tema değişir. Demo içerik indexlenmez. README HTML/XSS kaynağı yoktur.

## Bağımlılıklar / riskler

OAuth/DB/gerçek import ve backend moderasyon henüz yok. Sample metrikler gerçek trafik değildir. Yerel kaydetme cihazlar arasında senkronize edilmez. Creator dashboard public demo olduğundan kişisel veri sunmaz. Production auth kontrolü yerine kullanılmamalı.

## Tamamlananlar / kalanlar

Görsel ürün revizyonu ve local etkileşimler tamamlandı. Sıradaki backend fazı: session/OAuth, public repo ownership doğrulaması, PostgreSQL migration, yayınlama ve moderasyon. Ödeme/AI bağlantıları bu fazın dışında.

## Doğrulama sonucu
- Üretim build ve TypeScript başarılı; 33 rota üretildi.
- ESLint: hata/uyarı yok.
- Katalog: 3 test başarılı. SSR/SEO smoke: 10 test başarılı.
- Tarayıcı: keyword arama, local save, reload sonrası save, iki proje compare, Python+MIT filtreleme, dört adımlı sandbox ve isim düzenleme doğrulandı.
- 390x844: proje detayı, mobil menü ve koyu tema incelendi; document scrollWidth/clientWidth 390/390.
- Sandbox adım atlama hatası panel key ile düzeltildi ve tekrar test edildi.
- Gerçek OAuth, server mutation, ödeme ve payout doğrulaması bu test kapsamına girmez.
