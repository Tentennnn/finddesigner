import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import DatabaseSetup from '../components/DatabaseSetup';

const EditProfilePage: React.FC = () => {
  const { user, loading: authLoading, refetchUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("You must be logged in to edit your profile.");
      navigate('/login');
    } else if (user && user.profile) {
      setFullName(user.profile.full_name || '');
      setBio(user.profile.bio || '');
      setSkills(user.profile.skills?.join(', ') || '');
      setAvatarUrl(user.profile.avatar_url || null);
      setAvatarPreview(user.profile.avatar_url || null);
    }
  }, [user, authLoading, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    let newAvatarUrl = avatarUrl;

    // 1. Handle Avatar Upload
    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes('bucket not found')) {
            toast.error("Storage setup is required for avatar uploads.");
            setShowSetupGuide(true);
        } else {
            toast.error(`Avatar upload failed: ${uploadError.message}.`);
        }
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      newAvatarUrl = urlData.publicUrl;
    }

    // 2. Prepare Profile Updates
    const profileUpdates = {
      full_name: fullName,
      bio,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      avatar_url: newAvatarUrl,
      updated_at: new Date().toISOString(),
    };

    // 3. Update Profile Table
    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    setLoading(false);

    if (profileError) {
      toast.error(`Failed to update profile: ${profileError.message}`);
    } else {
      toast.success('Profile updated successfully!');
      await refetchUser();
      navigate(`/profile/${user.id}`);
    }
  };
  
  if (showSetupGuide) {
    return <DatabaseSetup />;
  }
  
  if (authLoading || !user) {
    return <div className="flex justify-center pt-20"><Spinner /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('editProfile')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('avatar')}</label>
            <div className="mt-2 flex items-center gap-4">
                <img
                    src={avatarPreview || `https://picsum.photos/seed/${user.id}/128/128`}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <span>{t('uploadNewAvatar')}</span>
                    <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/gif" />
                </label>
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t('fullName')}</label>
            <input type="text" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">{t('bio')}</label>
            <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">{t('skills')}</label>
            <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Logo Design, Photoshop, Illustrator"/>
          </div>
          
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate(-1)} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('cancel')}
            </button>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
              {loading ? <Spinner /> : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;