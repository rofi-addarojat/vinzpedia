// Replace the whole file to add the tabs for collections
import { useState, useEffect } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { ShieldCheck, LogOut, Settings, Image as ImageIcon, Gamepad2, CreditCard, Plus, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Data States
  const [siteContent, setSiteContent] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
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

  useEffect(() => {
    if (user && isAdmin) {
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
      return () => { unsubContent(); unsubGames(); unsubPayments(); };
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

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-charcoal-light border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h1 className="font-heading font-bold text-xl text-gold">VINZ Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('general')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'general' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Settings className="w-5 h-5" /> General Settings
          </button>
          <button onClick={() => setActiveTab('hero')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'hero' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <ImageIcon className="w-5 h-5" /> Hero Section
          </button>
          <button onClick={() => setActiveTab('games')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'games' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Gamepad2 className="w-5 h-5" /> Popular Games
          </button>
          <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === 'payments' ? 'bg-gold/10 text-gold border border-gold/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <CreditCard className="w-5 h-5" /> Payment Methods
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-red-400 hover:text-red-300 w-full px-4 py-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
            {(activeTab === 'general' || activeTab === 'hero') && (
              <button 
                onClick={handleSaveContent}
                disabled={isSaving}
                className="bg-green-cta hover:bg-green-cta-hover text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
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
            {!siteContent && (activeTab === 'general' || activeTab === 'hero') && <p className="text-gray-400">Loading content...</p>}
            
            {activeTab === 'general' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
                  <input type="text" value={siteContent?.header?.logoText || 'VINZPEDIA'} onChange={e => setSiteContent({ ...siteContent, header: { ...siteContent?.header, logoText: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp Number (Call Center)</label>
                  <input type="text" value={siteContent?.footer?.phone || '08779110477'} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, phone: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Footer Description</label>
                  <textarea value={siteContent?.footer?.description || 'Platform Top-Up Game Termurah & Terpercaya.'} onChange={e => setSiteContent({ ...siteContent, footer: { ...siteContent?.footer, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-24" />
                </div>
              </>
            )}

            {activeTab === 'hero' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Hero Main Title (HTML/Text)</label>
                  <input type="text" value={siteContent?.hero?.titleMain || 'Weekly Diamond Pass MLBB'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, titleMain: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea value={siteContent?.hero?.description || 'Total 210 Diamond...'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, description: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Old Price</label>
                    <input type="text" value={siteContent?.hero?.oldPrice || 'Rp 30.000,-'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, oldPrice: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">New Price</label>
                    <input type="text" value={siteContent?.hero?.newPrice || 'Rp 25.000,-'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, newPrice: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Image URL (Banner Hero)</label>
                  <input type="text" value={siteContent?.hero?.imageSrc || '/hero-banner.jpg'} onChange={e => setSiteContent({ ...siteContent, hero: { ...siteContent?.hero, imageSrc: e.target.value }})} className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold outline-none" />
                </div>
              </>
            )}

            {activeTab === 'games' && (
              <div className="space-y-4">
                <button onClick={addGame} className="flex items-center gap-2 bg-gold text-charcoal px-4 py-2 rounded-lg font-bold hover:bg-yellow-500">
                  <Plus className="w-4 h-4" /> Tambah Game
                </button>
                <div className="space-y-4">
                  {games.map(game => (
                    <div key={game.id} className="p-4 bg-charcoal border border-white/10 rounded-lg flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Game Name</label>
                          <input type="text" value={game.name} onChange={(e) => updateGame(game.id, 'name', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1 text-sm focus:border-gold outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tags</label>
                          <input type="text" value={game.tags} onChange={(e) => updateGame(game.id, 'tags', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1 text-sm focus:border-gold outline-none" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                          <input type="text" value={game.img} onChange={(e) => updateGame(game.id, 'img', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1 text-sm focus:border-gold outline-none" />
                        </div>
                      </div>
                      <button onClick={() => deleteGame(game.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-5 h-5" /></button>
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
                          <label className="block text-xs text-gray-500 mb-1">Image URL (Logo)</label>
                          <input type="text" value={pm.img || ''} onChange={(e) => updatePayment(pm.id, 'img', e.target.value)} className="w-full bg-charcoal-light border border-white/10 rounded px-3 py-1.5 text-sm focus:border-gold outline-none" placeholder="https://..." />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        {pm.img ? (
                          <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center p-1 border border-white/10">
                            <img src={pm.img} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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

          </div>
        </div>
      </main>
    </div>
  );
}
