
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Client);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      let dashboardPath = '/';
      if (user.profile?.role === UserRole.Client) {
        dashboardPath = '/dashboard/client';
      } else if (user.profile?.role === UserRole.Designer) {
        dashboardPath = '/dashboard/designer';
      } else if (user.profile?.role === UserRole.Admin) {
        dashboardPath = '/dashboard/admin';
      }
      navigate(dashboardPath);
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (signUpError) {
      toast.error(signUpError.message);
    } else if (signUpData.user) {
      // The manual client-side insert was removed.
      // It failed due to RLS policies because the user is not authenticated
      // until they verify their email.
      // The standard approach is to use a DB trigger on the backend to create the profile
      // from the metadata provided in the signUp call.
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } else {
       toast.error('An unexpected error occurred during sign up.');
    }
    setLoading(false);
  };

  if (user) {
    return null; // Prevent rendering the signup form while redirecting
  }

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('createAnAccount')}</h2>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              {t('fullName')}
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
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
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">{t('iAmA')}</label>
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input type="radio" name="role" value={UserRole.Client} checked={role === UserRole.Client} onChange={() => setRole(UserRole.Client)} className="form-radio text-blue-600"/>
                    <span className="ml-2 text-gray-700">{t('client')}</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="role" value={UserRole.Designer} checked={role === UserRole.Designer} onChange={() => setRole(UserRole.Designer)} className="form-radio text-blue-600"/>
                    <span className="ml-2 text-gray-700">{t('designer')}</span>
                </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-400"
            >
              {loading ? t('loading') : t('signup')}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-6">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;