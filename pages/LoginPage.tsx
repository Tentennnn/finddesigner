
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Provider } from '@supabase/supabase-js';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.356-11.303-7.962l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.986,36.63,44,30.686,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.82c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.852 0 1.338-.012 2.419-.012 2.747 0 .268.18.578.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"></path>
    </svg>
);

const DiscordIcon = () => (
    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4464.8257-.618 1.2525a17.2963 17.2963 0 00-5.4856 0 17.301 17.301 0 00-.618-1.2525.0741.0741 0 00-.0785-.0371c-1.7381.4464-3.4144 1.0066-4.8851 1.5152a.0741.0741 0 00-.05.0934c.4464 1.6166.9302 3.3261 1.2525 5.0805a17.9108 17.9108 0 00-1.5654 2.8596.0741.0741 0 00.0094.0841c.2602.232.5498.4464.8587.6273a.0741.0741 0 00.0841-.0094c.3084-.299.588-.6273.819-1.0066a15.228 15.228 0 002.6415 1.0357.0741.0741 0 00.0934-.028c.394-.2896.7403-.618 1.0125-.9958a12.5023 12.5023 0 00-2.548-1.0125.0741.0741 0 00-.0692-.0094 11.2232 11.2232 0 01-1.6346.2016.0741.0741 0 00-.0692.0841c-.028.103-.0468.2016-.0741.3084a.0741.0741 0 00.0468.0841c1.8072.4838 3.5358.7497 5.2738.7497s3.4666-.2659 5.2738-.7497a.0741.0741 0 00.0468-.0841c-.028-.1068-.0468-.2016-.0741-.3084a.0741.0741 0 00-.0692-.0841c-.5693-.0934-1.1387-.168-1.6346-.2016a.0741.0741 0 00-.0692.0094c-.9518.337-1.8448.7115-2.548 1.0125a.0741.0741 0 00.0934.028c.2722.3778.618.7062 1.0125.9958a.0741.0741 0 00.0841.0094c.2805-.1809.5701-.3953.8587-.6273a.0741.0741 0 00.0094-.0841c-.6086-1.7248-1.157-3.4611-1.5654-2.8596s.8051-3.464 1.2525-5.0805a.0741.0741 0 00-.05-.0934z"></path>
    </svg>
);

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

  useEffect(() => {
    if (user) {
        let dashboardPath = '/';
        if (user.profile?.role === UserRole.Client) dashboardPath = '/dashboard/client';
        if (user.profile?.role === UserRole.Designer) dashboardPath = '/dashboard/designer';
        if (user.profile?.role === UserRole.Admin) dashboardPath = '/dashboard/admin';
        navigate(dashboardPath);
    }
  }, [user, navigate]);

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
      return null; // Prevent rendering the login form while redirecting
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
            <span className="px-2 bg-white text-gray-500">{t('continueWith')}</span>
          </div>
        </div>
        
        <div className="space-y-3">
             <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GoogleIcon />
                {t('continueWithGoogle')}
            </button>
             <button
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#333] text-sm font-medium text-white hover:bg-[#444] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GitHubIcon />
                {t('continueWithGitHub')}
            </button>
             <button
                onClick={() => handleOAuthLogin('discord')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#5865F2] text-sm font-medium text-white hover:bg-[#4752C4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5865F2] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DiscordIcon />
                {t('continueWithDiscord')}
            </button>
             <button
                onClick={() => handleOAuthLogin('telegram')}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-[#2AABEE] text-sm font-medium text-white hover:bg-[#2297d3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AABEE] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <TelegramIcon />
                {t('continueWithTelegram')}
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
