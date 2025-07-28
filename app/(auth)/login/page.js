"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';
import google from '@/app/assets/googleicon1.png'
import metaMask from '@/app/assets/metamaskicon1.png'
import Logo from '@/app/assets/LiveLoud.svg';
=======
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";
import google from "@/app/assets/googleicon1.png";
import metaMask from "@/app/assets/metamaskicon1.png";
import Logo from "@/app/assets/LongLogo.png";
>>>>>>> 9a7cf093defe79bf1cc47902fc071271633dcfbf

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Azxs@123");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
    return () => clearError();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.push("/home");
      } else {
        console.log("Login failed:", error);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.error("Google login will be available soon!");
  };

  const handleWalletConnect = () => {
    toast.error("Wallet connection will be available soon!");
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-white px-6">
      <div className="relative lg:ml-4 w-[300px] h-[100px] ">
          <Image 
            src={Logo} 
            alt="Logo" 
            // width={150}
            // height={60}
            fill
            className="object-cover"
            priority
          />
        </div>
      <h1 className="text-primary text-2xl font-bold  text-center">Login to Your Account</h1>
      <p className="text-gray-500 text-center mt-1">And Say It All Unfiltered</p>
=======
    <div className="min-h-screen bg-white px-6 py-12 ">
      <div className="relative lg:ml-4 w-[300px] h-[70px] ">
        <Image
          src={Logo}
          alt="Logo"
          // width={150}
          // height={60}
          fill
          className="object-cover"
          priority
        />
      </div>
      <h1 className="text-primary text-2xl font-bold  text-center">
        Login to Your Account
      </h1>
      <p className="text-gray-500 text-center mt-1">
        And Say It All Unfiltered
      </p>
>>>>>>> 9a7cf093defe79bf1cc47902fc071271633dcfbf

      {error && (
        <div className="mt-4 p-3 bg-red-100 rounded-md">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      <div className="mt-6">
        <label className="text-base font-semibold">Email Address</label>
        <input
          className="bg-white rounded-md h-10 px-3 border border-gray-300 mt-1 w-full"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) clearError();
          }}
          type="email"
          placeholder="you@example.com"
          disabled={isLoading}
        />
      </div>

      <div className="mt-4">
        <label className="text-base font-semibold">Password</label>
        <input
          className="bg-white rounded-md h-10 px-3 border border-gray-300 mt-1 w-full"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) clearError();
          }}
          type="password"
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center mt-2">
        <button
          onClick={() => setIsChecked(!isChecked)}
          className={`w-4 h-4 border-2 rounded mr-2 flex  cursor-pointer items-center justify-center ${
            isChecked ? "border-primary bg-primary" : "border-gray-400"
          }`}
          disabled={isLoading}
        >
          {isChecked && <span className="text-xs text-white font-bold">✓</span>}
        </button>
        <span className="text-base">Keep me signed in</span>
        <button
          className="ml-auto cursor-pointer text-primary text-sm"
          onClick={() => router.push("/auth/forgot-password")}
          disabled={isLoading}
        >
          Forgot Password?
        </button>
      </div>

      <button
        className={`mt-6 w-full bg-primary py-3 rounded-full  cursor-pointer text-white text-lg font-bold ${
          isLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center text-gray-500 mt-4">Or continue with</p>

      <button
        className="mt-4 w-full border border-gray-300 py-3 cursor-pointer rounded-full flex items-center justify-center"
        onClick={handleGoogleLogin}
        disabled={isLoading}
      >
        <Image
          src={google}
          alt="Google Icon"
          width={24}
          height={24}
          className="mr-2"
        />
        <span className="text-base font-semibold">Continue with Google</span>
      </button>

      <button
        className="mt-3 w-full border border-gray-300 cursor-pointer py-3 rounded-full flex items-center justify-center"
        onClick={handleWalletConnect}
        disabled={isLoading}
      >
        <Image
          src={metaMask}
          alt="Metamask Icon"
          width={24}
          height={24}
          className="mr-2"
        />
        <span className="text-base font-semibold">Connect Wallet</span>
      </button>

      <p className="mt-6 text-center text-gray-500">
        Don't have an account?{" "}
        <button
          className="text-primary  cursor-pointer font-semibold"
          onClick={() => router.push("/signup")}
          disabled={isLoading}
        >
          Sign up for free
        </button>
      </p>
    </div>
  );
}
