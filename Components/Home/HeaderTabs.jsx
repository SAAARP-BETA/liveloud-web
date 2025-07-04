'use client';

import React from 'react';
import clsx from 'clsx';

const tabs = ['ForYou', 'Following', 'Trending'];

const HeaderTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center px-4 py-2 bg-white border-b border-gray-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={clsx(
            'px-6 py-2 focus:outline-none transition-colors',
            activeTab === tab ? 'border-b-2 border-sky-500' : ''
          )}
        >
          <span
            className={clsx(
              'text-base font-medium',
              activeTab === tab ? 'text-sky-500' : 'text-gray-600'
            )}
            style={{ fontFamily: 'var(--font-medium)' }} // optional: map your font in Tailwind config
          >
            {tab === 'ForYou' ? 'For You' : tab}
          </span>
        </button>
      ))}
    </div>
  );
};

export default HeaderTabs;