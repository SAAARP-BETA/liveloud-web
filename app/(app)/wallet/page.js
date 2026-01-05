"use client";

import React, { useState, useEffect, useRef , useCallback} from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, ArrowLeft, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS } from "../../utils/config";

export default function WalletPage() {
  const [xpAmount, setXpAmount] = useState("");
  const [xpRecipient, setXpRecipient] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [cryptoRecipient, setCryptoRecipient] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("LILO");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("wallet"); // 'wallet' or 'transfer'
  const [currentView, setCurrentView] = useState("main"); // 'main', 'crypto-details', 'transaction-history'
  const [isTransferMode, setIsTransferMode] = useState(false); // Track if transfer mode is active
  const [myPoints, setMyPoints] = useState(null);
  const {user, user: currentUser, token, isAuthenticated } = useAuth();
  const scrollPositionRef = useRef(0);
  // console.log("isAuthenticated:", isAuthenticated, "currentUser:", currentUser);
  // Handle crypto selection
  const handleCryptoSelection = (crypto) => {
    setSelectedCrypto(crypto);
  };

  // Handle transfer button click
  const handleTransferClick = () => {
    setActiveSection("transfer");
    setIsTransferMode(true);
  };

  // Handle send XP button click
  const handleSendXPClick = () => {
    setActiveSection("wallet");
    setIsTransferMode(false);
  };

  // Handle view navigation
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  // Handle back to main view
  const handleBackToMain = () => {
    setCurrentView("main");
  };

  // Fetch the username when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Original API call
        const authenticatedUsername = user?.username;
        const res = await fetch(
          `${API_ENDPOINTS.USER}/profiles/${authenticatedUsername}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const profile = await res.json();
        setUsername(profile.username);
        setIsLoading(false);

      } catch (err) {
        setError(err.message || "Something went wrong");
        setIsLoading(false);
      }
    };

    if (user && token) {
      fetchUserProfile();
    }
  }, [user, token]);
  

  const fetchMyPoints = useCallback(async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.POINTS}/my-summary`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        // console.log("data", data);
        setMyPoints(data);
        
      }
    } catch (error) {
      console.error("Error fetching my points:", error);
    }
  }, [isAuthenticated, currentUser, token]);
  useEffect(() => {
  fetchMyPoints();
}, [fetchMyPoints]);


  const TransactionItem = ({ type, amount, from, to, date }) => {
    const isReceived = type === "Received";
    const isSent = type === "Sent";
    return (
      <div className="flex p-4 bg-white dark:bg-gray-900 rounded-xl mb-2 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex justify-center items-center mr-3">
          {isReceived ? (
            <ArrowDownLeft size={20} color={isReceived ? '#4CAF50' : '#22c55e'} />
          ) : isSent ? (
            <ArrowUpRight size={20} color={isSent ? '#F44336' : '#ef4444'} />
          ) : (
            <Plus size={20} color="#3498db" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-base text-gray-800 dark:text-gray-200 font-medium mb-1">{type}</div>
          {from && <div className="text-sm text-gray-500 dark:text-gray-400">From: {from}</div>}
          {to && <div className="text-sm text-gray-500 dark:text-gray-400">To: {to}</div>}
        </div>
        <div className="text-right">
          <div 
            className={`text-base font-semibold mb-1 ${
              isReceived ? "text-green-500 dark:text-green-400" : isSent ? "text-red-500 dark:text-red-400" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {isReceived ? "+" : isSent ? "-" : ""}{amount}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{date}</div>
        </div>
      </div>
    );
  };

  // Crypto Details View Component
  const CryptoDetailsView = () => (
    <div className="w-xl max-w-full">
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <button 
          className="flex items-center text-gray-700 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={handleBackToMain}
        >
          <ArrowLeft size={20} className=" cursor-pointer mr-2" />
          Back
        </button>
        <h2 className="text-gray-900 dark:text-white font-bold">Crypto Details</h2>
        <div className="w-16" />
      </div>

      <div className="px-4 pb-20">
        <div className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="text-gray-500 dark:text-gray-400">Total Balance</div>
          <div className="text-3xl text-gray-900 dark:text-white mt-1 font-bold">$750.00</div>
          <div className="text-green-500 dark:text-green-400 mt-1">+2.34% (24h)</div>
        </div>

        <div className="mt-6">
          <h3 className="text-gray-800 dark:text-white mb-3 font-semibold">Your Assets</h3>
          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mr-3">
                <span className="text-orange-600 dark:text-orange-300 font-bold">₿</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-semibold">Bitcoin</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">BTC</div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 dark:text-white font-bold">$250.00</div>
                <div className="text-xs text-red-500 dark:text-red-400">-1.21%</div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
              <div className="text-gray-800 dark:text-gray-200 font-medium">0.005 BTC</div>
              <div className="flex">
                <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-1 px-3 rounded-full mr-2 transition-colors">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Send</span>
                </button>
                <button className="bg-sky-500 hover:bg-sky-600 py-1 px-3 rounded-full transition-colors">
                  <span className="text-white font-medium">Receive</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-900 rounded-xl mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                <span className="text-blue-600 dark:text-blue-300 font-bold">Ξ</span>
              </div>
              <div className="flex-1">
                <div className="text-gray-900 dark:text-white font-semibold">Ethereum</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">ETH</div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 dark:text-white font-bold">$500.00</div>
                <div className="text-xs text-green-500 dark:text-green-400">+2.56%</div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
              <div className="text-gray-800 dark:text-gray-200 font-medium">0.25 ETH</div>
              <div className="flex">
                <button className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 py-1 px-3 rounded-full mr-2 transition-colors">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">Send</span>
                </button>
                <button className="bg-sky-500 hover:bg-sky-600 py-1 px-3 rounded-full transition-colors">
                  <span className="text-white font-medium">Receive</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-20">
          <h3 className="text-gray-800 dark:text-white mb-3 font-semibold">Quick Actions</h3>
          <div className="flex justify-around bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <button className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <Plus size={20} color="#0EA5E9" />
              </div>
              <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">Buy</span>
            </button>
            <button className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <Minus size={20} color="#64748B" />
              </div>
              <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">Sell</span>
            </button>
            <button className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <ArrowUp size={20} color="#64748B" />
              </div>
              <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">Send</span>
            </button>
            <button className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <ArrowDown size={20} color="#64748B" />
              </div>
              <span className="text-xs text-gray-800 dark:text-gray-200 font-medium">Receive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Transaction History View Component
  const TransactionHistoryView = () => (
    <div className="w-xl max-w-full">
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <button 
          className="flex items-center cursor-pointer text-gray-700 dark:text-gray-200 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={handleBackToMain}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <h2 className="text-gray-900 dark:text-white font-bold">Transaction History</h2>
        <div className="w-16" />
      </div>

      <div className="px-4 pb-20">
        <div className="mt-4">
          <TransactionItem 
            type="Received"
            amount="50 XP"
            from="@friend"
            date="Today, 10:30 AM"
          />
          {/* <TransactionItem 
            type="Sent"
            amount="0.00005 BTC"
            to="0x1a2b3c..."
            date="Yesterday, 2:15 PM"
          /> */}
          <TransactionItem 
            type="Top Up"
            amount="200 XP"
            date="Feb 25, 2025"
          />
          {/* <TransactionItem 
            type="Received"
            amount="0.001 ETH"
            from="@user123"
            date="Feb 24, 2025"
          /> */}
          <TransactionItem 
            type="Sent"
            amount="100 XP"
            to="@buddy"
            date="Feb 23, 2025"
          />
        </div>
      </div>
    </div>
  );

  // Main Wallet View Component
  const MainWalletView = () => (
    <div className="pb-20 w-xl max-w-full">
      {/* User Handle Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm flex justify-between items-center mb-6 border border-gray-100 dark:border-gray-800">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Your handle</div>
          {isLoading ? (
            <div className="text-lg text-gray-600 dark:text-gray-300 mt-1">Loading...</div>
          ) : error ? (
            <div>
              <div className="text-lg font-semibold text-gray-800 dark:text-white">@{user.username}</div>
              <div className="text-xs text-red-500 mt-1">Error: {error}</div>
            </div>
          ) : (
            <div className="text-lg font-semibold text-gray-800 dark:text-white">@{user.username}</div>
          )}
        </div>
        <button className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm text-gray-700 dark:text-gray-200 font-medium">
          Link
        </button>
      </div>
      {/* XP Wallet Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">XP Wallet</h2>
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Your XP balance is:</span>
          <span className="text-base font-semibold text-gray-900 dark:text-white">{myPoints?.totalPoints?.toLocaleString() || "0"} XP</span>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isTransferMode ? "Transfer" : "Send"}
          </label>
          <input
            type="number"
            placeholder={isTransferMode ? "Transfer Amount" : "Amount"}
            className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200"
            value={xpAmount}
            onChange={(e) => setXpAmount(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <input
            type="text"
            placeholder={isTransferMode ? "Transfer To" : "Recipient"}
            className="w-full bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-800 dark:text-gray-200"
            value={xpRecipient}
            onChange={(e) => setXpRecipient(e.target.value)}
          />
        </div>
        <div className="flex flex-row gap-3">
          <button 
            className={`flex-1 rounded-xl h-12 font-semibold ${
              !isTransferMode 
                ? "bg-gradient-to-r from-sky-600 to-primary text-white" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
            onClick={handleSendXPClick}
          >
            Send XP
          </button>
          <button 
            className={`flex-1 rounded-xl h-12 font-semibold ${
              isTransferMode 
                ? "bg-gradient-to-r from-sky-600 to-primary text-white" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            }`}
            onClick={handleTransferClick}
          >
            Transfer
          </button>
        </div>
      </div>
      {/* Crypto Wallet Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Crypto Wallet</h2>
          {/* <button 
            className="text-sm text-primary cursor-pointer font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => handleViewChange("crypto-details")}
          >
            View Details
          </button> */}
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Your {selectedCrypto} balance is:
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            {selectedCrypto === "LILO" ? "0.00001 LILO" : "0.0001 LILO"}
          </span>
        </div>
        {/* <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 my-4 gap-2">
          {['BTC', 'ETH'].map((type) => (
            <button
              key={type}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                selectedCrypto === type
                  ? "bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
              onClick={() => setSelectedCrypto(type)}
            >
              {type}
            </button>
          ))}
        </div> */}
      </div>
      {/* Transaction History Section */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-6 lg:max-w-xl mx-auto max-w-full border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recent Transactions</h2>
          <button 
            className="text-sm cursor-pointer text-primary font-medium"
            onClick={() => handleViewChange("transaction-history")}
          >
            View All
          </button>
        </div>
        {/* Sample Transaction Items */}
        <TransactionItem 
          type="Received"
          amount="50 XP"
          from="@friend"
          date="Today, 10:30 AM"
        />
        {/* <TransactionItem 
          type="Sent"
          amount="0.00005 BTC"
          to="0x1a2b3c..."
          date="Yesterday, 2:15 PM"
        /> */}
        <TransactionItem 
          type="Top Up"
          amount="200 XP"
          date="Feb 25, 2025"
        />
      </div>
    </div>
  );

  // Render different views based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case "crypto-details":
        return <CryptoDetailsView />;
      case "transaction-history":
        return <TransactionHistoryView />;
      default:
        return <MainWalletView />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full md:min-w-[410px] lg:w-[610px] max-w-2xl py-6 px-4 sm:py-10  mx-auto ">
      <div className="w-full max-w-md sm:max-w-full mx-auto">
        {/* Wallet Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connected Wallets
          </h1>
        </div>
        {/* Main Content */}
        {renderCurrentView()}
      </div>
    </div>
  );
}