
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const redirectUrl = `${window.location.origin}/#/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    setLoading(false);
    if (error) {
      toast.error(t('failedToSendReset'));
      console.error('Password reset error:', error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('resetPassword')}</h2>
        {submitted ? (
          <div className="text-center">
            <p className="text-gray-700">{t('checkEmailForReset')}</p>
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 mt-4 inline-block">
                &larr; Back to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <p className="text-sm text-gray-600 mb-4">Enter your email address and we will send you a link to reset your password.</p>
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
                placeholder="your@email.com"
              />
            </div>
            <div className="flex items-center justify-between mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-blue-400"
              >
                {loading ? t('loading') : t('sendResetLink')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
