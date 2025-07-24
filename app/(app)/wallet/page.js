'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../utils/config';
import { ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

export default function WalletPage() {
  const [xpAmount, setXpAmount] = useState('');
  const [xpRecipient, setXpRecipient] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoRecipient, setCryptoRecipient] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, token } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authenticatedUsername = user?.username;
        const res = await fetch(`${API_ENDPOINTS.USER}/profiles/${authenticatedUsername}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const profile = await res.json();
        setUsername(profile.username);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && token) fetchUserProfile();
  }, [user, token]);

  const TransactionItem = ({ type, amount, from, to, date }) => {
    const isReceived = type === 'Received';
    const isSent = type === 'Sent';

    const textColor = isReceived
      ? 'text-green-500'
      : isSent
      ? 'text-red-500'
      : 'text-gray-800';

    return (
      <div className="flex p-4 w-xl bg-white rounded-xl mb-2 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center">
          {isReceived ? (
            <ArrowDownLeft size={20} color="#4CAF50" />
          ) : isSent ? (
            <ArrowUpRight size={20} color="#F44336" />
          ) : (
            <Plus size={20} color="#3498db" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-base text-gray-800 font-medium mb-1">{type}</div>
          {from && <div className="text-sm text-gray-500">From: {from}</div>}
          {to && <div className="text-sm text-gray-500">To: {to}</div>}
        </div>
        <div className="text-right">
          <div className={`text-base font-semibold mb-1 ${textColor}`}>
            {isReceived ? '+' : isSent ? '-' : ''}
            {amount}
          </div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6  sm:py-10  max-w-4xl mx-auto w-full">
      <div className="w-full max-w-md sm:max-w-full mx-auto">
        {/* Wallet Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Connected Wallets</h1>
        </div>

        {/* Profile Handle */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center mb-6">
          <div>
            <div className="text-sm text-gray-500">Your handle</div>
            <div className="text-lg font-semibold text-gray-800">
              @{user.username}
            </div>
          </div>
          <button className="bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-700 font-medium">
            Link
          </button>
        </div>

        {/* XP Wallet */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">XP Wallet</h2>
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-600">Your XP balance is:</span>
            <span className="text-base font-semibold text-gray-900">1000 XP</span>
          </div>

          <input
            type="number"
            placeholder="Amount"
            className="w-full bg-gray-100 p-3 rounded-lg text-sm text-gray-800 mb-3"
            value={xpAmount}
            onChange={(e) => setXpAmount(e.target.value)}
          />

          <input
            type="text"
            placeholder="Recipient"
            className="w-full bg-gray-100 p-3 rounded-lg text-sm text-gray-800 mb-3"
            value={xpRecipient}
            onChange={(e) => setXpRecipient(e.target.value)}
          />

          <div className="flex flex-row gap-3">
            <button className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-primary h-12 text-white font-semibold">
              Top Up
            </button>
            <button className="flex-1 bg-gray-100 rounded-xl h-12 text-gray-800 font-semibold">
              Transfer
            </button>
          </div>
        </div>

        {/* Crypto Wallet */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Crypto Wallet</h2>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Your BTC balance is:</span>
            <span className="text-base font-semibold text-gray-900">0.00001 BTC</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-600">Your ETH balance is:</span>
            <span className="text-base font-semibold text-gray-900">0.0001 ETH</span>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 my-4 gap-2">
            {['BTC', 'ETH'].map((type) => (
              <button
                key={type}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  selectedCrypto === type
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-500'
                }`}
                onClick={() => setSelectedCrypto(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Amount"
            className="w-full bg-gray-100 p-3 rounded-lg text-sm text-gray-800 mb-3"
            value={cryptoAmount}
            onChange={(e) => setCryptoAmount(e.target.value)}
          />

          <input
            type="text"
            placeholder="Recipient"
            className="w-full bg-gray-100 p-3 rounded-lg text-sm text-gray-800 mb-3"
            value={cryptoRecipient}
            onChange={(e) => setCryptoRecipient(e.target.value)}
          />

          <div className="flex flex-row gap-3">
            <button className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-primary h-12 text-white font-semibold">
              Top Up
            </button>
            <button className="flex-1 bg-gray-100 rounded-xl h-12 text-gray-800 font-semibold">
              Transfer
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="mb-30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Transactions</h2>
            <button className="text-sm text-primary font-medium">View All</button>
          </div>

          <TransactionItem type="Received" amount="50 XP" from="@friend" date="Today, 10:30 AM" />
          <TransactionItem type="Sent" amount="0.00005 BTC" to="0x1a2b3c..." date="Yesterday, 2:15 PM" />
          <TransactionItem type="Top Up" amount="200 XP" date="Feb 25, 2025" />
        </div>
      </div>
    </div>
  );
}