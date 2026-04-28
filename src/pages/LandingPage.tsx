import { Search, HeadphonesIcon, HelpCircle, Zap, ShieldCheck, Tag, CreditCard, Menu, X, ChevronRight, Phone, Star, Activity, Users, Clock, ThumbsUp, Instagram, Facebook, Youtube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from 'react-router-dom';
import 'swiper/css';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// --- Static App Default Data ---
const defaultPopularGames = [
  { id: '1', name: 'Mobile Legends', tags: 'Diamond, Starlight', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '2', name: 'Free Fire', tags: 'Diamond, Membership', img: 'https://images.unsplash.com/photo-1636489953081-c4eceee7b407?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '3', name: 'PUBG Mobile', tags: 'UC, Royale Pass', img: 'https://images.unsplash.com/photo-1598555231267-27a3ed1464fb?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '4', name: 'Genshin Impact', tags: 'Genesis Crystals, Welkin', img: 'https://images.unsplash.com/photo-1632288339599-2b638fc28045?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '5', name: 'Call of Duty: Mobile', tags: 'CP', img: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '6', name: 'Valorant', tags: 'Valorant Points', img: 'https://images.unsplash.com/photo-1623933568779-13e778fc3af1?auto=format&fit=crop&q=80&w=200&h=200' },
];

const features = [
  { icon: Zap, title: 'Instan & Otomatis', desc: 'Sistem bekerja secara otomatis, pesanan langsung masuk dalam hitungan detik setelah pembayaran berhasil dikonfirmasi.' },
  { icon: ShieldCheck, title: '100% Legal & Aman', desc: 'Jaminan keaslian produk. Transaksi aman dari risiko banned, akun Anda dijamin 100% aman.' },
  { icon: Tag, title: 'Harga Kompetitif', desc: 'Nikmati harga termurah dari pasaran dan penawaran promo menarik setiap harinya untuk semua game.' },
  { icon: CreditCard, title: 'Pembayaran Lengkap', desc: 'Mendukung metode pembayaran QRIS, E-Wallet (Dana, OVO, GoPay), Transfer Bank, hingga Alfamart/Indomaret.' },
];

const testimonials = [
  { name: 'Budi Santoso', role: 'Pro Player MLBB', text: 'Top up di sini beda banget sama yang lain. Prosesnya instan, 1 detik habis bayar, diamond langsung masuk ke akun saya. Nggak nyesel deh!', rating: 5 },
  { name: 'Siti Aminah', role: 'Gamer Casual', text: 'Harga selalu paling murah dan pelayanannya sangat responsif. CS selalu aktif 24 jam buat bantuin kalau ada kendala orderan.', rating: 5 },
  { name: 'Reza Oktovian', role: 'Streamer', text: 'Sangat recommended untuk teman-teman yang nyari tempat top up yang terpercaya. Garansi aman dan nggak pernah kena masalah.', rating: 5 },
];

const defaultPaymentLogos = [
  { id: '1', name: 'OVO', img: '' },
  { id: '2', name: 'QRIS', img: '' },
  { id: '3', name: 'DANA', img: '' },
  { id: '4', name: 'GoPay', img: '' },
  { id: '5', name: 'LinkAja', img: '' },
  { id: '6', name: 'ShopeePay', img: '' },
  { id: '7', name: 'BCA', img: '' },
  { id: '8', name: 'Mandiri', img: '' }
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteContent, setSiteContent] = useState<any>(null);
  const [games, setGames] = useState<any[]>(defaultPopularGames);
  const [paymentLogos, setPaymentLogos] = useState<any[]>(defaultPaymentLogos);
  const [featuresList, setFeaturesList] = useState<any[]>(features);
  const [testimonialsList, setTestimonialsList] = useState<any[]>(testimonials);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const unsubContent = onSnapshot(doc(db, 'site_content', 'landing'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteContent(docSnap.data());
      }
    });

    const unsubGames = onSnapshot(collection(db, 'games'), (snapshot) => {
      if (!snapshot.empty) {
        const fetchedGames = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setGames(fetchedGames);
      }
    });

    const unsubPayments = onSnapshot(collection(db, 'payment_methods'), (snapshot) => {
      if (!snapshot.empty) {
        setPaymentLogos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });

    const unsubFeatures = onSnapshot(collection(db, 'features'), (snapshot) => {
      if (!snapshot.empty) setFeaturesList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      if (!snapshot.empty) setTestimonialsList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    return () => {
      unsubContent();
      unsubGames();
      unsubPayments();
      unsubFeatures();
      unsubTestimonials();
    };
  }, []);

  // Fallbacks per variable
  const logoText = siteContent?.header?.logoText || 'VINZPEDIA';
  const headerPrefix = logoText.substring(0, 4);
  const headerSuffix = logoText.substring(4);
  
  const heroBadge = siteContent?.hero?.badgeText || 'Top-Up Platform #1 di Indonesia';
  const heroMain = siteContent?.hero?.titleMain || 'Platform Top-Up Game <span class="text-gold">Terbaik</span> di Indonesia';
  const heroDesc = siteContent?.hero?.description || 'Nikmati pengalaman top-up instan, harga termurah, dan jaminan aman 100%. Mulai perjalanan gaming terbaikmu bersama kami sekarang juga!';
  const heroImageSrc = siteContent?.hero?.imageSrc || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80';
  const cta1 = siteContent?.hero?.ctaPrimaryText || 'Mulai Top-Up';
  const cta2 = siteContent?.hero?.ctaSecondaryText || 'Pelajari Fitur';

  const stat1 = { val: siteContent?.hero?.stat1Value || '99%', lbl: siteContent?.hero?.stat1Label || 'Success Rate' };
  const stat2 = { val: siteContent?.hero?.stat2Value || '1s', lbl: siteContent?.hero?.stat2Label || 'Proses Instan' };
  const stat3 = { val: siteContent?.hero?.stat3Value || '5M+', lbl: siteContent?.hero?.stat3Label || 'Users Aktif' };
  const stat4 = { val: siteContent?.hero?.stat4Value || '24/7', lbl: siteContent?.hero?.stat4Label || 'Live Support' };

  const secGames = { sub: siteContent?.gamesSection?.subtitle || 'Katalog Produk', title: siteContent?.gamesSection?.title || 'Pilih Game <span class="text-gold">Favoritmu</span>', desc: siteContent?.gamesSection?.description || 'Ratusan pilihan produk voucher dan top-up untuk berbagai game mobile maupun PC kesayangan Anda.' };
  const secFeat = { sub: siteContent?.featuresSection?.subtitle || 'Keunggulan KAMI', title: siteContent?.featuresSection?.title || 'Mengapa Harus Top-Up di VindzPedia?', desc: siteContent?.featuresSection?.description || 'Kami berkomitmen memberikan kenyamanan, keamanan, dan kecepatan maksimal dalam melayani setiap transaksi yang Anda lakukan.' };
  const secTesti = { sub: siteContent?.testimonialsSection?.subtitle || 'Testimoni Pelanggan', title: siteContent?.testimonialsSection?.title || 'Kata Mereka Tentang <span class="text-gold">VinzPedia</span>', desc: siteContent?.testimonialsSection?.description || 'Ribuan gamers telah membuktikan sendiri kecepatan dan kenyamanan bertransaksi di situs kami.' };
  
  const footerDesc = siteContent?.footer?.description || 'Platform Top-Up Game Termurah & Terpercaya. Menyediakan layanan instan untuk berbagai macam kebutuhan gaming Anda.';
  const footerPhone = siteContent?.footer?.phone || '08779110477';
  const socialIg = siteContent?.footer?.socialIg || '#';
  const socialFb = siteContent?.footer?.socialFb || '#';
  const socialTt = siteContent?.footer?.socialTt || '#';
  const socialYt = siteContent?.footer?.socialYt || '#';

  const handleGameClick = (gameName: string) => {
    const text = encodeURIComponent(`Halo Admin ${logoText}, saya ingin order top-up game ${gameName}`);
    let phoneNum = footerPhone.replace(/[^0-9]/g, '');
    if (phoneNum.startsWith('0')) {
      phoneNum = '62' + phoneNum.slice(1);
    }
    window.open(`https://wa.me/${phoneNum}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans overflow-x-hidden selection:bg-gold selection:text-charcoal flex flex-col scroll-smooth">
      
      {/* 5. LINK NAVIGASI (Header) */}
      <nav className="sticky top-0 z-50 bg-[#111111]/95 backdrop-blur-md border-b border-white/5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo area */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group">
              {siteContent?.header?.logoImg ? (
                <img src={siteContent.header.logoImg} alt={logoText} className="h-10 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform duration-300">
                    <span className="text-charcoal font-black text-xl leading-none tracking-tighter">V</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-heading font-black text-2xl tracking-tight leading-none text-white uppercase group-hover:drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] transition-all">
                      {headerPrefix}<span className="text-gold">{headerSuffix}</span>
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Navigasi Utama Desktop */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="/#" className="font-bold text-white hover:text-gold transition-colors text-sm uppercase tracking-wider">Beranda</a>
              <a href="/#games" className="font-bold text-gray-300 hover:text-gold transition-colors text-sm uppercase tracking-wider">Kategori Game</a>
              <a href="/#manfaat" className="font-bold text-gray-300 hover:text-gold transition-colors text-sm uppercase tracking-wider">Keunggulan</a>
              <a href="/#testimoni" className="font-bold text-gray-300 hover:text-gold transition-colors text-sm uppercase tracking-wider">Testimoni</a>
              <Link to="/blog" className="font-bold text-gray-300 hover:text-gold transition-colors text-sm uppercase tracking-wider">Blog</Link>
            </div>

            {/* Right section */}
            <div className="hidden lg:flex items-center gap-4">
              <button className="font-bold text-gray-300 hover:text-gold transition-colors text-sm flex items-center gap-2 mr-4">
                <Search className="w-4 h-4" /> Lacak Pesanan
              </button>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Halo, {userProfile?.displayName || user.email?.split('@')[0]}</span>
                  <button onClick={() => signOut(auth)} className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-500 px-5 py-2.5 rounded-lg text-sm font-bold transition-all">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2.5 text-sm font-bold transition-colors">
                    Masuk
                  </Link>
                  <Link to="/signup" className="bg-gold hover:bg-yellow-400 text-charcoal px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all duration-300 shadow-[0_0_15px_rgba(255,215,0,0.4)] hover:shadow-[0_0_25px_rgba(255,215,0,0.6)] uppercase tracking-wider">
                    Daftar Sekarang
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gold hover:text-yellow-400"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1A1A1A] border-b border-white/5 absolute w-full left-0 origin-top animate-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-6 space-y-4 shadow-2xl flex flex-col">
              <a href="/#" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold p-3 hover:bg-white/5 rounded-lg uppercase tracking-wider text-sm">Beranda</a>
              <a href="/#games" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold p-3 hover:bg-white/5 rounded-lg uppercase tracking-wider text-sm">Kategori Game</a>
              <a href="/#manfaat" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold p-3 hover:bg-white/5 rounded-lg uppercase tracking-wider text-sm">Keunggulan Kami</a>
              <a href="/#testimoni" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold p-3 hover:bg-white/5 rounded-lg uppercase tracking-wider text-sm">Testimoni Pengguna</a>
              <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold p-3 hover:bg-white/5 rounded-lg uppercase tracking-wider text-sm text-gold">Blog Kami</Link>
              <hr className="border-white/10 my-2" />
              {user ? (
                <>
                  <div className="w-full p-2 flex flex-col gap-1">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Akun Anda</span>
                    <span className="font-bold text-white text-lg">{userProfile?.displayName || user.email?.split('@')[0]}</span>
                  </div>
                  <button onClick={() => { signOut(auth); setIsMobileMenuOpen(false); }} className="w-full bg-red-500/20 border border-red-500/30 text-red-500 py-3.5 rounded-xl font-bold uppercase tracking-wider">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-[#333333] border border-white/10 text-center py-3.5 rounded-xl font-bold text-white uppercase tracking-wider">Masuk Akun</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="w-full bg-gold text-charcoal text-center py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.3)]">Daftar Sekarang</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 w-full relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold/5 blur-[150px] rounded-full"></div>
          <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[150px] rounded-full"></div>
        </div>

        {/* 1, 2, 4, 6, 8. HERO SECTION WITH IMAGE/VIDEO, HEADLINE, DESC, CTA & TRUST ELEMENTS */}
        <section className="pt-16 pb-20 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/5">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* 1 & 6. HEADLINE & DESKRIPSI (Hero Text Area) */}
            <div className="w-full lg:w-[55%] flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]"></span>
                {heroBadge}
              </div>
              
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-[1.1] mb-6">
                <span dangerouslySetInnerHTML={{ __html: heroMain }} />
              </h1>
              
              <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed mb-10 max-w-2xl">
                {heroDesc}
              </p>
              
              {/* 4. CALL TO ACTION */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <a href="#games" className="w-full sm:w-auto text-center bg-gold hover:bg-yellow-400 text-charcoal font-extrabold py-4 px-10 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] hover:-translate-y-1 text-lg uppercase tracking-wider relative overflow-hidden group">
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                  <span className="relative">{cta1}</span>
                </a>
                <a href="#manfaat" className="w-full sm:w-auto text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 px-8 rounded-xl transition-colors text-base uppercase tracking-wider">
                  {cta2}
                </a>
              </div>

              {/* 8. TRUST ELEMENTS (Counters Row) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full pt-12 mt-12 border-t border-white/10">
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl lg:text-4xl font-black text-white font-heading mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat1.val}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{stat1.lbl}</p>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl lg:text-4xl font-black text-white font-heading mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat2.val}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{stat2.lbl}</p>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl lg:text-4xl font-black text-white font-heading mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat3.val}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{stat3.lbl}</p>
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="text-3xl lg:text-4xl font-black text-white font-heading mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{stat4.val}</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{stat4.lbl}</p>
                </div>
              </div>
            </div>

            {/* 2. GAMBAR / VIDEO (Hero Visual Area) */}
            <div className="w-full lg:w-[45%] relative flex justify-center mt-8 lg:mt-0">
              <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group bg-[#1A1A1A]">
                {/* Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>
                
                <img 
                  src={heroImageSrc || undefined} 
                  alt="Gaming Banner" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03] z-10 relative opacity-90 group-hover:opacity-100"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'; }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent z-10 opacity-80"></div>
                
                {/* Floating Badge 1 */}
                <div className="absolute bottom-10 left-[-20px] sm:left-[-40px] z-20 bg-charcoal/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shadow-xl transform transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-white text-base">Aman 100%</p>
                    <p className="text-xs text-gray-400 font-medium">Garansi Anti Banned</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute top-20 right-[-20px] sm:right-[-40px] z-20 bg-charcoal/90 border border-white/10 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 shadow-xl transform transition-transform duration-500 group-hover:-translate-y-2 delay-100">
                  <div className="p-3 bg-gold/20 rounded-xl text-gold">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-white text-base">Super Cepat</p>
                    <p className="text-xs text-gray-400 font-medium">Masuk Detik Itu Juga</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* POPULAR GAMES SECTION */}
        <section id="games" className="py-24 bg-[#151515] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
              <span className="text-gold font-bold uppercase tracking-widest text-sm mb-3 block">{secGames.sub}</span>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                <span dangerouslySetInnerHTML={{ __html: secGames.title }} />
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {secGames.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-6">
              {games.map((game) => (
                <div 
                  key={game.id} 
                  onClick={() => handleGameClick(game.name)}
                  className="bg-[#222222] rounded-3xl p-3 sm:p-4 border border-white/5 hover:border-gold/50 cursor-pointer group flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <div className="w-full aspect-square bg-[#1A1A1A] rounded-2xl overflow-hidden relative shadow-inner">
                    <img 
                      src={game.img || undefined} 
                      alt={game.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center pb-2 z-20 w-full relative">
                    <span className="font-bold text-sm sm:text-base text-white block line-clamp-1 group-hover:text-gold transition-colors">{game.name}</span>
                    <span className="text-[11px] sm:text-xs text-gray-500 block mt-1 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">{game.tags}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. MANFAAT SECTION (MENGAPA MEMILIH KAMI) */}
        <section id="manfaat" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#111111] -z-20"></div>
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtbmgtdi1oaDF2aDF6IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz48L2c+PC9zdmc+')] -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-gold font-bold uppercase tracking-widest text-sm mb-3 block">{secFeat.sub}</span>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-6">
                <span dangerouslySetInnerHTML={{ __html: secFeat.title }} />
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                {secFeat.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuresList.map((feature, idx) => {
                let Icon = Zap;
                if (typeof feature.icon === 'string') {
                  switch (feature.icon.toLowerCase()) {
                    case 'shield': Icon = ShieldCheck; break;
                    case 'tag': Icon = Tag; break;
                    case 'credit-card': Icon = CreditCard; break;
                    case 'target': Icon = Activity; break;
                    case 'star': Icon = Star; break;
                    default: Icon = Zap; break;
                  }
                } else if (feature.icon) {
                  Icon = feature.icon;
                }
                return (
                  <div key={idx} className="bg-[#181818] p-8 rounded-[32px] border border-white/5 hover:border-gold/30 hover:bg-[#1C1C1C] transition-all duration-300 group flex flex-col items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-[40px] group-hover:bg-gold/10 transition-colors"></div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-gold group-hover:scale-110 group-hover:bg-gold/10 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] transition-all duration-500">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 font-heading leading-tight">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm md:text-base">{feature.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. TESTIMONI PENGGUNA SECTION */}
        <section id="testimoni" className="py-24 bg-[#151515] border-t border-b border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-2xl">
                <span className="text-gold font-bold uppercase tracking-widest text-sm mb-3 block">{secTesti.sub}</span>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
                  <span dangerouslySetInnerHTML={{ __html: secTesti.title }} />
                </h2>
                <p className="text-gray-400 text-lg">{secTesti.desc}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="flex items-center gap-3 bg-[#222222] px-6 py-4 rounded-2xl border border-white/5 shadow-xl">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-Rata Rating</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-white text-3xl">4.9</span>
                      <span className="text-gray-500 font-bold">/ 5.0</span>
                    </div>
                  </div>
                  <div className="w-px h-12 bg-white/10 mx-2"></div>
                  <div className="flex text-gold">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-6 h-6 fill-current" />)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonialsList.map((testi, i) => (
                <div key={testi.id || i} className="bg-[#1A1A1A] p-8 md:p-10 rounded-[32px] border border-white/5 relative group hover:border-gold/30 hover:bg-[#1E1E1E] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-1 text-gold">
                      {[...Array(testi.rating)].map((_, j) => <Star key={j} className="w-4 h-4 md:w-5 md:h-5 fill-current" />)}
                    </div>
                    {/* SVG Quote Icon */}
                    <svg className="w-10 h-10 text-white/5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-auto pb-8 font-medium">"{testi.text}"</p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center text-charcoal font-black text-2xl shadow-lg">
                      {testi.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{testi.name}</h4>
                      <span className="text-sm text-gold font-bold">{testi.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* 6. DESKRIPSI TAMBAHAN DI FOOTER */}
      <footer className="bg-[#0A0A0A] pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik00MCA0MEgwVjB6IiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz48L2c+PC9zdmc+')] -z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-16">
            
            {/* Brand & Description */}
            <div className="md:col-span-12 lg:col-span-5 space-y-6">
              <Link to="/" className="flex items-center gap-2 cursor-pointer inline-block">
                {siteContent?.header?.logoImg ? (
                  <img src={siteContent.header.logoImg} alt={logoText} className="h-12 w-auto object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center">
                      <span className="text-charcoal font-black text-3xl leading-none tracking-tighter">V</span>
                    </div>
                    <span className="font-heading font-black text-3xl tracking-tight leading-none text-white uppercase drop-shadow-md">
                      {headerPrefix}<span className="text-gold">{headerSuffix}</span>
                    </span>
                  </div>
                )}
              </Link>
              
              <p className="text-gray-400 text-base leading-relaxed pr-8">
                {footerDesc} Platform canggih yang memudahkan para gamers untuk memenuhi kebutuhan di dalam game dengan sistem pemrosesan instan 24/7 non-stop.
              </p>
              
              <div className="pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Didukung Oleh Pembayaran Aman:</p>
                <div className="flex flex-wrap gap-3">
                  {paymentLogos.map((payment, idx) => (
                    <div key={payment.id || idx} className="h-10 px-4 bg-white/5 rounded-xl text-sm font-bold border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 hover:border-gold/30 transition-all overflow-hidden group cursor-default">
                      {payment.img ? (
                        <img 
                          src={payment.img || undefined} 
                          alt={payment.name} 
                          title={payment.name}
                          className="h-6 object-contain group-hover:scale-110 transition-transform duration-300" 
                          onError={(e) => { 
                            (e.target as HTMLImageElement).style.display = 'none'; 
                            const span = (e.target as HTMLImageElement).nextElementSibling;
                            if(span) span.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`tracking-wide uppercase ${payment.img ? 'hidden' : ''}`}>{payment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Links Group */}
            <div className="md:col-span-5 lg:col-span-3">
              <h4 className="font-bold text-lg text-white mb-8 uppercase tracking-wider font-heading">Jelajahi VinzPedia</h4>
              <ul className="space-y-4">
                <li><a href="#games" className="text-gray-400 hover:text-gold font-medium transition-colors block">Semua Game</a></li>
                <li><a href="#manfaat" className="text-gray-400 hover:text-gold font-medium transition-colors block">Keuntungan Top Up</a></li>
                <li><a href="#testimoni" className="text-gray-400 hover:text-gold font-medium transition-colors block">Review Pelanggan</a></li>
                <li className="pt-4"><Link to="/admin" className="inline-flex items-center gap-2 text-gold hover:text-yellow-400 font-bold transition-all p-3 rounded-lg bg-gold/10 border border-gold/20">Admin Panel <ChevronRight className="w-4 h-4" /></Link></li>
              </ul>
            </div>

            {/* Support Group */}
            <div className="md:col-span-7 lg:col-span-4">
              <h4 className="font-bold text-lg text-white mb-8 uppercase tracking-wider font-heading">Pusat Layanan</h4>
              <ul className="space-y-4 mb-8">
                <li><a href="#" className="text-gray-400 hover:text-gold font-medium transition-colors block">Syarat & Ketentuan Layanan</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold font-medium transition-colors block">Kebijakan Privasi</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gold font-medium transition-colors block">FAQ / Bantuan</a></li>
              </ul>
              
              <div className="bg-[#151515] p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Customer Service 24 Jam</p>
                <a 
                  href={`https://wa.me/62${footerPhone.replace(/^0+/, '')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-[#0A0A0A] border border-[#25D366]/30 px-5 py-4 rounded-xl transition-all font-bold group"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Hubungi via WhatsApp</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="text-center pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500 font-medium">
              &copy; {new Date().getFullYear()} <span className="text-white font-bold">{logoText}</span>. All rights reserved.
            </p>
            <div className="flex gap-3">
              <a href={socialIg} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-[#0A0A0A] transition-all text-gray-400 cursor-pointer border border-white/5 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href={socialFb} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-[#0A0A0A] transition-all text-gray-400 cursor-pointer border border-white/5 hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href={socialTt} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-[#0A0A0A] transition-all text-gray-400 cursor-pointer border border-white/5 hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v8a4 4 0 1 1-4-4Z"/>
                </svg>
              </a>
              <a href={socialYt} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold hover:text-[#0A0A0A] transition-all text-gray-400 cursor-pointer border border-white/5 hover:scale-110">
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
