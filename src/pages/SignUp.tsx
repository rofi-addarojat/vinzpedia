import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password harus minimal 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName: name });
      
      // Store user info in Firestore securely
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: name,
        role: 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan oleh akun lain.');
      } else {
        setError(err.message || 'Gagal mendaftar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white flex items-center justify-center p-4">
      <div className="bg-charcoal-light max-w-md w-full p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center gap-2 justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded flex items-center justify-center">
                <span className="text-charcoal font-black text-2xl leading-none tracking-tighter">V</span>
              </div>
              <span className="font-heading font-black text-2xl tracking-tight leading-none">
                VINZ<span className="text-gold">PEDIA</span>
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-heading mb-2">Buat Akun Baru</h1>
          <p className="text-gray-400 text-sm">Bergabunglah untuk layanan top-up instan.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nama Lengkap</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold outline-none focus:ring-1 focus:ring-gold transition-all"
                placeholder="Samsudin"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold outline-none focus:ring-1 focus:ring-gold transition-all"
                placeholder="masukkan email anda"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-gold outline-none focus:ring-1 focus:ring-gold transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-cta hover:bg-green-cta-hover text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 glow-gold transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-gold font-semibold hover:text-yellow-400 transition-colors">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
