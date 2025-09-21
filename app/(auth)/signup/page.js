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
import ThemeToggle from "../../components/common/ThemeToggle";
export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("test");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [email, setEmail] = useState("test@test.com");
  // const [password, setPassword] = useState("Azxs@123");
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

  // Function to parse and display specific error messages
  const getSpecificErrorMessage = (errorMessage) => {
    if (!errorMessage) return "Please try again";
    
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes("username") && (lowerError.includes("taken") || lowerError.includes("already"))) {
      return "Please try again: Username is already taken. Choose a different username.";
    }
    if (lowerError.includes("username") && lowerError.includes("exists")) {
      return "Please try again: Username already exists. Choose a different username.";
    }
    if (lowerError.includes("email") && (lowerError.includes("taken") || lowerError.includes("already") || lowerError.includes("registered"))) {
      return "Please try again: Email is already taken. Use a different email address.";
    }
    if (lowerError.includes("email") && lowerError.includes("exists")) {
      return "Please try again: Email already exists. Use a different email address.";
    }
    if (lowerError.includes("invalid email")) {
      return "Please try again: Enter a valid email address.";
    }
    if (lowerError.includes("password") && lowerError.includes("weak")) {
      return "Please try again: Password is too weak. Use a stronger password.";
    }
    if (lowerError.includes("network") || lowerError.includes("connection")) {
      return "Please try again: Network error. Check your connection.";
    }
    if (lowerError.includes("server") || lowerError.includes("500")) {
      return "Please try again: Server error occurred.";
    }
    
    // For any other error, add "Please try again: " prefix
    return `Please try again: ${errorMessage}`;
  };

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Incomplete Details: Please fill in all fields');
      return;
    }

    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error('Password Requirements Not Met: ' + validation.errors.join(', '));
      return;
    }

    if (!isChecked) {
      toast.error('Terms & Conditions: Please agree to the Terms and Privacy Policy');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting signup with data:', {
        username: fullName,
        email,
        password: '***hidden***'
      });
      
      const success = await signup({
        username: fullName,
        email,
        password,
      });

      if (success) {
        router.replace("/login");
        toast.success("Signup successful! Please log in.");
      } else {
        console.error('Signup failed with error:', error);
        const specificMessage = getSpecificErrorMessage(error);
        toast.error(specificMessage, {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            fontSize: '14px',
            maxWidth: '400px',
          },
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      const specificMessage = getSpecificErrorMessage(err.message || err);
      toast.error(specificMessage, {
        duration: 6000,
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          fontSize: '14px',
          maxWidth: '400px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // For now, redirect to a simple Google OAuth flow
    if (typeof window !== 'undefined') {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = 'openid email profile';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `state=signup`;
      
      window.location.href = authUrl;
    }
  };

  const handleWalletConnect = () => {
    toast.error("Wallet connection will be available soon!");
  };

  return (
    <>
<div className="min-h-screen mt-26 bg-white dark:bg-gray-900 text-black dark:text-white px-8 py-10">
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
        {/* Display any authentication errors */}
      {error ? (
        <div className="mb-4 p-3 bg-red-100 rounded-md">
          <span className="text-red-700 text-center block">{error}</span>
        </div>
      ) : null}
      
      <h1 className="text-primary text-2xl font-bold text-center">
          Create Your Account
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Join the most Unfiltered Community
        </p>

        <label className="text-base font-semibold">Full Name</label>
        <input
 className="border-2 border-blue-200 dark:border-gray-600 rounded-xl p-3 mt-1 mb-4 w-full bg-white dark:bg-gray-800 text-black dark:text-white" 

          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => {
          setFullName(e.target.value);
          if (error) clearError();
        }}
          disabled={isLoading}
        />

        <label className="text-base font-semibold">Email Address</label>
        <input
          className="border-2 border-blue-200 dark:border-gray-600 rounded-xl p-3 mt-1 mb-4 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
          placeholder="you@example.com"
          type="email"
          autoCapitalize="none"
          value={email}
          onChange={(e) => {
          setEmail(e.target.value);
          if (error) clearError();
        }}
          disabled={isLoading}
        />

        <label className="text-base font-semibold">Password</label> 
        <div className="relative">
          <input
            className="border-2 border-blue-200 dark:border-gray-600 rounded-xl p-3 mt-1 mb-4 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="absolute cursor-pointer right-3 top-5/12 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-non"
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
    </>
  );
}