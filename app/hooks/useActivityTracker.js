"use client";

import { useContext } from 'react';
import { ActivityContext } from '../context/ActivityContext';

export const useActivityTracker = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityTracker must be used within an ActivityProvider');
  }
  return context;
};