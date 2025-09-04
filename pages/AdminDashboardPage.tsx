import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Profile, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import DatabaseSetup from '../components/DatabaseSetup';

const AdminDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const query = useCallback(() => supabase
    .from('profiles')
    .select('*')
    .eq('role', UserRole.Designer)
    .or('is_verified.is.null,is_verified.eq.false')
    .order('updated_at', { ascending: true }),
    []
  );

  const { data: unverifiedDesigners, loading, error, isSchemaError, refetch } = useSupabaseQuery<Profile>(query);
  
  useEffect(() => {
    if (!authLoading && (!user || user.profile?.role !== UserRole.Admin)) {
      toast.error('Access denied.');
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
      if (error && !isSchemaError) {
          toast.error(`Error fetching designers: ${error.message}`);
      }
  }, [error, isSchemaError]);

  const handleApprove = async (designerId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', designerId);

      if (updateError) throw updateError;
      
      toast.success('Designer verified successfully!');
      refetch(); // Refetch the list of unverified designers
    } catch (e: any) {
      console.error('Failed to verify designer:', e);
      const message = typeof e?.message === 'string' ? e.message : 'An unknown error occurred';
      toast.error(`Failed to verify designer: ${message}`);
    }
  };
  
  if (authLoading || !user || user.profile?.role !== UserRole.Admin) {
      return <div className="flex justify-center pt-20"><Spinner/></div>;
  }

  if (isSchemaError) {
      return <DatabaseSetup />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Unverified Designer Profiles</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {unverifiedDesigners && unverifiedDesigners.length > 0 ? (
              unverifiedDesigners.map(designer => (
                <div key={designer.id} className="border p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{designer.full_name}</h3>
                    <p className="text-sm text-gray-500">Registered: {new Date(designer.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link to={`/profile/${designer.id}`} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm">
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleApprove(designer.id)}
                      className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-300 text-sm"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No unverified designers found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
