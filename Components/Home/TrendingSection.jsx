'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const TrendingSection = ({ trendingTags = [], onTagPress = () => {} }) => {
  return (
    <div className="mt-2 mb-4 bg-white rounded-xl mx-4 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="text-base text-gray-800 font-bold">Trending Tags</h2>
      </div>

      {/* Tags */}
      {trendingTags.map((item, index) => (
        <button
          key={index}
          onClick={() => onTagPress(item)}
          className={clsx(
            'flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition',
            index !== trendingTags.length - 1 ? 'border-b border-gray-100' : ''
          )}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-blue-500 font-bold text-sm">#{index + 1}</span>
            </div>
            <div className="text-left">
              <p className="text-gray-800 font-medium">#{item.tag}</p>
              <p className="text-xs text-gray-500">{item.count} posts</p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      ))}
    </div>
  );
};

export default TrendingSection;