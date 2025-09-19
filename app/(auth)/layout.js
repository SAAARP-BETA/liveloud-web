"use client";

import AuthRoute from "@/app/components/routes/AuthRoute";
import Image from "next/image";
import LoginImage from "../assets/login-image.jpg";
import Login2 from "../assets/login-2.jpg";
import Login3 from "../assets/login-3.jpg";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import ThemeToggle from "../components/common/ThemeToggle";

export default function AuthLayout({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const cardWidth = 250;
  const cardHeight = 300;
  const cardContainerWidth = cardWidth * 2.4;
  const cardContainerHeight = cardHeight * 1.2;

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthRoute>
<div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-gray-900">                            
     <ThemeToggle />
        {/* Left Side - Poker Style Cards */}
        <div className="hidden lg:flex w-[50%] xl:w-[45%] items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div
            className="relative"
            style={{
              width: `${cardContainerWidth}px`,
              height: `${cardContainerHeight}px`,
            }}
          >
            {/* Card 1 - Left */}
            <div
              className={`absolute z-10 transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                left: `calc(50% - ${cardWidth * 1.05}px)`,
                top: "50%",
                transform: `translateY(-50%) rotate(-15deg) ${
                  isLoaded ? "translateY(0)" : "translateY(32px)"
                }`,
                transitionDelay: "200ms",
              }}
            >
              <Image
                src={LoginImage}
                alt="Card 1"
                width={cardWidth}
                height={cardHeight}
                className="object-cover rounded-lg shadow-xl"
                priority
              />
            </div>

            {/* Card 2 - Middle (appears first) */}
            <div
              className={`absolute z-20 transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) rotate(0deg) ${
                  isLoaded ? "translateY(0)" : "translateY(32px)"
                }`,
                transitionDelay: "0ms",
              }}
            >
              <Image
                src={Login2}
                alt="Card 2"
                width={cardWidth}
                height={cardHeight}
                className="object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* Card 3 - Right */}
            <div
              className={`absolute z-10 transition-all duration-700 ease-out ${
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                left: `calc(50% + ${cardWidth * 0.05}px)`,
                top: "50%",
                transform: `translateY(-50%) rotate(15deg) ${
                  isLoaded ? "translateY(0)" : "translateY(32px)"
                }`,
                transitionDelay: "400ms",
              }}
            >
              <Image
                src={Login3}
                alt="Card 3"
                width={cardWidth}
                height={cardHeight}
                className="object-cover rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div
          className="w-full lg:w-[50%] xl:w-[55%] flex items-center justify-center overflow-y-auto custom-scrollbar  bg-gray-100 dark:bg-gray-900"
        >
          <div
            className={`w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-700 ease-out dark:bg-gray-900 outline-0 ${
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {children}
          </div>
        </div>
      </div>
    </AuthRoute>
  );
}
