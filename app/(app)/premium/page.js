'use client';

import { useState } from 'react';
import { Check, Crown, Star, Zap, Shield, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PremiumPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const router = useRouter();

  const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 'Free',
            period: '',
            description: 'Perfect for getting started',
            features: [
                'Create posts and share content',
                'Follow and connect with users',
                'Basic profile customization',
                '100 XP monthly bonus',
                'Standard support'
            ],
            buttonText: 'Current Plan',
            isCurrentPlan: true,
            popular: false
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '$9.99',
            period: '/month',
            description: 'Unlock the full LiveLoud experience',
            features: [
                'Everything in Basic',
                'Priority content visibility',
                '500 XP monthly bonus',
                'Exclusive premium badges',
                'Priority customer support',
                'Early access to new features',
                'Ad-free experience',
                'Increased character limit',
            ],
            buttonText: 'Upgrade to Premium',
            isCurrentPlan: false,
            popular: true
        }
    ];

  const handleSubscribe = (planId) => {
    if (planId === 'basic') {
      // Already on basic plan
      return;
    }

    // TODO: Implement payment flow
    console.log(`Subscribing to ${planId} plan`);
    alert('Payment integration coming soon!');
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50">
        {/* Close Button */}
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Upgrade to Premium
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Join thousands of creators who have unlocked the full potential of LiveLoud with our premium features
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl ${plan.popular ? 'ring-2 ring-sky-500 transform scale-105' : 'shadow-lg'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-lg text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${plan.id === 'basic'
                      ? 'bg-gray-100 text-gray-600 cursor-pointer'
                      : 'bg-gradient-to-r from-sky-500 to-purple-600 text-white hover:from-sky-600 hover:to-purple-700 hover:transform hover:scale-105 cursor-pointer'
                    }`}
                  disabled={plan.id === 'basic'}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Premium Features Showcase */}
          <div className="bg-white rounded-3xl p-10 shadow-xl mb-16 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Premium Features
            </h2>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Priority Visibility</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your content gets boosted visibility and reaches more users in their feeds
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Exclusive Access</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get early access to new features and join our exclusive premium community
                </p>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Premium Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  Priority customer support with faster response times and dedicated assistance
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-3xl p-10 shadow-xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
              Frequently Asked Questions
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes, you can cancel your premium subscription at any time. Your premium features will remain active until the end of your billing period.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We accept all major credit cards, PayPal, and various digital payment methods. Your payment information is securely processed.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Do I get a refund if I'm not satisfied?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We offer a 30-day money-back guarantee for new premium subscribers. If you're not satisfied, contact our support team for a full refund.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
