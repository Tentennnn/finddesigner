
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FindWorkPage from './pages/FindWorkPage';
import FindDesignersPage from './pages/FindDesignersPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import DesignerDashboardPage from './pages/DesignerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import PostJobPage from './pages/PostJobPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import { Toaster } from 'react-hot-toast';
import EditProfilePage from './pages/EditProfilePage';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/update-password" element={<UpdatePasswordPage />} />
                <Route path="/find-work" element={<FindWorkPage />} />
                <Route path="/find-designers" element={<FindDesignersPage />} />
                <Route path="/dashboard/client" element={<ClientDashboardPage />} />
                <Route path="/dashboard/designer" element={<DesignerDashboardPage />} />
                <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/post-job" element={<PostJobPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" reverseOrder={false} />
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
