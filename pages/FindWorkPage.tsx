import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Job } from '../types';
import Spinner from '../components/Spinner';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import DatabaseSetup from '../components/DatabaseSetup';

const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold text-blue-700 mb-2">{job.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>
      <div className="text-sm text-gray-500 space-y-2">
        <p><strong>{t('budget')}:</strong> ${job.budget.toLocaleString()}</p>
        <p><strong>{t('deadline')}:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {job.required_skills.map(skill => (
            <span key={skill} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">{skill}</span>
          ))}
        </div>
      </div>
       <div className="mt-4 flex justify-end">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300">
              {t('view')} &rarr;
            </button>
        </div>
    </div>
  );
};

const FindWorkPage: React.FC = () => {
  const { t } = useLanguage();

  const query = useCallback(
    () => supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false }),
    []
  );
  
  const { data: jobs, loading, error, isSchemaError } = useSupabaseQuery<Job>(query);
  
  useEffect(() => {
      if (error && !isSchemaError) {
          toast.error(`Error fetching jobs: ${error.message}`);
      }
  }, [error, isSchemaError]);

  if (isSchemaError) {
      return <DatabaseSetup />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('findWork')}</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs && jobs.length > 0 ? jobs.map(job => (
            <JobCard key={job.id} job={job} />
          )) : <p>No open jobs found.</p>}
        </div>
      )}
    </div>
  );
};

export default FindWorkPage;
