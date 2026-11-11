# Workbench iteration — 11 Kasım 2026

## Amaç

Keşif iskeletini, somut inceleme ve karar verme işleri yapılabilen bir araştırma alanına dönüştürmek. İngilizce arayüz; Türkçe teknik kayıt. Mevcut Next.js App Router ve TypeScript yapısı korundu.

## Yapılan işler

1. Görsel hiyerarşi: okunabilir tipografi, koyu editoryal seçki alanı, etkileşimli seçki geçişleri, her örnek proje için ayrı code-native arayüz çalışması. Kartlarda hızlı görünüm; dekoratif önizlemeler gerçek çalışan projeler gibi sunulmaz.
2. Komut araması: Cmd/Ctrl+K, klavyeyle sonuç seçimi, modal focus ve Escape. Native dialog focus trap sağlar.
3. Kişisel koleksiyonlar: isim/açıklama/renk, proje üyeliği, arşivleme ve geri alma. Proje hızlı görünümü ve detayından koleksiyona ekleme.
4. Araştırma kütüphanesi: not, karar durumu, liste/board ve cihazda kalıcılık. Katalog örnekleri ve gerçek GitHub snapshot'ları ayrı görünür.
5. GitHub inspector: gerçek public metadata, canonical kaynak linki, eksik lisans/dil durumu, fetch timestamp, local referans kaydı. Kaynaklar kişisel koleksiyonlara eklenir ve notlanır; sahiplik iddiası oluşturulmaz.
6. Paylaşılabilir arama URL'leri: query/kategori/dil/lisans/sıralama/görünüm sunucu HTML'inde geri yüklenir.

## Dosyalar / bileşenler

- src/components/discovery-feature.tsx, project-visual.tsx, quick-view.tsx, modal.tsx, command-menu.tsx
- src/components/research-library.tsx, research-actions.tsx, source-reference-card.tsx
- src/components/github-inspector.tsx, src/app/api/github/route.ts
- src/lib/browser-store.ts, research.tsx, research-data.ts, github-input.ts, source-references.ts
- src/app/inspect, library/[id], saved, collections, workbench.css

## Veri modeli ve erişim

Collection {id,name,description,color,projectIds,archived}; ResearchNote {text,status}; SourceSnapshot {GitHub public metadata,fetchedAt}. Kişisel kayıtlar sadece browser-local; sunucuya gönderilmez. Public API proxy yalnızca GitHub repository metadata okur. GitHub sahibi doğrulanmış creator olarak gösterilmez. Publish sandbox ve finans ekranları demo olarak kalır.

## Güvenlik / bağımlılıklar

Fixed upstream api.github.com; owner/repo allowlist parser; HTTPS GitHub URL'lerinde credential, port, query/hash ve extra path reddi; redirect:error; 8 saniye timeout. Private veya desteklenmeyen yanıt reddedilir. 45 uncached request/saat/process ve 3 eşzamanlı request sınırı; 5 dakika cache. Rate-limit, 404 ve upstream/network hata durumları ayrı işlenir. Dağıtık üretim rate limiter değildir.

Snapshot parser canonical URL'yi kendisi kurar, bozuk local alanları normalize eder. Metadata/notes React text olarak render edilir, raw HTML yürütülmez. Keyler veya OAuth token'ları bulunmaz. localStorage quota hatasında memory fallback; tabs arası storage event senkronizasyonu.

## Kabul ve test senaryoları

- Public repo sorgusu gerçek GitHub metadata'sını döndürür; lisans/dil yoksa sahte değer gösterilmez.
- Snapshot kaydet → koleksiyona ekle → not yaz → koleksiyon detayında göster.
- Koleksiyon oluştur/düzenle/arşivle/restore; not ve karar durumu reload sonrası korunur.
- Güvensiz URL/SSRF hedefi upstream çağrısı yapılmadan 400 döner.
- Modal klavyeyle kullanılır, mobil navigasyon ve 390px taşma kontrol edilir.
- Preview sayfalar noindex ve sitemap dışındadır.

## Tamamlananlar / kalanlar

Bu kayıt altında açıklanan local işlevler ve gerçek public metadata okuması tamamlandı. Kalan: hesap/session, kalıcı sunucu DB'si ve sync, creator OAuth/ownership, gerçek import/publish, server moderasyonu, dağıtık rate limiting, AI ve ödeme altyapısı. Marka ve şirket/payout kararları önceki belgede karar bekliyor. Checkout/payout aktif değildir.

## Doğrulama kaydı

- Tarayıcıda: proje quick view, koleksiyon create ve üyelik, arşiv/restore, private note/status, reload kalıcılığı, command search/Enter navigation.
- Gerçek octocat/Hello-World sorgusu: API 200; metadata source GitHub; missing license/language doğru gösterildi. Snapshot araştırma kütüphanesi ve koleksiyonda notuyla görüntülendi.
- 390px mobilde inspector ve koleksiyonlarda scrollWidth/clientWidth 390/390. Masaüstü 1440px görsel QA yapıldı.
- Otomatik kontrollerin son sonuçları teslim mesajında raporlanır. Üretim yük testi veya mali uyumluluk doğrulaması iddiası yoktur.

GitHub API referansı: https://docs.github.com/en/rest/repos/repos
Rate limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
