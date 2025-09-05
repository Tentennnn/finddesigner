
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user || !user.profile) return '/';
    switch (user.profile.role) {
      case UserRole.Admin:
        return '/dashboard/admin';
      case UserRole.Client:
        return '/dashboard/client';
      case UserRole.Designer:
        return '/dashboard/designer';
      default:
        return '/';
    }
  };

  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link to={to} className="text-gray-600 hover:text-blue-600 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium">
      {children}
    </Link>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              {t('appName')}
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/find-work">{t('findWork')}</NavLink>
            <NavLink to="/find-designers">{t('findDesigners')}</NavLink>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
                <button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center space-x-1 p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    aria-label="Switch Language"
                    title="Switch Language"
                >
                    <span className="text-sm font-medium">{language === 'en' ? 'English' : 'ខ្មែរ'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <button
                    onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left flex items-center px-4 py-2 text-sm ${language === 'en' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700'} hover:bg-gray-100`}
                    >
                    English
                    </button>
                    <button
                    onClick={() => { setLanguage('km'); setIsLangMenuOpen(false); }}
                    className={`w-full text-left flex items-center px-4 py-2 text-sm font-kantumruy ${language === 'km' ? 'font-semibold text-blue-600 bg-blue-50' : 'text-gray-700'} hover:bg-gray-100`}
                    >
                    ខ្មែរ
                    </button>
                </div>
                )}
            </div>
            {user ? (
              <div className="relative">
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2">
                  <img src={user.profile?.avatar_url || `https://picsum.photos/seed/${user.id}/40/40`} alt="avatar" className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">{user.profile?.full_name || user.email}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <Link to={getDashboardPath()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('dashboard')}</Link>
                    <Link to={`/profile/${user.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('profile')}</Link>
                    <Link to="/profile/edit" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('editProfile')}</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('logout')}</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-blue-600">{t('login')}</Link>
                <Link to="/signup" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{t('signup')}</Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600">
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             <Link to="/find-work" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('findWork')}</Link>
             <Link to="/find-designers" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('findDesigners')}</Link>
             {user ? (
                 <>
                    <Link to={getDashboardPath()} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('dashboard')}</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('logout')}</button>
                 </>
             ) : (
                <>
                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('login')}</Link>
                    <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">{t('signup')}</Link>
                </>
             )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
