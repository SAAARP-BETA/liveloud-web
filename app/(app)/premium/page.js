"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Star,
  Zap,
  Shield,
  Users,
  Award,
  Check,
} from "lucide-react";

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState("premium");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      period: "",
      description: "Perfect for getting started",
      features: [
        "Create posts and share content",
        "Follow and connect with users",
        "Basic profile customization",
        "100 XP monthly bonus",
        "Standard support",
      ],
      buttonText: "Current Plan",
      isCurrentPlan: true,
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "$9.99",
      period: "/month",
      description: "Unlock the full LiveLoud experience",
      features: [
        "Everything in Basic",
        "Priority content visibility",
        "500 XP monthly bonus",
        "Exclusive premium badges",
        "Priority customer support",
        "Early access to new features",
        "Ad-free experience",
        "Increased character limit",
      ],
      buttonText: "Upgrade to Premium",
      isCurrentPlan: false,
      popular: true,
    },
  ];

  const premiumFeatures = [
    {
      icon: Zap,
      title: "Priority Visibility",
      description:
        "Your content gets boosted visibility and reaches more users",
    },
    {
      icon: Shield,
      title: "Exclusive Access",
      description: "Get early access to new features and premium community",
    },
    {
      icon: Users,
      title: "Premium Support",
      description: "Priority customer support with faster response times",
    },
  ];

  const handleSubscribe = (planId) => {
    if (planId === "basic") {
      return;
    }

    // TODO: Implement payment flow
    alert("Coming Soon! Payment integration will be available soon!");
  };

  const handleBack = () => {
    // You can implement router.back() or navigation logic here
    window.history.back();
  };

  const PlanCard = ({ plan }) => (
    <div
      className={`mx-4 mb-6 p-6 rounded-3xl shadow-lg relative ${
        plan.popular
          ? "bg-blue-50 dark:bg-blue-900 border-2 border-sky-500 dark:border-blue-700"
          : "bg-white dark:bg-gray-900 border dark:border-gray-800"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-sky-500 to-purple-600 px-4 py-2 rounded-full flex items-center">
            <Star size={14} className="text-white mr-2" />
            <span className="text-white text-sm font-semibold">
              Most Popular
            </span>
          </div>
        </div>
      )}

      <div className="text-center mb-6 mt-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{plan.description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
          {plan.period && (
            <span className="text-lg text-gray-600 dark:text-gray-300 ml-1">{plan.period}</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start mb-3">
            <Check
              size={18}
              className="text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0"
            />
            <span className="text-gray-700 dark:text-gray-200 flex-1">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSubscribe(plan.id)}
        disabled={plan.isCurrentPlan}
        className={`w-full rounded-2xl transition-all duration-200 ${
          plan.isCurrentPlan
            ? "opacity-70 cursor-not-allowed"
            : "hover:scale-105"
        }`}
      >
        {plan.isCurrentPlan ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl">
            <span className="text-gray-800 dark:text-white font-semibold">
              {plan.buttonText}
            </span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 dark:from-blue-700 dark:to-purple-800 p-4 rounded-2xl">
            <span className="text-white font-semibold">{plan.buttonText}</span>
          </div>
        )}
      </button>
    </div>
  );

  const FeatureCard = ({ feature }) => {
    const IconComponent = feature.icon;
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl mx-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="bg-sky-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center mb-4">
          <IconComponent size={24} className="text-sky-500 dark:text-blue-400" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h4>
        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
      </div>
    );
  };

  return (
  <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-6 px-4 w-full md:min-w-[410px] lg:w-[610px] max-w-2xl  sm:py-10   mx-auto">
      {/* Custom Header */}
  <div className="bg-white dark:bg-gray-900 px-4 py-3 flex items-center border-b border-gray-100 dark:border-gray-800">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={handleBack}
        >
          <ChevronLeft size={22} className="text-gray-600 dark:text-white" />
        </button>

  <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">Premium</h1>

        <div className="w-10" />
      </div>

  <div className="bg-gray-50 dark:bg-gray-950 pb-8">
        {/* Header */}
        <div className="text-center py-8 px-6 bg-gradient-to-b from-sky-50 to-transparent dark:from-blue-950 dark:to-transparent mx-4 rounded-3xl mb-6">
          <div className="bg-gradient-to-br from-sky-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg mx-auto">
            <Award size={36} className="text-sky-500 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center text-lg leading-relaxed max-w-sm mx-auto">
            Join thousands of creators who have unlocked the full potential of
            LiveLoud
          </p>
        </div>

        {/* Pricing Plans */}
        <div className="mb-8">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* Premium Features */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6 px-6">
            Premium Features
          </h3>
          {premiumFeatures.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-900 mx-4 p-6 rounded-2xl shadow-sm mb-8 border border-gray-100 dark:border-gray-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            FAQ
          </h3>

          <div>
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I cancel anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Yes, you can cancel your premium subscription at any time. Your
                premium features will remain active until the end of your
                billing period.
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods are accepted?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We accept all major credit cards, PayPal, and various digital
                payment methods. Your payment information is securely processed.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Money-back guarantee?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We offer a 30-day money-back guarantee for new premium
                subscribers. Contact our support team for a full refund if
                you're not satisfied.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
