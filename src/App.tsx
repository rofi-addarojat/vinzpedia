import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';

export default function App() {
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_content', 'landing'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const logoText = data.header?.logoText || 'VINZPEDIA';
        const faviconImg = data.header?.faviconImg;
        
        document.title = logoText;
        
        if (faviconImg) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconImg;
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
