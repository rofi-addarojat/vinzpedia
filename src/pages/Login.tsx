import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah.');
      } else {
        setError(err.message || 'Gagal untuk login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const res = await signInWithPopup(auth, googleProvider);
      
      // Ensure profile exists for Google login users
      const userDocRef = doc(db, 'users', res.user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) {
        const newProfile = {
          email: res.user.email || '',
          displayName: res.user.displayName || res.user.email?.split('@')[0] || 'User',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, newProfile);
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Gagal login dengan Google.');
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
          <h1 className="text-2xl font-bold font-heading mb-2">Selamat Datang Kembali</h1>
          <p className="text-gray-400 text-sm">Masuk ke akun Anda untuk melanjutkan top-up.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex justify-end mt-2">
              <Link to="/reset-password" className="text-xs text-gold hover:text-yellow-400 transition-colors">
                Lupa Password?
              </Link>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-cta hover:bg-green-cta-hover text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 glow-gold transition-all disabled:opacity-50"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-charcoal-light text-gray-400">Atau masuk dengan</span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link to="/signup" className="text-gold font-semibold hover:text-yellow-400 transition-colors">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
