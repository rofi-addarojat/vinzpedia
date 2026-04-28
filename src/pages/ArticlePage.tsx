import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticle = async () => {
      try {
        const q = query(collection(db, 'articles'), where('slug', '==', slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setArticle({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white px-4">
        <BookOpen className="w-20 h-20 text-white/10 mb-6" />
        <h1 className="text-3xl font-bold font-heading mb-4 text-center">Artikel Tidak Ditemukan</h1>
        <p className="text-gray-400 mb-8 text-center">Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/blog" className="px-6 py-3 bg-gold text-charcoal font-bold rounded-lg hover:bg-yellow-500">
          Kembali ke Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col font-sans">
      <nav className="border-b border-white/5 bg-[#111111]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-sm uppercase tracking-wider">Kembali ke Blog</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 font-heading font-black text-2xl tracking-tight uppercase">
            Vinz<span className="text-gold">Pedia</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <article>
          <header className="mb-12">
            <div className="inline-block px-3 py-1 bg-white/5 text-gold text-xs font-bold uppercase tracking-widest rounded mb-6">Artikel SEO</div>
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-black font-heading leading-tight mb-6">
              {article.title}
            </h1>
            <div className="text-gray-400 text-sm font-medium">
              Dipublikasikan pada {new Date(article.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          {article.img && (
            <div className="w-full aspect-[16/9] bg-white/5 rounded-3xl overflow-hidden mb-12 shadow-2xl border border-white/5">
              <img src={article.img} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="max-w-none text-gray-300 leading-relaxed
              [&>h1]:text-3xl [&>h1]:font-black [&>h1]:text-gold [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:font-heading
              [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gold [&>h2]:mb-4 [&>h2]:mt-8 [&>h2]:font-heading
              [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-gold [&>h3]:mb-4 [&>h3]:mt-6 [&>h3]:font-heading
              [&>h4]:text-lg [&>h4]:font-bold [&>h4]:text-white [&>h4]:mb-3 [&>h4]:mt-5 [&>h4]:font-heading
              [&>p]:mb-6 [&>p]:leading-loose
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
              [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
              [&>a]:text-gold hover:[&>a]:underline hover:[&>a]:text-yellow-400
              [&>strong]:text-white [&>em]:text-gray-200 [&>blockquote]:border-l-4 [&>blockquote]:border-gold [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      </main>

      <footer className="border-t border-white/5 py-12 text-center bg-[#0a0a0a]">
        <div className="max-w-xl mx-auto px-4">
          <h3 className="text-2xl font-black font-heading mb-4 text-white">Butuh Top Up Game?</h3>
          <p className="text-gray-400 mb-8">Kunjungi halaman beranda kami untuk melihat koleksi game dengan harga termurah dan proses instan.</p>
          <Link to="/#games" className="inline-block px-8 py-4 bg-gold text-charcoal font-bold rounded-xl hover:bg-yellow-500 hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            Lihat Katalog Game
          </Link>
        </div>
      </footer>
    </div>
  );
}
