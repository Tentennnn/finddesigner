import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Profile, PortfolioItem, UserRole } from '../types';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      if (profileData.role === UserRole.Designer) {
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('designer_id', userId);
        
        if (portfolioError) throw portfolioError;
        setPortfolio(portfolioData || []);
      }
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      const message = typeof error?.message === 'string' ? error.message : 'An unknown error occurred';
      toast.error(`Error fetching profile data: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  if (loading) return <Spinner />;
  if (!profile) return <p>{t('error')}</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
          <img src={profile.avatar_url} alt={profile.full_name} className="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-8 object-cover border-4 border-gray-200" />
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            <p className="text-gray-600 capitalize">{profile.role}</p>
            {profile.is_verified && <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full my-2 inline-block">Verified</span>}
            {user?.id === userId && (
              <button className="mt-2 text-sm text-blue-600 hover:underline">{t('editProfile')}</button>
            )}
          </div>
        </div>

        {profile.role === UserRole.Designer && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold border-b pb-2 mb-4">{t('bio')}</h2>
            <p className="text-gray-700">{profile.bio || 'No bio provided.'}</p>

            <h2 className="text-2xl font-bold border-b pb-2 mb-4 mt-8">{t('skills')}</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map(skill => (
                <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>

            <h2 className="text-2xl font-bold border-b pb-2 mb-4 mt-8">{t('portfolio')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map(item => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <img src={item.image_url || `https://picsum.photos/seed/${item.id}/400/300`} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
              {portfolio.length === 0 && <p>No portfolio items yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;