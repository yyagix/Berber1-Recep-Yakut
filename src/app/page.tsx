import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

const reviews = [
  { name: "Yusuf Kagan", time: "8 ay önce", avatar: "/reviews/yusufkagan.jpg", text: "Salon gayet güzel çalısanları guzel yüzlü samimuyetle karşılıyorlar. Her gittiğimde Taha beye tarş olurum gayet ilgili cana yakın biri ve işini profesyonelce yapıyor. Gönül rahatlığıyla gidilir." },
  { name: "Abdullah Şahin", time: "7 ay önce", avatar: "/reviews/abdullahsahin.jpg", text: "Kesinlikle 10 numara 5 Yıldız. Hizmet, saygı, üslup , müşteri memnuniyeti her şey çok iyi. Uzun zamandır bir berberden kafam böyle rahat çıktığımı hatırlamıyorum ilk gelişimde yazmadım bu şu an belki 20. Gelişim istediğiniz saç kesimini gösterin veya tarif edin yeterli. Zaten hepsi yarışmalarda derece almış işlerinde ehil insanlar. Ben Emir beye traş oluyorum ve çok memnunun. Gelin görün zaten direkt çevrenize önerirsiniz 🙏🏻" },
  { name: "Baran Ezer", time: "bir yıl önce", avatar: "/reviews/baranezer.jpg", text: "Motorla yanlarından geçerken gördüm güzel görünüyordu dışardan saçlarımı kestirdim keratin yaptırdım Çok memnun kaldım her geldiğimde keratin yaptırıyorum artık. Herkese tavsiye ederim" },
  { name: "Hasbi Samed Demir", time: "3 hafta önce", avatar: "/reviews/hasbisameddemir.png", text: "2025 mart ayında denemek için geldim Sezai usta traşımı yaptı çok memnunum çok profesyonel bir ekiple çalışıyorlar gerek saç kesimi olsun gerek bakım olsun kaş alma olsun çok memnun kalacağınız bir berber..." },
  { name: "Mert Arslan", time: "4 ay önce", avatar: "/reviews/mertaslan.jpg", text: "İlk defa denemek için geldiğim kuaförde hizmetten ve Emirhan kardeşimin tıraşından çok memnun kaldım uzun bir aradan sonra istediğim berberi buldum ilgi alaka her şey çok güzeldi." },
  { name: "Ömür efe Manga", time: "bir ay önce", avatar: "/reviews/omurefemanga.jpg", text: "Bir arkadaşımın önerisi üzerine gelmiştim gerçekten çok kaliteli ve iyi bir berber çalışanları gerçekten mükemmel beni Taha abi tıraş etti çok başarılı ve bir o kadarda deneyimli." },
  { name: "Furkan Soyutürk", time: "4 ay önce", avatar: "/reviews/furkansoyturk.png", text: "Emirhan Bey'e tıraş oldum. Yaptığı tıraştan çok memnunum. Yeteneği makas tutuşundan belli oluyor. Genel olarak Recep Yakut Hair Academy'de herkesin ilgi ve alakası yüksekti." },
  { name: "eren keskin", time: "bir ay önce", avatar: "/reviews/erenkeskin.png", text: "instagram üzerinden görüp taha beye gitmiştim dükkandaki ekip arkadaşları çok ilgililer hizmetleri 10/10 güler yüzle karşılıyolar traş konusundada taha beye çok teşekkür ediyorum." },
  { name: "ismail kopar", time: "bir yıl önce", avatar: "/reviews/ismailkopar.png", text: "Sezai ustamıza yapmış olduğu başarılı kesimlerden dolayı çok teşekkür ediyoruz. Ben dahil 3 arkadaşım her zaman birlikte traş olduğumuz bir yer. Herkese tavsiye ederim." },
  { name: "Ahmet Burak Çakır", time: "8 ay önce", avatar: "/reviews/ahmetburakcakir.jpg", text: "Dükkan temizliği, ferahlığı, genişliği ve ilgi alakalarıyla düşünmeden hizmet alabilirsiniz. Hair artist olarak Taha Çayırlı kardeşimize kuşkusuz traş olabilirsiniz." },
  { name: "Onur Acer", time: "5 ay önce", avatar: "/reviews/onuracer.png", text: "Ankara'ya yeni atandım gitmedigim berber kalmadı hiç bir yer buranın çeyreği etmez o kadar söylüyorum 27 yaşındayım hayatımın en iyi tıraşını oldum adamlar işinin ehli." }
];



export default async function Home() {
  const dbBarbers = await prisma.barber.findMany({
    orderBy: { createdAt: "asc" }
  });

  // Extract images from barbers for the homepage gallery
  const dynamicGallery = dbBarbers.flatMap(b => b.gallery).filter(Boolean);
  const displayGallery = dynamicGallery.slice(0, 4);
  const remainingCount = dynamicGallery.length > 4 ? dynamicGallery.length - 4 : 0;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-foreground selection:bg-primary selection:text-black overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative h-[100svh] flex flex-col items-center justify-center px-6 text-center border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2000&auto=format&fit=crop" 
            alt="Barbershop Background" 
            fill 
            sizes="100vw"
            className="object-cover opacity-[0.15]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-16">
          <span className="text-[#d4af37] tracking-[0.4em] text-sm md:text-base uppercase mb-6 font-bold">Premium Erkek Kuaförü</span>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-[1.1] font-heading drop-shadow-2xl">
            RECEP YAKUT
          </h1>
          <h2 className="text-4xl md:text-6xl text-[#d4af37] italic font-heading mb-8 drop-shadow-xl">Hair Academy</h2>
          <p className="text-[#aaaaaa] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Sanatın ve ustalığın buluştuğu nokta. Kendi tarzını keşfetmek için doğru yerdesin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="#kadromuz" className="px-10 py-5 bg-[#d4af37] text-black font-bold text-lg rounded-sm hover:bg-white active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              Uzmanını Seç & Randevu Al
            </a>
            <Link href="/randevularim" className="px-10 py-5 bg-transparent border border-white/20 text-white font-bold text-lg rounded-sm hover:bg-white/10 active:scale-95 hover:border-white transition-all duration-300 backdrop-blur-sm">
              Randevularımı Yönet
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="hakkimizda" className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="w-full aspect-video lg:h-auto lg:aspect-square relative rounded-2xl lg:rounded-sm overflow-hidden border border-white/10 shadow-2xl shrink-0">
            <Image 
              src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop" 
              alt="Recep Yakut" 
              fill 
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-all duration-1000"
            />
          </div>
          <div className="text-center lg:text-left flex-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 font-heading text-white">Mükemmelliğin İmzası</h2>
            <div className="w-16 lg:w-24 h-[2px] bg-[#d4af37] mb-6 lg:mb-8 mx-auto lg:mx-0"></div>
            <p className="text-[#aaaaaa] text-base md:text-lg lg:text-xl mb-4 lg:mb-6 leading-relaxed">
              Recep Yakut Hair Academy, klasik berber anlayışını modern ve elit bir seviyeye taşıyor. Biz sadece saç kesmiyoruz; karakterinize, yüz hatlarınıza ve yaşam tarzınıza en uygun imajı tasarlıyoruz.
            </p>
            <p className="text-[#aaaaaa] text-base md:text-lg lg:text-xl leading-relaxed">
              Özenle seçilmiş ve eğitilmiş uzman kadromuzla, kapıdan girdiğiniz andan itibaren kendinizi özel hissedeceğiniz bir deneyim sunuyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section id="kadromuz" className="py-24 px-6 bg-[#111111] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 font-heading text-white">Uzman Kadromuz</h2>
            <div className="w-24 h-[2px] bg-[#d4af37] mx-auto mb-6"></div>
            <p className="text-[#aaaaaa] text-xl">Size en uygun stili yaratacak ustalarımızla tanışın.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dbBarbers.map((barber) => (
              <Link 
                href={`/${barber.slug}`} 
                key={barber.id}
                className="group flex items-center gap-5 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 hover:border-[#d4af37]/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#0a0a0a] flex items-center justify-center shadow-inner">
                  {barber.image ? (
                    <Image 
                      src={barber.image} 
                      alt={barber.name} 
                      fill
                      sizes="96px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-[#d4af37] font-heading font-bold text-3xl uppercase tracking-widest opacity-80">
                      {barber.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left flex-1">
                  <h3 className="text-xl md:text-2xl font-bold font-heading text-white group-hover:text-[#d4af37] transition-colors">{barber.name}</h3>
                  <span className="text-[#888888] text-sm mt-1 flex items-center gap-1.5 group-hover:text-white transition-colors">
                    Hemen Randevu Al 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section (Auto Scrolling Marquee) */}
      <section id="yorumlar" className="py-24 bg-[#0a0a0a] overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 12px)); }
          }
          .animate-marquee {
            animation: marquee 45s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div>
              <h2 className="text-5xl font-bold mb-4 font-heading text-white">Misafir Yorumları</h2>
              <div className="w-24 h-[2px] bg-[#d4af37] mb-6"></div>
              <p className="text-[#aaaaaa] text-xl">Bizim için en değerli referans, misafirlerimizin memnuniyetidir.</p>
            </div>
            
            {/* Google Rating Badge */}
            <div className="flex items-center gap-4 bg-[#111111] border border-white/10 p-6 rounded-2xl shadow-xl shrink-0">
              <div className="text-center">
                <span className="text-5xl font-bold text-white">5.0</span>
                <div className="flex gap-1 mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-[#fbbc05] drop-shadow-[0_0_8px_rgba(251,188,5,0.6)]" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="w-px h-16 bg-white/10 mx-2"></div>
              <div>
                <p className="text-lg font-bold text-white mb-1">Recep Yakut Hair Academy</p>
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-4 h-4" />
                  <p className="text-[#888888] text-sm">839+ Değerlendirme</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee Container (Doubled array for seamless infinite loop) */}
        <div className="relative w-full flex overflow-hidden group">
          <div className="flex gap-6 animate-marquee pl-6 shrink-0 w-max">
            {[...reviews, ...reviews].map((review, idx) => (
              <div key={idx} className="flex-none w-[380px] bg-[#111111] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-colors flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-tight">{review.name}</h4>
                      <span className="text-xs text-[#888888]">{review.time}</span>
                    </div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5 opacity-80" />
                </div>
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-[18px] h-[18px] fill-[#fbbc05] drop-shadow-[0_0_5px_rgba(251,188,5,0.4)]" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-[#cccccc] text-[15px] leading-relaxed flex-grow">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeri" className="py-24 px-6 bg-[#111111] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 font-heading text-white">Galeri</h2>
            <div className="w-24 h-[2px] bg-[#d4af37] mx-auto mb-6"></div>
          </div>
          {dynamicGallery.length === 0 ? (
            <div className="text-center py-20 text-[#888888] bg-[#0a0a0a] rounded-2xl border border-white/5">
              <p>Henüz fotoğraf yüklenmedi.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {displayGallery.map((img, idx) => {
                  const isLast = idx === 3;
                  const hasMore = remainingCount > 0;
                  
                  return (
                    <Link href="/galeri" key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group shadow-lg block">
                      <Image 
                        src={img} 
                        alt={`Gallery Image ${idx + 1}`} 
                        fill 
                        className="object-cover transition-all duration-700 group-hover:scale-110" 
                      />
                      {isLast && hasMore && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-4xl text-white font-bold transition-all duration-300 group-hover:bg-black/40">
                          +{remainingCount}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
              
              <div className="text-center">
                <Link href="/galeri" className="inline-block px-8 py-4 border border-[#d4af37] text-[#d4af37] font-bold rounded-lg hover:bg-[#d4af37] hover:text-black active:scale-95 transition-all duration-300">
                  Tüm Galeriyi Gör
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-8 font-heading text-white">İletişim & Konum</h2>
            <div className="w-24 h-[2px] bg-[#d4af37] mb-10"></div>
            
            <div className="space-y-8 text-xl">
              <div className="flex flex-col border-b border-white/10 pb-6">
                <span className="text-[#d4af37] font-bold mb-2 uppercase tracking-widest text-sm">Adres</span>
                <span className="text-[#cccccc]">Atakent, 1477. Sk. 7/A, 06790 Etimesgut/Ankara, Türkiye</span>
              </div>
              <div className="flex flex-col border-b border-white/10 pb-6">
                <span className="text-[#d4af37] font-bold mb-2 uppercase tracking-widest text-sm">Telefon</span>
                <a href="tel:+905523698624" className="text-white hover:text-[#d4af37] transition-colors font-semibold">+90 552 369 86 24</a>
              </div>
              <div className="flex flex-col border-b border-white/10 pb-6">
                <span className="text-[#d4af37] font-bold mb-2 uppercase tracking-widest text-sm">Çalışma Saatleri</span>
                <span className="text-[#cccccc]">Haftanın Her Günü 09:00 - 21:00 <br/><span className="text-sm opacity-50">(Pazar Günleri Hariç)</span></span>
              </div>
            </div>
          </div>
          <div className="aspect-square bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-2">
            <iframe 
              src="https://maps.google.com/maps?q=Atakent,%201477.%20Sk.%207%2FA,%2006790%20Etimesgut%2FAnkara,%20T%C3%BCrkiye&t=&z=17&ie=UTF8&iwloc=&output=embed" 
              width="100%" 
              height="100%" 
              className="rounded-xl"
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>

      <footer className="py-16 text-center border-t border-white/10 bg-[#050505]">
        <h2 className="text-3xl font-bold mb-6 font-heading text-white tracking-widest">
          RECEP YAKUT <Link href="/admin/login" className="text-[#d4af37] font-light italic hover:text-white transition-colors cursor-default">Hair Academy</Link>
        </h2>
        
        <div className="flex items-center justify-center gap-6 mb-8">
          <a href="https://www.instagram.com/recep_yakut_hair_academy/" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#d4af37] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.youtube.com/@Recepyakutasmr" target="_blank" rel="noopener noreferrer" className="text-[#666666] hover:text-[#d4af37] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
          </a>
          <a href="tel:+905523698624" className="text-[#666666] hover:text-[#d4af37] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
        </div>

        <p className="text-sm text-[#666666] tracking-wider">
          &copy; {new Date().getFullYear()} Tüm Hakları Saklıdır.
        </p>
      </footer>
    </main>
  );
}
