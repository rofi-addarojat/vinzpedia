import React, { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ShieldCheck, LogOut, Settings, Image as ImageIcon, Gamepad2, CreditCard, Plus, Trash2, CheckCircle2, MessageSquare, LayoutTemplate, BookOpen } from 'lucide-react';

const compressImage = (file: File, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

function ImageInput({ label, value, onChange, placeholder, maxWidth, maxHeight }: any) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64 = await compressImage(file, maxWidth || 800, maxHeight || 800);
      onChange(base64);
    } catch (err) {
      console.error('Upload error', err);
      alert('Gagal mengupload gambar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <label className="block text-xs font-medium text-gray-400">{label}</label>
        <div className="flex bg-charcoal-light border border-white/10 rounded overflow-hidden">
          <button 
            type="button" 
            onClick={() => setMode('url')} 
            className={`px-2 py-0.5 text-[10px] ${mode === 'url' ? 'bg-gold text-charcoal font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            URL Link
          </button>
          <button 
            type="button" 
            onClick={() => setMode('upload')} 
            className={`px-2 py-0.5 text-[10px] ${mode === 'upload' ? 'bg-gold text-charcoal font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            Upload Gambar
          </button>
        </div>
      </div>
      {mode === 'url' ? (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" 
          placeholder={placeholder || 'https://...'} 
        />
      ) : (
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1 text-sm focus:border-gold outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" 
          />
          {isUploading && <div className="absolute inset-0 bg-charcoal-light/80 flex items-center justify-center text-xs text-gold font-bold">Memproses & Kompres...</div>}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Data States
  const [siteContent, setSiteContent] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg: string, err?: any) => {
    console.error(err);
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const isAdmin = user?.email === 'masroficom@gmail.com';

  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    if (user && isAdmin) {
      // existing listeners...
      const unsubContent = onSnapshot(doc(db, 'site_content', 'landing'), (docSnap) => {
        if (docSnap.exists()) {
          setSiteContent(docSnap.data());
        }
      });
      const unsubGames = onSnapshot(collection(db, 'games'), (snapshot) => {
        if (!snapshot.empty) setGames(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        else setGames([]);
      });
      const unsubPayments = onSnapshot(collection(db, 'payment_methods'), (snapshot) => {
        if (!snapshot.empty) setPaymentMethods(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        else setPaymentMethods([]);
      });
      const unsubFeatures = onSnapshot(collection(db, 'features'), (snapshot) => {
        if (!snapshot.empty) setFeatures(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        else setFeatures([]);
      });
      const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
        if (!snapshot.empty) setTestimonials(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        else setTestimonials([]);
      });
      const unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
        if (!snapshot.empty) setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        else setArticles([]);
      });
      return () => { unsubContent(); unsubGames(); unsubPayments(); unsubFeatures(); unsubTestimonials(); unsubArticles(); };
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
      alert('Login failed. Ensure Firebase Auth is active.');
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'site_content', 'landing'), siteContent || {}, { merge: true });
      showSuccess('Konten berhasil disimpan!');
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        showError('Gagal menyimpan: Akses ditolak. Pastikan Anda memiliki hak akses admin.', e);
      } else {
        showError('Gagal menyimpan konten: ' + (e?.message || 'Error tidak diketahui'), e);
      }
    }
    setIsSaving(false);
  };

  const addGame = async () => {
    try {
      await addDoc(collection(db, 'games'), { name: 'New Game', tags: 'Tags', img: '' });
      showSuccess('Game berhasil ditambahkan!');
    } catch (e: any) {
      showError('Gagal menambahkan game: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const updateGame = async (id: string, field: string, val: string) => {
    try {
      await updateDoc(doc(db, 'games', id), { [field]: val });
    } catch (e: any) {
      showError('Gagal memperbarui game: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus game ini?')) return;
    try {
      await deleteDoc(doc(db, 'games', id));
      showSuccess('Game berhasil dihapus!');
    } catch (e: any) {
      showError('Gagal menghapus game: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const addArticle = async () => {
    try {
      await addDoc(collection(db, 'articles'), { 
        title: 'New Article', 
        slug: 'new-article-' + Date.now(), 
        content: 'Content goes here...', 
        excerpt: 'Short description.', 
        img: '', 
        createdAt: new Date().toISOString() 
      });
      showSuccess('Artikel berhasil ditambahkan!');
    } catch (e: any) {
      showError('Gagal menambahkan artikel: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const updateArticle = async (id: string, field: string, val: string) => {
    try {
      await updateDoc(doc(db, 'articles', id), { [field]: val, updatedAt: new Date().toISOString() });
    } catch (e: any) {
      showError('Gagal memperbarui artikel: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const deleteArticle = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus artikel ini?')) return;
    try {
      await deleteDoc(doc(db, 'articles', id));
      showSuccess('Artikel berhasil dihapus!');
    } catch (e: any) {
      showError('Gagal menghapus artikel: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const seedSEOArticles = async () => {
    if (!confirm('Ini akan menambahkan 6 artikel SEO ke database. Lanjutkan?')) return;
    
    const defaultArticles = [
      {
        title: "Panduan Lengkap Cara Top Up Mobile Legends Termurah dan Aman 2026",
        slug: "panduan-top-up-ml",
        excerpt: "Sedang mencari tempat top up diamond Mobile Legends yang murah, aman, dan tanpa ribet? Simak panduan lengkap kami.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Top Up Diamond MLBB Termurah</h3>
<p>Mobile Legends: Bang Bang (MLBB) masih menjadi salah satu game MOBA mobile terpopuler di Indonesia. Untuk bisa mendapatkan hero baru, skin idaman, hingga starlight member bulanan, pemain wajib memiliki Diamond sebagai mata uang dalam game.</p>
<p>Namun, membedakan platform penyedia top-up yang aman dan ilegal kadang membingungkan. Terlebih maraknya penipuan di dunia maya. Dengan menggunakan VinzPedia, Anda dipastikan menikmati proses transaksi <strong>Top Up Mobile Legends yang 100% legal dan terpercaya</strong>.</p>
<h4>Keuntungan Memilih Platform Bergaransi</h4>
<p>Banyak pemain tergiur iming-iming diamond gratis dan ilegal, yang berujung pada akun terkena *banned* oleh pihak Moonton. Kami sangat menyarankan Anda selalu memilih agen resmi dan terpercaya. Apabila Anda juga ingin mempelajari bagaimana membangun usaha rintisan di bidang digital maupun meningkatkan keterampilan teknis Anda, jangan ragu untuk mengunjungi dan belajar bersama para pakar di <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a>.</p>
<p>Dengan hadirnya platform kami, tidak ada lagi proses lambat. Semua transaksi top-up ML dilakukan dalam hitungan detik. Cukup masukkan User ID dan Zone ID Anda, pilih nominal, bayar, dan diamond langsung masuk ke akun Anda saat itu juga!</p>`
      },
      {
        title: "Trik Ampuh Mendapatkan Skin Epic FF Secara Legal dan Murah",
        slug: "trik-skin-epic-ff",
        excerpt: "Mau skin Free Fire terbaru tapi budget pas-pasan? Ini rahasianya agar Anda bisa tetap tampil keren di arena pertempuran.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Tampil Keren di Free Fire Tanpa Menguras Dompet</h3>
<p>Free Fire selalu mengadakan event-event menarik yang menghadirkan skin keren, bundle eksklusif, hingga pet dengan kemampuan spesial. Sayangnya, untuk bisa mengikuti event putaran (gacha) ini seringkali membutuhkan Diamond yang tidak sedikit.</p>
<h4>Tips Top-up FF Super Hemat</h4>
<p>Agar dana yang Anda keluarkan tidak membengkak, pastikan untuk memanfaatkan momen promo, diskon khusus event bulanan, serta bundel membership mingguan/bulanan. Membeli membership di platform kami dijamin lebih murah daripada pembelian reguler in-app. </p>
<p>Sambil mengembangkan hobi gaming, jangan lupa untuk meningkatkan aset skill profesional Anda di ekosistem digital. Anda bisa temukan berbagai panduan sertifikasi digital di <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a> yang bermanfaat. </p>
<p>Di VinzPedia, keamanan transaksi Anda menjadi prioritas mutlak. Menggunakan jaringan transaksi ter-enkripsi membuat proses pembelian Diamond Free Fire berjalan lancar dan aman dari potensi ancaman siber apa pun. Jangan tertipu oleh harga miring penjual tidak resmi. Gunakan VinzPedia selalu!</p>`
      },
      {
        title: "Daftar Harga UC PUBG Mobile Termurah Bulan Ini",
        slug: "harga-uc-pubg-murah",
        excerpt: "Klaim Royale Pass Season terbaru Anda hari ini. Cek rincian harga UC PUBG Mobile termurah dengan proses instan.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Beli UC PUBG Mobile dengan Proses Kilat</h3>
<p>Senjata yang diupgrade, pakaian eksklusif, dan kendaraan keren adalah beberapa keuntungan yang ditawarkan PUBG Mobile melalui sistem Royale Pass mereka. Unknown Cash (UC) adalah satu-satunya cara untuk membukanya.</p>
<h4>Tabel Harga dan Kecepatan</h4>
<p>Kami telah bermitra dengan penyedia metode pembayaran populer untuk memastikan kecepatan transaksi. Di VinzPedia, proses pembelian UC hanya memakan waktu 1-3 detik. Tidak perlu repot menunggu. Cukup masukan ID pemain PUBG Anda dan lakukan konfirmasi pembayaran.</p>
<p>Meningkatnya industri esport membawa dampak positif bagi kemajuan teknologi dan edukasi digital lokal. Jika tertarik tentang kemajuan dunia digital dan sertifikasi profesi di bidang ini, <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a> adalah referensial terbaik untuk Anda.</p>
<p>Apapun mode permainan Anda, baik sekadar push rank atau bermain fun bersama teman, pastikan Anda mendapatkan suplai UC yang cukup di akun Anda. Raih Chicken Dinner Anda dengan penuh gaya hari ini!</p>`
      },
      {
        title: "Cara Menghindari Penipuan Saat Top Up Game Online",
        slug: "hindari-penipuan-top-up",
        excerpt: "Penpulan online semakin marak. Yuk pahami cara-cara agar akun dan uang Anda aman saat beli voucher game.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Bahaya Penipuan Top-Up Ilegal</h3>
<p>Belakangan ini, industri game online digegerkan oleh banyaknya korban penipuan melalui layanan top-up game abal-abal di media sosial. Mereka menjanjikan jumlah in-game currency gila-gilaan dengan harga sangat murah, namun justru berujung pada pencurian akun (Phising).</p>
<h4>Ciri-Ciri Platform Top Up Mengingatkan</h4>
<p>Untuk mengamankan akun dari scammer, Anda harus meneliti: apakah website tersebut meminta kata sandi / password akun game Anda? Jika ya, tinggalkan segera! Platform top up resmi seperti VinzPedia <strong>hanya memerlukan User ID</strong> (dan Zone ID untuk beberapa game) untuk mengirimkan pesanan Anda.</p>
<p>Mari jadikan internet sebagai tempat yang aman dan produktif. Sertifikasi digital dan pengetahuan IT dapat Anda pelajari lebih luas melalui jejaring <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a>.</p>
<p>Selalu perhatikan reputasi dan lisensi keamanan situs. VinzPedia dilengkapi dengan sertifikasi sekuritas enkripsi web serta payment gateway legal dan memiliki dukungan pelanggan yang siap melayani 24/7 jika terjadi kendala.</p>`
      },
      {
        title: "Perbandingan Valorant Points (VP): Beli di Game vs Beli di Web",
        slug: "perbandingan-vp-valorant",
        excerpt: "Bingung mau beli Valorant Points dimana? Kami membedah perbedaannya dan menunjukkan cara mana yang menguntungkan.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Mengapa Beli Valorant Point Lewat Web Pihak Ketiga Lebih Murah?</h3>
<p>Sistem pembelian in-game (dari dalam game langsung) sering kali menambahkan biaya pajak yang besar dan biaya administrasi dari Google Play atau App Store. Oleh karena itu, pemain banyak mencari alternatif pembelian lewat website penyedia top-up.</p>
<h4>Riot Games dan Keamanan Akun</h4>
<p>Tidak usah khawatir dengan pemblokiran karena Riot Games memberikan dukungan ekosistem reseller resmi. Melalui metode Riot ID, Anda dapat mengisi VP secara sah dan masuk seketika itu juga ke inventory tanpa perlu login ke akun game Anda. Hal ini 100% didukung dan aman.</p>
<p>Jika Anda tertarik dengan cara platform digital bekerja secara arsitektural dan legal, Anda bisa menemukan wawasan menarik dari <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a>, yang banyak membahas validasi sistem digital.</p>
<p>Nikmati kemeriahan Night.Market serta rilis bundle baru Valorant dengan harga miring! Jangan biarkan skin Vandal impian Anda hilang begitu saja dari store karena kurangnya VP harian. Top up sekarang di web kami!</p>`
      },
      {
        title: "Mengenal Sistem Pity di Genshin Impact dan Cara Memanfaatkannya",
        slug: "sistem-pity-genshin",
        excerpt: "Pusing tidak kunjung dapat karakter bintang 5? Mari kenali sistem Pity Genshin Impact dan strategi top up Genesis Crystal yang efisien.",
        img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80",
        content: `<h3>Strategi Gacha dan Pity Rate</h3>
<p>Di Genshin Impact, pemain sangat bergantung pada Primogems atau Genesis Crystal untuk melakukan 'Wish' guna mendapatkan karakter atau senjata bintang 5. Memahami sistem 'Pity'—dimana rate karakter bintang 5 dijamin muncul pada ke-90 kalinya—sangatlah vital untuk keuangan Anda.</p>
<h4>Welkin Moon vs Genesis Crystal Instan</h4>
<p>Bagi yang ingin menabung perlahan, Blessing of the Welkin Moon adalah sahabat terbaik. Namun jika banner karakter idaman tinggal menghitung hari dan Anda belum menyentuh 'soft pity' (pull ke-75), maka top up Genesis Crystal dalam jumlah besar menjadi jalan keluarnya.</p>
<p>Bermain sangat seru, namun karir tetap nomor satu. Pastikan portofolio Anda terus bertambah nilainya di dunia kerja dengan mengikuti sertifikasi kompetensi bersama <a href="https://lspdigital.id" target="_blank" rel="noreferrer">lspdigital.id</a>.</p>
<p>Kini Anda sudah mengetahui strategi pull yang tepat, siapkan simpanan Genesis Crystal Anda dengan berbelanja hemat di platform top-up kesayangan Anda. Dukungan berbagai macam dompet digital (E-wallet) di VinzPedia mempermudah setiap prosesnya.</p>`
      }
    ];

    try {
       for (const art of defaultArticles) {
         await addDoc(collection(db, 'articles'), {
           ...art,
           createdAt: new Date().toISOString()
         });
       }
       showSuccess('6 Artikel SEO berhasil di-generate!');
    } catch(e: any) {
       showError('Gagal generate artikel', e);
    }
  };

  const addPayment = async () => {
    try {
      await addDoc(collection(db, 'payment_methods'), { name: 'New Method', img: '' });
      showSuccess('Metode pembayaran berhasil ditambahkan!');
    } catch (e: any) {
      showError('Gagal menambahkan metode pembayaran: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const updatePayment = async (id: string, field: string, val: string) => {
    try {
      await updateDoc(doc(db, 'payment_methods', id), { [field]: val });
    } catch (e: any) {
      showError('Gagal memperbarui metode pembayaran: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const deletePayment = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?')) return;
    try {
      await deleteDoc(doc(db, 'payment_methods', id));
      showSuccess('Metode pembayaran berhasil dihapus!');
    } catch (e: any) {
      showError('Gagal menghapus metode pembayaran: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const addFeature = async () => {
    try {
      await addDoc(collection(db, 'features'), { title: 'New Feature', desc: 'Description', icon: 'zap' });
      showSuccess('Fitur berhasil ditambahkan!');
    } catch (e: any) {
      showError('Gagal menambahkan fitur: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const updateFeature = async (id: string, field: string, val: string) => {
    try {
      await updateDoc(doc(db, 'features', id), { [field]: val });
    } catch (e: any) {
      showError('Gagal memperbarui fitur: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const deleteFeature = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus fitur ini?')) return;
    try {
      await deleteDoc(doc(db, 'features', id));
      showSuccess('Fitur berhasil dihapus!');
    } catch (e: any) {
      showError('Gagal menghapus fitur: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  const addTestimonial = async () => {
    try {
      await addDoc(collection(db, 'testimonials'), { name: 'New User', role: 'Gamer', text: 'Good', rating: 5 });
      showSuccess('Testimoni berhasil ditambahkan!');
    } catch (e: any) {
      showError('Gagal menambahkan testimoni: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const updateTestimonial = async (id: string, field: string, val: any) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { [field]: val });
    } catch (e: any) {
      showError('Gagal memperbarui testimoni: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };
  const deleteTestimonial = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      showSuccess('Testimoni berhasil dihapus!');
    } catch (e: any) {
      showError('Gagal menghapus testimoni: ' + (e?.message || 'Error tidak diketahui'), e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center text-white">
        <div className="bg-charcoal-light p-8 rounded-xl max-w-sm w-full border border-white/10 text-center">
          <ShieldCheck className="w-16 h-16 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-6 font-heading">Admin Login</h2>
          <button 
            onClick={handleLogin}
            className="w-full bg-white text-charcoal font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-charcoal flex items-center justify-center text-white p-4">
        <div className="bg-charcoal-light p-8 rounded-xl max-w-sm w-full border border-red-500/30 text-center">
          <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 font-heading">Akses Ditolak</h2>
          <p className="text-gray-400 mb-6 text-sm">Anda tidak memiliki hak admin untuk mengakses halaman ini.</p>
          <button 
            onClick={() => signOut(auth)}
            className="w-full bg-charcoal border border-white/10 text-white font-bold py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
          >
            Kembali & Logout
          </button>
        </div>
      </div>
    );
  }

  const isContentTab = ['general', 'hero', 'sections'].includes(activeTab);

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-charcoal-light border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h1 className="font-heading font-bold text-xl text-gold">VINZ Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-2 px-4">Teks Website</p>
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'general' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Settings className="w-5 h-5" /> General & Footer
          </button>
          <button onClick={() => setActiveTab('hero')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'hero' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <ImageIcon className="w-5 h-5" /> Hero Section
          </button>
          <button onClick={() => setActiveTab('sections')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'sections' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <LayoutTemplate className="w-5 h-5" /> Judul Sections
          </button>
          
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 mt-6 px-4">Konten Database</p>
          <button onClick={() => setActiveTab('games')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'games' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Gamepad2 className="w-5 h-5" /> Daftar Game
          </button>
          <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'payments' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <CreditCard className="w-5 h-5" /> Metode Pembayaran
          </button>
          <button onClick={() => setActiveTab('features')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'features' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <CheckCircle2 className="w-5 h-5" /> Keunggulan
          </button>
          <button onClick={() => setActiveTab('testimonials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'testimonials' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <MessageSquare className="w-5 h-5" /> Testimoni
          </button>
          <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'articles' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <BookOpen className="w-5 h-5" /> Artikel Blog / SEO
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-4 py-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            {isContentTab && (
              <button 
                onClick={handleSaveContent}
                disabled={isSaving}
                className="bg-gold hover:bg-yellow-400 text-charcoal px-6 py-2 rounded-lg font-bold disabled:opacity-50 transition-all shadow-lg shadow-gold/20"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm mb-4">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm mb-4">
              {successMsg}
            </div>
          )}

          <div className="bg-charcoal-light rounded-xl p-6 border border-white/5 space-y-6">
            {!siteContent && isContentTab && <p className="text-gray-400">Loading content...</p>}
            
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nama Platform (Text Logo)</label>
                  <input type="text" value={siteContent?.header?.logoText || 'VINZPEDIA'} onChange={e => setSiteContent({ ...siteContent, header: { ...siteContent?.header, logoText: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <ImageInput 
                    label="Image URL / Upload (Logo Web - Opsional)" 
                    value={siteContent?.header?.logoImg} 
                    onChange={(val: string) => setSiteContent({ ...siteContent, header: { ...siteContent?.header, logoImg: val }})} 
                    maxWidth={400} 
                    maxHeight={400} 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Jika diisi, gambar ini akan menggantikan text logo.</p>
                  {siteContent?.header?.logoImg && (
                    <div className="mt-2 p-2 bg-[#1A1A1A] rounded inline-block">
                       <img src={siteContent.header.logoImg} alt="Logo" className="h-8 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <ImageInput 
                    label="Image URL / Upload (Favicon browser)" 
                    value={siteContent?.header?.faviconImg} 
                    onChange={(val: string) => setSiteContent({ ...siteContent, header: { ...siteContent?.header, faviconImg: val }})} 
                    maxWidth={64} 
                    maxHeight={64} 
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Icon akan muncul di tab browser pengguna.</p>
                  {siteContent?.header?.faviconImg && (
                    <div className="mt-2 p-2 bg-[#1A1A1A] rounded inline-block">
                       <img src={siteContent.header.faviconImg} alt="Favicon" className="h-4 object-contain" />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Footer Description</label>
                  <textarea value={siteContent?.footer?.description || ''} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-24" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp Number (Call Center)</label>
                  <input type="text" value={siteContent?.footer?.phone || '08779110477'} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, phone: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Instagram URL</label>
                  <input placeholder="https://instagram.com/..." type="text" value={siteContent?.footer?.socialIg || ''} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, socialIg: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Facebook URL</label>
                  <input placeholder="https://facebook.com/..." type="text" value={siteContent?.footer?.socialFb || ''} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, socialFb: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">TikTok URL</label>
                  <input placeholder="https://tiktok.com/..." type="text" value={siteContent?.footer?.socialTt || ''} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, socialTt: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">YouTube URL</label>
                  <input placeholder="https://youtube.com/..." type="text" value={siteContent?.footer?.socialYt || ''} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, socialYt: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Badge Text</label>
                  <input type="text" value={siteContent?.hero?.badgeText || 'Top-Up Platform #1 di Indonesia'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, badgeText: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Hero Main Title (Bisa HTML text-gold)</label>
                  <input type="text" value={siteContent?.hero?.titleMain || 'Platform Top-Up Game Terbaik di Indonesia'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, titleMain: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea value={siteContent?.hero?.description || ''} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-24" />
                </div>
                <div className="md:col-span-2">
                  <ImageInput 
                    label="Image URL / Upload (Banner Hero)" 
                    value={siteContent?.hero?.imageSrc} 
                    onChange={(val: string) => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, imageSrc: val }})} 
                    maxWidth={1200} 
                    maxHeight={800} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Button 1 Text</label>
                  <input type="text" value={siteContent?.hero?.ctaPrimaryText || 'Mulai Top-Up'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, ctaPrimaryText: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Button 2 Text</label>
                  <input type="text" value={siteContent?.hero?.ctaSecondaryText || 'Pelajari Fitur'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, ctaSecondaryText: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-charcoal mt-2">
                  <h3 className="col-span-full font-bold text-gold mb-2 border-b border-white/10 pb-2">Stats (4 Kolom bawah hero)</h3>
                  <div>
                    <input placeholder="Value (e.g. 99%)" type="text" value={siteContent?.hero?.stat1Value || '99%'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat1Value: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-t px-3 py-1 mb-1 text-sm focus:border-gold outline-none" />
                    <input placeholder="Label (e.g. Success Rate)" type="text" value={siteContent?.hero?.stat1Label || 'Success Rate'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat1Label: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-b px-3 py-1 text-sm focus:border-gold outline-none" />
                  </div>
                  <div>
                    <input placeholder="Value (e.g. 1s)" type="text" value={siteContent?.hero?.stat2Value || '1s'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat2Value: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-t px-3 py-1 mb-1 text-sm focus:border-gold outline-none" />
                    <input placeholder="Label (e.g. Proses Instan)" type="text" value={siteContent?.hero?.stat2Label || 'Proses Instan'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat2Label: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-b px-3 py-1 text-sm focus:border-gold outline-none" />
                  </div>
                  <div>
                    <input placeholder="Value (e.g. 5M+)" type="text" value={siteContent?.hero?.stat3Value || '5M+'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat3Value: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-t px-3 py-1 mb-1 text-sm focus:border-gold outline-none" />
                    <input placeholder="Label (e.g. Users Aktif)" type="text" value={siteContent?.hero?.stat3Label || 'Users Aktif'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat3Label: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-b px-3 py-1 text-sm focus:border-gold outline-none" />
                  </div>
                  <div>
                    <input placeholder="Value (e.g. 24/7)" type="text" value={siteContent?.hero?.stat4Value || '24/7'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat4Value: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-t px-3 py-1 mb-1 text-sm focus:border-gold outline-none" />
                    <input placeholder="Label (e.g. Live Support)" type="text" value={siteContent?.hero?.stat4Label || 'Live Support'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, stat4Label: e.target.value }})} className="w-full bg-charcoal-light border border-white/10 rounded-b px-3 py-1 text-sm focus:border-gold outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gold border-b border-white/10 pb-2">Katalog Game</h3>
                  <input placeholder="Subtitle (Katalog Produk)" type="text" value={siteContent?.gamesSection?.subtitle || 'Katalog Produk'} onChange={e => setSiteContent({ ...siteContent, gamesSection: { ...siteContent?.gamesSection, subtitle: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <input placeholder="Main Title (Bisa HTML text-gold)" type="text" value={siteContent?.gamesSection?.title || 'Pilih Game Favoritmu'} onChange={e => setSiteContent({ ...siteContent, gamesSection: { ...siteContent?.gamesSection, title: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <textarea placeholder="Description" value={siteContent?.gamesSection?.description || ''} onChange={e => setSiteContent({ ...siteContent, gamesSection: { ...siteContent?.gamesSection, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-20" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gold border-b border-white/10 pb-2">Keunggulan / Keuntungan</h3>
                  <input placeholder="Subtitle" type="text" value={siteContent?.featuresSection?.subtitle || 'Keunggulan KAMI'} onChange={e => setSiteContent({ ...siteContent, featuresSection: { ...siteContent?.featuresSection, subtitle: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <input placeholder="Main Title (Bisa HTML text-gold)" type="text" value={siteContent?.featuresSection?.title || 'Mengapa Harus Top-Up di VindzPedia?'} onChange={e => setSiteContent({ ...siteContent, featuresSection: { ...siteContent?.featuresSection, title: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <textarea placeholder="Description" value={siteContent?.featuresSection?.description || ''} onChange={e => setSiteContent({ ...siteContent, featuresSection: { ...siteContent?.featuresSection, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-20" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gold border-b border-white/10 pb-2">Testimoni</h3>
                  <input placeholder="Subtitle" type="text" value={siteContent?.testimonialsSection?.subtitle || 'Testimoni Pelanggan'} onChange={e => setSiteContent({ ...siteContent, testimonialsSection: { ...siteContent?.testimonialsSection, subtitle: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <input placeholder="Main Title (Bisa HTML text-gold)" type="text" value={siteContent?.testimonialsSection?.title || 'Kata Mereka Tentang VinzPedia'} onChange={e => setSiteContent({ ...siteContent, testimonialsSection: { ...siteContent?.testimonialsSection, title: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  <textarea placeholder="Description" value={siteContent?.testimonialsSection?.description || ''} onChange={e => setSiteContent({ ...siteContent, testimonialsSection: { ...siteContent?.testimonialsSection, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-20" />
                </div>
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-4">
                <button onClick={addGame} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  <Plus className="w-4 h-4" /> Tambah Game
                </button>
                <div className="space-y-4">
                  {games.map(game => (
                    <div key={game.id} className="p-4 bg-charcoal border border-white/10 rounded-lg flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Game Name</label>
                          <input type="text" value={game.name} onChange={(e) => updateGame(game.id, 'name', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tags</label>
                          <input type="text" value={game.tags} onChange={(e) => updateGame(game.id, 'tags', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <ImageInput 
                            label="Image URL / Upload" 
                            value={game.img} 
                            onChange={(val: string) => updateGame(game.id, 'img', val)} 
                            maxWidth={400} 
                            maxHeight={400} 
                          />
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center bg-black/50 rounded-lg overflow-hidden w-20 h-20 border border-white/10 mt-6 md:mt-0">
                        {game.img ? <img src={game.img || undefined} alt="" className="w-full h-full object-cover" /> : <Gamepad2 className="w-8 h-8 text-white/20" />}
                      </div>
                      <button onClick={() => deleteGame(game.id)} className="text-red-400 hover:text-red-300 p-2 ml-auto md:ml-0"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <button onClick={addPayment} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  <Plus className="w-4 h-4" /> Tambah Metode
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="bg-charcoal border border-white/10 rounded-lg p-4 flex gap-4 items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Nama Metode</label>
                          <input type="text" value={pm.name || ''} onChange={(e) => updatePayment(pm.id, 'name', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                        </div>
                        <div>
                          <ImageInput 
                            label="Image URL / Upload (Logo)" 
                            value={pm.img} 
                            onChange={(val: string) => updatePayment(pm.id, 'img', val)} 
                            maxWidth={200} 
                            maxHeight={200} 
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {pm.img ? (
                          <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center p-1 border border-white/10">
                            <img src={pm.img || undefined} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center p-1 border border-white/10 text-[10px] text-gray-500 text-center leading-tight">
                            Tanpa<br/>Logo
                          </div>
                        )}
                        <button onClick={() => deletePayment(pm.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4">
                <button onClick={addFeature} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  <Plus className="w-4 h-4" /> Tambah Keunggulan
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {features.map(feat => (
                    <div key={feat.id} className="p-4 bg-charcoal border border-white/10 rounded-lg flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Title</label>
                            <input type="text" value={feat.title || ''} onChange={(e) => updateFeature(feat.id, 'title', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                            <textarea value={feat.desc || ''} onChange={(e) => updateFeature(feat.id, 'desc', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none h-20" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Icon Name (e.g. zap, shield, tag, credit-card)</label>
                            <input type="text" value={feat.icon || ''} onChange={(e) => updateFeature(feat.id, 'icon', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                          </div>
                        </div>
                        <button onClick={() => deleteFeature(feat.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'testimonials' && (
              <div className="space-y-4">
                <button onClick={addTestimonial} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  <Plus className="w-4 h-4" /> Tambah Testimoni
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {testimonials.map(testi => (
                    <div key={testi.id} className="p-4 bg-charcoal border border-white/10 rounded-lg flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Name</label>
                              <input type="text" value={testi.name || ''} onChange={(e) => updateTestimonial(testi.id, 'name', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Role / Job</label>
                              <input type="text" value={testi.role || ''} onChange={(e) => updateTestimonial(testi.id, 'role', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Text / Review</label>
                            <textarea value={testi.text || ''} onChange={(e) => updateTestimonial(testi.id, 'text', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none h-20" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Rating (1-5)</label>
                            <input type="number" min="1" max="5" value={testi.rating || 5} onChange={(e) => updateTestimonial(testi.id, 'rating', parseInt(e.target.value))} className="w-32 bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                          </div>
                        </div>
                        <button onClick={() => deleteTestimonial(testi.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button onClick={addArticle} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                    <Plus className="w-4 h-4" /> Tambah Artikel
                  </button>
                  {articles.length === 0 && (
                    <button onClick={seedSEOArticles} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-500">
                      Generate 6 SEO Articles
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {articles.map(art => (
                    <div key={art.id} className="p-4 bg-charcoal border border-white/10 rounded-lg flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Judul Artikel</label>
                              <input type="text" value={art.title || ''} onChange={(e) => updateArticle(art.id, 'title', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Slug URL</label>
                              <input type="text" value={art.slug || ''} onChange={(e) => updateArticle(art.id, 'slug', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Ringkasan (Excerpt)</label>
                            <textarea value={art.excerpt || ''} onChange={(e) => updateArticle(art.id, 'excerpt', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none h-16" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Isi Konten (HTML / Markdown)</label>
                            <textarea value={art.content || ''} onChange={(e) => updateArticle(art.id, 'content', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none h-40 font-mono" />
                          </div>
                          <div>
                            <ImageInput 
                              label="Banner Image URL / Upload" 
                              value={art.img} 
                              onChange={(val: string) => updateArticle(art.id, 'img', val)} 
                              maxWidth={1200} 
                              maxHeight={630} 
                            />
                          </div>
                        </div>
                        <button onClick={() => deleteArticle(art.id)} className="text-red-400 hover:text-red-300 p-1 mt-6"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
