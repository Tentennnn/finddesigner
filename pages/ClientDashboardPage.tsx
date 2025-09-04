import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Job, Proposal } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import DatabaseSetup from '../components/DatabaseSetup';

const ClientDashboardPage: React.FC = () => {
  const [proposals, setProposals] = useState<Map<string, Proposal[]>>(new Map());
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) { // user object can be null when logged out
        navigate('/');
    } else if (user && user.profile?.role !== 'client') {
        navigate('/');
    }
  }, [user, navigate]);


  const jobsQuery = useCallback(() => {
    if (!user) {
        // This is a dummy query to satisfy the hook's type requirement when user is not available.
        // The hook will not run if user is null due to the useEffect dependency.
        return supabase.from('jobs').select('*').limit(0);
    }
    return supabase
        .from('jobs')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });
  }, [user]);

  const { data: jobs, loading: jobsLoading, error: jobsError, isSchemaError } = useSupabaseQuery<Job>(jobsQuery);

  useEffect(() => {
      if (jobsError && !isSchemaError) {
          toast.error(`Error fetching dashboard data: ${jobsError.message}`);
      }
  }, [jobsError, isSchemaError]);

  useEffect(() => {
    const fetchProposals = async () => {
        if (!jobs || jobs.length === 0) {
            setProposals(new Map());
            return;
        };
        setProposalsLoading(true);
        const jobIds = jobs.map(job => job.id);
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select('*, designer_profile:profiles(full_name, avatar_url)')
          .in('job_id', jobIds);
        
        if (proposalError) {
            toast.error(`Error fetching proposals: ${proposalError.message}`);
        } else {
            const proposalMap = new Map<string, Proposal[]>();
            proposalData?.forEach(p => {
                const current = proposalMap.get(p.job_id) || [];
                proposalMap.set(p.job_id, [...current, p]);
            });
            setProposals(proposalMap);
        }
        setProposalsLoading(false);
    }

    if (!isSchemaError && jobs) {
        fetchProposals();
    }
  }, [jobs, isSchemaError]);

  if (isSchemaError) {
      return <DatabaseSetup />;
  }

  const loading = jobsLoading || proposalsLoading;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <Link to="/post-job" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
            {t('postJob')}
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">{t('myJobPostings')}</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {jobs && jobs.length > 0 ? jobs.map(job => (
              <div key={job.id} className="border p-4 rounded-lg hover:bg-gray-50">
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-500">Status: {job.status}</p>
                <p className="mt-2 text-blue-600 font-medium">{proposals.get(job.id)?.length || 0} {t('proposals')}</p>
                {/* Add view proposals button */}
              </div>
            )) : (
              <p>{t('noJobsPosted')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboardPage;
