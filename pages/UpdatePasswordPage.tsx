
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const UpdatePasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { session, loading: authLoading } = useAuth();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast.error("Password should be at least 6 characters.");
        return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    if (error) {
      toast.error(t('failedToUpdatePass'));
      console.error('Password update error:', error);
    } else {
      // Sign out of the recovery session before redirecting
      await supabase.auth.signOut();
      toast.success(t('passwordUpdatedSuccess'));
      toast(t('passwordUpdatedInfo'), { icon: 'ℹ️', duration: 5000 });
      navigate('/login');
    }
  };
  
  if (authLoading) {
      return <div className="flex justify-center pt-20"><Spinner /></div>;
  }

  // If auth is loaded and there's no session, the token is invalid or expired.
  if (!session) {
      return (
          <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid or Expired Link</h2>
              <p className="text-gray-700">This password reset link is not valid. It may have already been used or expired. Please request a new one from the 'Forgot Password' page.</p>
          </div>
      )
  }

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('updatePassword')}</h2>
        <form onSubmit={handlePasswordUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              {t('newPassword')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              minLength={6}
              placeholder="Enter new password (min. 6 chars)"
            />
          </div>
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-400"
            >
              {loading ? t('loading') : t('updatePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
