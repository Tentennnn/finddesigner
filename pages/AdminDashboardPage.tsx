import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Profile, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboardPage: React.FC = () => {
  const [unverifiedDesigners, setUnverifiedDesigners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUnverifiedDesigners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', UserRole.Designer)
        .or('is_verified.is.null,is_verified.eq.false') // Fetch where is_verified is null or false
        .order('updated_at', { ascending: true });

      if (error) throw error;
      setUnverifiedDesigners(data || []);
    } catch (error: any) {
      console.error('Error fetching designers:', error);
      const message = typeof error?.message === 'string' ? error.message : 'An unknown error occurred';
      toast.error(`Error fetching designers: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || !user) return; // Wait for auth loading to finish
    
    if (user.profile?.role !== UserRole.Admin) {
      toast.error('Access denied.');
      navigate('/');
    } else {
      fetchUnverifiedDesigners();
    }
  }, [user, navigate, fetchUnverifiedDesigners, loading]);

  const handleApprove = async (designerId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', designerId);

      if (error) throw error;
      
      toast.success('Designer verified successfully!');
      setUnverifiedDesigners(prev => prev.filter(d => d.id !== designerId));
    } catch (error: any) {
      console.error('Failed to verify designer:', error);
      const message = typeof error?.message === 'string' ? error.message : 'An unknown error occurred';
      toast.error(`Failed to verify designer: ${message}`);
    }
  };
  
  if (!user && !loading) {
      navigate('/login');
      return null;
  }
  
  if (user && user.profile?.role !== UserRole.Admin) {
      return null; // Avoid rendering content while redirecting
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
            {unverifiedDesigners.length > 0 ? (
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