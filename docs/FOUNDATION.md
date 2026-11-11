# Developer Revenue Platform — Faz 1 başlangıcı

## 1. Ürün özeti
Amaç: Creator'ların sahip oldukları public projeleri keşfedilebilir sunması; explorer'ların uygun projeyi hızlı bulması. Ücretsiz katalog; V1 ücretli karşılaştırma ve kotalı AI analizi. Rekabet avantajı özgün proje sunumu ve açıklanabilir keşif. Başlıca risk: ücretli keşif talebinin ve sürdürülebilir creator gelirinin doğrulanmaması.
Yapılacak işler: Creator/explorer görüşmeleri ve talep testi. Bağımlılık: gerçek katılımcılar. Bileşen: katalog. Kabul: gerçek, izinli ilk yayın. Test: import→publish kullanıcı testi. Tamamlanan: kapsam; kalan: saha doğrulaması.

## 2. Karar bekliyor
Marka/domain (DevShare yalnızca çalışma adı), şirket/satış/payout ülkeleri, hosting, fiyat, net gelir tanımı, havuz modeli, katkıcı payları, reklam ortağı, ilk kategori odağı. İlk arayüz İngilizce; başlangıç yalnızca GitHub import. Gerçek ödeme/payout için ürün sahibinin onayı ve uyumluluk doğrulaması gerekir.

## 3. Kapsam ve erişim matrisi
MVP: OAuth, public repo import ve ownership, proje/creator sayfaları, arama, save/follow, analytics, report ve moderasyon. Bu iterasyon katalog kabuğu ve SEO altyapısıdır; tüm MVP tamamlanmış değildir.
V1: abonelik, kotalı AI, fraud pipeline, denetlenebilir ledger ve uygunluk sonrası payout. V2: takım ve premium ürünler. İleri: talep doğrulanırsa Git hosting.
Anonim: yalnızca yayımlanmış projeleri okur. Üye: kendi save/follow kayıtları. Creator: yalnızca doğrulanmış kendi projeleri ve analytics. Moderator: rapor/gizleme; finans erişimi yok. Finance: mutabakat/payout review; creator token erişimi yok. Admin: açık yetki ve audit ile yönetim. UI gizleme erişim kontrolü değildir; her mutation sunucuda doğrulanmalı.
Kabul: başka creator projesini değiştirme isteği reddedilir. Test: IDOR, CSRF ve role escalation. Kalan: kimlik ve yetki uygulaması.

## 4. Sayfa haritası ve SEO
/ SSG landing; /explore SSR GET arama, noindex; /topics/[topic] kalite eşiği sonrası SSG; /projects/[owner]/[repo] yayımlanmış özgün içerik ile SSR/ISR; /developers/[handle] SSR; /pricing SSG; /for-developers SSG; /dashboard noindex ve ileride session zorunlu.
Proje başlığı: {name} — {purpose} | {brand}. Canonical yalnızca APP_URL doğrulandıktan sonra. JSON-LD: gerçek içerikle SoftwareSourceCode, ProfilePage ve BreadcrumbList. Demo/boş/thin sayfalar sitemap dışı. Facet URL'leri noindex. robots güvenlik sınırı değildir. Silinen proje 404/410; slug değişimi 301.
CWV bütçesi: LCP <=2.5 s, INP <=200 ms, CLS <=0.1; bunlar hedef, ölçülmüş sonuç değil. Sistem fontu ve server components başlangıç tercihi. Kalan: gerçek veri, domain, OG, Search Console ve RUM doğrulaması.

## 5. ADR-001 ve veri modeli
Mevcut hedefte proje yoktu. Next.js App Router + TypeScript, modüler monolith seçildi. Public HTML sunucuda üretilir. PostgreSQL üretim hedefidir; bu iterasyonda DB kurulu olduğu varsayılmaz. Katalog şimdilik boş typed repository adapter ile çalışır; sentetik creator/gelir gösterilmez.
İlişkiler: User 1:N GitHubConnection; User 1:N Repository; Repository 1:1 RepositoryPage; Repository N:M Topic; User N:M Repository (Save/Follow); Repository 1:N EngagementDaily/ModerationReport. github_id ve github_repo_id unique; source ownership GitHub API kullanıcı ID'si ile eşleşir. RepositoryPage published+approved+özgün içerik eşiği sağlamadan indexlenmez.
Auth: güvenilir OAuth kütüphanesi; state/PKCE, HttpOnly/Secure/SameSite cookie, minimum izin; token server-side encrypted. Import public ve owner doğrulaması sonrası transaction. GitHub pagination/rate limits/401 revocation işlenmeli. README için ham HTML çalıştırılmamalı, allowlist sanitizer kullanılmalı.
Event pipeline: schema doğrulama→rate limit→kısa ömürlü oturum dedup→creator self-event dışlama→risk inceleme→günlük aggregate. Görüntüleme finansal hak yaratmaz. Finansal tutarlar integer minor unit/currency, immutable ledger ve unique idempotency key ile ileride uygulanacak.
Kabul/test: XSS, sahiplik, dedup, revocation, çift worker, refund mutabakatı. Kalan: bu güvenlik kritik backend modülleri.

## 6. UI/UX
İngilizce, açık zemin, koyu mürekkep ve lime vurgu. Header→hero/arama→kategori→katalog→creator çağrısı→footer. Mobil tek kolon, görünür focus, skip link, label ve empty state. Dark mode sonraki iterasyon.

## 7–8. Uygulama ve test
Tamamlanan: Next.js iskeleti, responsive landing, SSR arama/filtre kabuğu, kategori rotaları, fiyatlandırma ve creator açıklaması, robots/sitemap, noindex varsayılanı, güvenlik header'ları. Kalan: OAuth credential, DB/migration, gerçek import/publish, save/follow, analytics, moderation ve gerçek proje/creator sayfaları.
Kontroller: build, TypeScript, route HTTP ve SSR smoke. Tam MVP kabulü için integration/E2E, güvenlik ve erişilebilirlik kontrolleri backend ile eklenecek. Test geçmeden üretim hazır denmez.

## 9. Operasyon
.env.example gerçek secret içermez. APP_URL gerçek domain olmalı; ALLOW_INDEXING yalnızca içerik ve legal kontrol sonrası açılmalı. Preview/staging/production secrets ayrılmalı. CI typecheck+build; DB gelince migration staging provası, şifreli backup ve restore testi, expand/contract rollback gerekir. Monitoring için PII/token redaction zorunlu; servis seçimi bekliyor.

## 10. Lansman
Kalan: marka/domain, legal/privacy/copyright incelemesi, creator izni, OAuth, restore provası, abuse/support süreçleri, Search Console, gerçek CWV ve SEO testleri. Checkout ve payout bu sürümde bulunmaz. Gerçek kullanıcı kazanımı veya gelir iddiası yoktur.
