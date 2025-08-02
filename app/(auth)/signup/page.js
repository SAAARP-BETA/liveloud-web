"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faCheck } from "@fortawesome/free-solid-svg-icons";
import google from "@/app/assets/googleicon1.png";
import metaMask from "@/app/assets/metamaskicon1.png";
import Logo from "@/app/assets/combinedLogo.png";
import toast from "react-hot-toast";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("test");
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("Azxs@123");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
  });

  const { signup, error, clearError } = useAuth();

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  // Update password validation when password changes
  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordValidation(validatePassword(text));
    if (error) clearError();
  };

  // Initialize password validation on component mount
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    }
  }, []);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error('Please enter a strong password');
      return;
    }

    if (!isChecked) {
      toast.error("Please agree to the Terms and Privacy Policy");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup({
        username: fullName,
        email,
        password,
      });

      if (success) {
        router.replace("/home");
      } else {
        console.error(`Signup failed with error:" ${error}`);
        toast.error(`Signup Failed: ${error || "Please try again."}`);
      }
    } catch (err) {
      console.error(`Signup error: ${err}`);
      toast.error(`Error: ${err.message || "An unexpected error occurred!"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.error("Google signup will be available soon!");
  };

  const handleWalletConnect = () => {
    toast.error("Wallet connection will be available soon!");
  };

  return (
    <div className="min-h-screen bg-white px-8 py-10">
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
      <h1 className="text-primary text-2xl font-bold text-center">
        Create Your Account
      </h1>
      <p className="text-gray-500 text-center mb-6">
        Join the most Unfiltered Community
      </p>

      <label className="text-base font-semibold">Full Name</label>
      <input
        className="border-2 border-blue-200 rounded-xl p-3 mt-1 mb-4 w-full"
        placeholder="Enter your full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        disabled={isLoading}
      />

      <label className="text-base font-semibold">Email Address</label>
      <input
        className="border-2 border-blue-200 rounded-xl p-3 mt-1 mb-4 w-full"
        placeholder="you@example.com"
        type="email"
        autoCapitalize="none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <label className="text-base font-semibold">Password</label>
      <div className="border-2 border-blue-200 rounded-xl p-1 mt-1 flex items-center justify-between">
        <input
          className="flex-1 p-2 outline-none"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={isLoading}
        />
        <button
          className="px-2 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="lg" />
        </button>
      </div>

      {/* Password strength indicator */}
      {password.length > 0 && (
        <div className="mt-2">
          <span className={`text-sm font-medium ${passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
            Password Strength: {passwordValidation.isValid ? 'Strong' : 'Weak'}
          </span>
          {!passwordValidation.isValid && passwordValidation.errors.length > 0 && (
            <div className="mt-1">
              {passwordValidation.errors.map((error, index) => (
                <div key={index} className="text-xs text-red-500">
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center mt-4">
        <button
          className={`border-2 rounded-sm mr-2 w-6 h-6 cursor-pointer flex items-center justify-center ${
            isChecked ? "border-primary bg-primary" : "border-gray-300"
          }`}
          onClick={() => setIsChecked(!isChecked)}
          disabled={isLoading}
        >
          {isChecked && (
            <FontAwesomeIcon icon={faCheck} size="sm" color="white" />
          )}
        </button>
        <span className="text-gray-600 flex-1 text-sm">
          I agree to the Terms and Privacy Policy
        </span>
      </div>

      <button
        className={` rounded-md p-3 mt-6 w-full text-white text-lg font-semibold ${
          isLoading || !fullName.trim() || !email.trim() || !password.trim() || !isChecked || !passwordValidation.isValid
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-primary cursor-pointer'} 
          ${isLoading ? 'opacity-70' : ''}`}
        onClick={handleSignup}
        disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim() || !isChecked || !passwordValidation.isValid}
      >
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="mx-2 text-gray-500 text-sm">Or continue with</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      <button
        className="border-2 border-gray-300 rounded-3xl cursor-pointer p-3 flex items-center justify-center mb-3 shadow-md w-full"
        onClick={handleGoogleSignup}
        disabled={isLoading}
      >
        <Image
          src={google}
          alt="Google Icon"
          width={24}
          height={24}
          className="mr-2"
        />
        <span>Continue with Google</span>
      </button>

      <button
        className="border-2 border-gray-300 rounded-3xl p-3 cursor-pointer flex items-center justify-center shadow-md w-full"
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
        <span>Connect Wallet</span>
      </button>

      <div className="mt-6 text-center text-gray-500">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-primary cursor-pointer font-semibold"
          disabled={isLoading}
        >
          Login
        </button>
      </div>
    </div>
  );
}
