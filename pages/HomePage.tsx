
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <div className="py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
          {t('heroTitle')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          {t('heroSubtitle')}
        </p>
        <div className="space-x-4">
          <Link
            to="/signup"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            {t('getStarted')}
          </Link>
          <Link
            to="/find-designers"
            className="inline-block bg-gray-200 text-gray-800 font-semibold py-3 px-8 rounded-lg hover:bg-gray-300 transition-colors duration-300"
          >
            {t('browseDesigners')}
          </Link>
        </div>
      </div>
      
      <div className="py-16 bg-gray-100 rounded-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Post a Job</h3>
            <p className="text-gray-600">Clients describe their project, budget, and required skills.</p>
          </div>
          <div className="p-6">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l-2.293-2.293a1 1 0 010-1.414l7-7a1 1 0 011.414 0l7 7a1 1 0 010 1.414L15 21m-5-5h2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Receive Proposals</h3>
            <p className="text-gray-600">Talented designers submit proposals with their price and timeline.</p>
          </div>
          <div className="p-6">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.93L5.5 8m7 2H5M11 14l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Hire & Collaborate</h3>
            <p className="text-gray-600">Choose the best designer and start working together seamlessly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
