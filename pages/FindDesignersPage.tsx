import React, { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Profile, UserRole } from '../types';
import Spinner from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import DatabaseSetup from '../components/DatabaseSetup';

const DesignerCard: React.FC<{ designer: Profile }> = ({ designer }) => {
    const { t } = useLanguage();
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300 flex flex-col items-center">
      <img src={designer.avatar_url} alt={designer.full_name} className="w-24 h-24 rounded-full mb-4 object-cover" />
      <h3 className="text-xl font-bold text-gray-800">{designer.full_name}</h3>
      {designer.is_verified && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full my-2">Verified</span>}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{designer.bio || "Experienced graphic designer ready to bring your ideas to life."}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {designer.skills?.slice(0, 4).map(skill => (
          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{skill}</span>
        ))}
      </div>
      <Link to={`/profile/${designer.id}`} className="mt-auto bg-transparent border border-blue-600 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300">
        {t('view')} {t('profile')}
      </Link>
    </div>
  );
};

const FindDesignersPage: React.FC = () => {
  const { t } = useLanguage();

  const query = useCallback(() => supabase
    .from('profiles')
    .select('*')
    .eq('role', UserRole.Designer)
    .eq('is_verified', true)
    .order('full_name'),
    []
  );

  const { data: designers, loading, error, isSchemaError } = useSupabaseQuery<Profile>(query);

  useEffect(() => {
    if (error && !isSchemaError) {
      toast.error(`Error fetching designers: ${error.message}`);
    }
  }, [error, isSchemaError]);

  if (isSchemaError) {
    return <DatabaseSetup />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('findDesigners')}</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designers && designers.length > 0 ? designers.map(designer => (
            <DesignerCard key={designer.id} designer={designer} />
          )) : <p>No verified designers found.</p>}
        </div>
      )}
    </div>
  );
};

export default FindDesignersPage;
