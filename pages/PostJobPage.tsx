
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import toast from 'react-hot-toast';

const PostJobPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.profile?.role !== 'client') {
      toast.error('Only clients can post jobs.');
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const required_skills = skills.split(',').map(s => s.trim()).filter(s => s);

    const { error } = await supabase.from('jobs').insert({
      title,
      description,
      budget: Number(budget),
      deadline,
      required_skills,
      client_id: user.id,
      status: 'open',
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Job posted successfully!');
      navigate('/dashboard/client');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{t('postJob')}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">{t('jobTitle')}</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('jobDescription')}</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">{t('budget')}</label>
              <input type="number" id="budget" value={budget} onChange={e => setBudget(Number(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">{t('deadline')}</label>
              <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">{t('requiredSkills')}</label>
            <input type="text" id="skills" value={skills} onChange={e => setSkills(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Logo Design, Photoshop, Illustrator"/>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
              {loading ? t('loading') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJobPage;
