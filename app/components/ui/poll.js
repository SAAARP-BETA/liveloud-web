'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../utils/config';
import toast from 'react-hot-toast';

const Poll = ({ postId, pollId, question, initialOptions }) => {
  const [options, setOptions] = useState(initialOptions);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voted, setVoted] = useState(false);
  const { user, token } = useAuth();

  const totalVotes = options.reduce((acc, option) => acc + option.votes, 0);

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
        setOptions(updatedPoll.options.map(opt => ({ text: opt.option, votes: opt.votes, _id: opt._id })));
        setVoted(true);
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-5 shadow-md max-w-md mx-auto my-5 font-sans">
      <h2 className="text-2xl mb-5 text-gray-800">{question}</h2>
      {voted ? (
        <div className="mt-5">
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            return ( 
              <div key={index} className="mb-2.5">
                <div className="flex justify-between mb-1.5">
                  <span>{option.text}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded h-5">
                  <div
                    className="bg-blue-500 h-full rounded transition-all ease-in-out duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          <button onClick={() => setVoted(false)} className="bg-blue-500 text-white rounded px-5 py-2.5 text-base cursor-pointer mt-5 w-full">
            Vote Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {options.map((option, index) => (
            <div
              key={index}
              className={`bg-white border border-gray-300 rounded p-2.5 cursor-pointer flex items-center transition-colors hover:bg-gray-100 ${selectedOption === index ? 'bg-blue-100 border-blue-500' : ''}`}
              onClick={() => setSelectedOption(index)}
            >
              <input
                type="radio"
                id={`option-${index}`}
                name="poll"
                value={index}
                checked={selectedOption === index}
                onChange={() => setSelectedOption(index)}
                className="mr-2.5"
              />
              <label htmlFor={`option-${index}`}>{option.text}</label>
            </div>
          ))}
          <button
            onClick={handleVote}
            disabled={selectedOption === null}
            className="bg-blue-500 text-white rounded px-5 py-2.5 text-base cursor-pointer mt-5 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Vote
          </button>
        </div>
      )}
    </div>
  );
};

export default Poll;