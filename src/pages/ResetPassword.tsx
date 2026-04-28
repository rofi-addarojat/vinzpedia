import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Cek inbox email Anda untuk instruksi reset password.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar.');
      } else {
        setError(err.message || 'Gagal mengirim email reset.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white flex items-center justify-center p-4">
      <div className="bg-charcoal-light max-w-md w-full p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded flex items-center justify-center">
              <span className="text-charcoal font-black text-2xl leading-none tracking-tighter">V</span>
            </div>
            <span className="font-heading font-black text-2xl tracking-tight leading-none">
              VINZ<span className="text-gold">PEDIA</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading mb-2">Reset Password</h1>
          <p className="text-gray-400 text-sm">Masukkan email Anda. Kami akan mengirimkan link untuk membuat password baru.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg mb-6 text-sm">
            {message}
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

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-cta hover:bg-green-cta-hover text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 glow-gold transition-all disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
