
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Provider } from '@supabase/supabase-js';

const TelegramIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.84c-.15.65-.55 2.53-1.01 4.57-.46 2.06-.92 2.74-1.4 2.76-.45.03-.8-.25-1.21-.5-.65-.4-1.02-.65-1.64-1.02-.76-.45-1.32-.69-.65-1.32.22-.23 3.94-3.65 4.02-3.95.03-.1.03-.2-.05-.25-.07-.05-.17 0-.27.05-.18.07-2.81 1.78-3.95 2.6-.32.25-.6.37-.87.37-.3 0-.75-.13-1.13-.37-.45-.3-1.02-.48-1.02-1.05 0-.42.25-.65.68-1.02.27-.25 5.51-2.59 5.66-2.61.25-.03.43.1.37.36z"></path>
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        toast.error(t('invalidCredentials'));
      } else if (error.message.includes('Email not confirmed')) {
        toast.error(t('emailNotConfirmed'));
      } else {
        toast.error(t('loginError'));
        console.error('Login error:', error.message);
      }
      setLoading(false);
    } else if (data.user) {
      // Fetch profile to determine role after login
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      // Handle profile fetch error. 'PGRST116' means the profile was not found.
      // This is expected for new users whose profile is being created by a trigger.
      // We can ignore it and redirect to home; AuthContext will pick up the profile later.
      if (profileError && profileError.code !== 'PGRST116') {
          toast.error('Could not fetch user profile.');
          navigate('/');
      } else {
        toast.success('Logged in successfully!');
        const role = profileData?.role; // profileData can be null if not found
        if (role === UserRole.Client) {
          navigate('/dashboard/client');
        } else if (role === UserRole.Designer) {
          navigate('/dashboard/designer');
        } else if (role === UserRole.Admin) {
          navigate('/dashboard/admin');
        } else {
          // Fallback for new users (profile not ready) or unknown roles.
          navigate('/');
        }
      }
      setLoading(false);
    }
  };
  
  // FIX: Changed 'provider' type from Provider to string to allow 'telegram',
  // which is a valid Supabase provider but may not be in this version of the SDK's Provider type.
  const handleOAuthLogin = async (provider: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
    });
    if (error) {
      toast.error(`Error logging in with ${provider}: ${error.message}`);
      setLoading(false);
    }
    // No need to setLoading(false) on success, as the page will redirect away.
  };
  
  if (user) {
      let dashboardPath = '/';
      if (user.profile?.role === UserRole.Client) dashboardPath = '/dashboard/client';
      if (user.profile?.role === UserRole.Designer) dashboardPath = '/dashboard/designer';
      if (user.profile?.role === UserRole.Admin) dashboardPath = '/dashboard/admin';
      navigate(dashboardPath);
      return null;
  }

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('loginToYourAccount')}</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              {t('emailAddress')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  {t('forgotPassword')}
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('login')}
            </button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>
        
        <div className="space-y-3">
             <button
                onClick={() => handleOAuthLogin('telegram')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#2AABEE] text-sm font-medium text-white hover:bg-[#2297d3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <TelegramIcon />
                Continue with Telegram
            </button>
        </div>
        
        <p className="text-center text-gray-600 text-sm mt-6">
          {t('dontHaveAccount')}{' '}
          <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-800">
            {t('signup')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
