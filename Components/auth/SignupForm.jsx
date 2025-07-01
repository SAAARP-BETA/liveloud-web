'use client';
import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { SiMetamask } from 'react-icons/si';

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <h2 className="text-2xl font-semibold text-center text-blue-700">Create Your Account</h2>
      <p className="text-sm text-center text-gray-500 mb-6">Join the most Unfiltered Community</p>

      <form className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Full Name</label>
          <input type="text" placeholder="Enter your full name" className="w-full border border-blue-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block font-medium mb-1">Email Address</label>
          <input type="email" placeholder="you@example.com" className="w-full border border-blue-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="relative">
          <label className="block font-medium mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full border border-blue-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-10 text-gray-500"
          >
            👁️
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Keep me signed in
          </label>
          <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition">
          Create Account
        </button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-sm text-gray-500">Or continue with</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center justify-center border py-2 rounded-full hover:bg-gray-100">
          <FaGoogle className="mr-2" /> Continue with Google
        </button>
        <button className="w-full flex items-center justify-center border py-2 rounded-full hover:bg-gray-100">
          <SiMetamask className="mr-2 text-orange-500" /> Connect Wallet
        </button>
      </div>

      <p className="text-sm text-center mt-6 text-gray-600">
        Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
      </p>
    </div>
  );
}
