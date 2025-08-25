import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { GalleryPage } from './pages/gallery/GalleryPage';
import { UploadPage } from './pages/upload/UploadPage';
import { AlbumsPage } from './pages/albums/AlbumsPage';
import { PublicAlbumPage } from './pages/public/PublicAlbumPage';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/public/album/:id" element={<PublicAlbumPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <UploadPage />
              </ProtectedRoute>
            } />
            <Route path="/albums" element={
              <ProtectedRoute>
                <AlbumsPage />
              </ProtectedRoute>
            } />
            <Route path="/album/:id" element={
              <ProtectedRoute>
                <GalleryPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;