import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';

export default function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsub = onSnapshot(collection(db, 'articles'), (snapshot) => {
      if (!snapshot.empty) {
        setArticles(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      <nav className="border-b border-white/5 bg-[#111111]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-2 font-heading font-black text-2xl tracking-tight uppercase">
            Blog<span className="text-gold">Vinz</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="text-center md:text-left mb-16">
          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Update & Tips <br/><span className="text-gold">Seputar Game</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Simak berita terbaru, panduan top-up, serta trik jitu seputar dunia game online yang diupdate secara berkala.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-white/5 bg-white/5 rounded-3xl">
            <BookOpen className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-xl text-gray-400 font-bold">Belum ada artikel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art) => (
              <Link to={`/blog/${art.slug}`} key={art.id} className="group flex flex-col bg-[#1A1A1A] border border-white/5 rounded-3xl overflow-hidden hover:border-gold/30 transition-all hover:translate-y-[-4px]">
                <div className="aspect-[16/10] bg-black/50 relative overflow-hidden">
                  {art.img ? (
                    <img src={art.img} alt={art.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] to-transparent opacity-80" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-3">
                    Artikel
                  </div>
                  <h2 className="text-xl font-bold font-heading leading-tight mb-4 group-hover:text-gold transition-colors line-clamp-2">
                    {art.title}
                  </h2>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-1 flex-grow">
                    {art.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-gold transition-colors w-full justify-between mt-auto">
                    <span>Baca Selengkapnya</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} VinzPedia. All rights reserved.</p>
      </footer>
    </div>
  );
}
