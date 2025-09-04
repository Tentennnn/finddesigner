import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Job, Proposal } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ClientDashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Map<string, Proposal[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch jobs posted by the current client
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (jobError) throw jobError;
      setJobs(jobData || []);

      // Fetch proposals for those jobs
      if (jobData && jobData.length > 0) {
        const jobIds = jobData.map(job => job.id);
        const { data: proposalData, error: proposalError } = await supabase
          .from('proposals')
          .select('*, designer_profile:profiles(full_name, avatar_url)')
          .in('job_id', jobIds);
        
        if (proposalError) throw proposalError;
        
        const proposalMap = new Map<string, Proposal[]>();
        proposalData?.forEach(p => {
            const current = proposalMap.get(p.job_id) || [];
            proposalMap.set(p.job_id, [...current, p]);
        });
        setProposals(proposalMap);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      const message = typeof error?.message === 'string' ? error.message : 'An unknown error occurred';
      toast.error(`Error fetching dashboard data: ${message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.profile?.role !== 'client') {
      navigate('/');
    } else {
        fetchData();
    }
  }, [user, navigate, fetchData]);

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
            {jobs.length > 0 ? jobs.map(job => (
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