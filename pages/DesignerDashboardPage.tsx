import React, { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Proposal } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import DatabaseSetup from '../components/DatabaseSetup';

const DesignerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
     if (user === null) {
        navigate('/');
     } else if (user && user.profile?.role !== 'designer') {
      navigate('/');
    }
  }, [user, navigate]);
  
  const query = useCallback(() => {
    if (!user) {
        return supabase.from('proposals').select('*').limit(0);
    }
    return supabase
        .from('proposals')
        .select('*, job:jobs(title)')
        .eq('designer_id', user.id)
        .order('created_at', { ascending: false });
  }, [user]);

  const { data: proposals, loading, error, isSchemaError } = useSupabaseQuery<Proposal>(query);
  
  useEffect(() => {
    if (error && !isSchemaError) {
        toast.error(`Error fetching proposals: ${error.message}`);
    }
  }, [error, isSchemaError]);


  const getStatusClass = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  if (isSchemaError) {
      return <DatabaseSetup />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('dashboard')}</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{t('myProposals')}</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {proposals && proposals.length > 0 ? proposals.map(proposal => (
              <div key={proposal.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Proposal for "{proposal.job?.title}"</h3>
                  <p className="text-sm text-gray-500">Submitted on: {new Date(proposal.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(proposal.status)}`}>
                  {proposal.status}
                </span>
              </div>
            )) : (
              <p>{t('noProposalsSubmitted')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignerDashboardPage;
