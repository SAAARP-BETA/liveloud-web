'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../utils/config';
import toast from 'react-hot-toast';

const Poll = ({ postId, pollId, question, initialOptions, usersVoted = [] }) => {
  const [options, setOptions] = useState(initialOptions || []);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && usersVoted?.includes(user._id)) {
      setVoted(true);
    }
  }, [user, usersVoted]);

  const totalVotes = options?.reduce((acc, option) => acc + option.votes, 0) || 0;

  const handleVote = async () => {
    if (selectedOption !== null && postId) {
      try {
        const response = await fetch(`${API_ENDPOINTS.SOCIAL}/posts/${postId}/poll/vote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ optionId: options[selectedOption]._id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to vote');
        }

        const updatedPoll = await response.json();
        setOptions(updatedPoll.options);
        setVoted(true);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 max-w-md mx-auto my-5 font-sans">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{question}</h2>
      {voted ? (
        <div className="mt-4 space-y-3">
          {options?.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return ( 
              <div key={index}>
                <div className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>{option.option}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all ease-out duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {options?.map((option, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 cursor-pointer flex items-center transition-all duration-200 ${selectedOption === index ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'}`}
              onClick={() => setSelectedOption(index)}
            >
              <input
                type="radio"
                id={`option-${index}-${pollId}`}
                name={`poll-${pollId}`}
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor={`option-${index}-${pollId}`} className="ml-3 w-full text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">{option.option}</label>
            </div>
          ))}
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer mt-4 w-full disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default Poll;
