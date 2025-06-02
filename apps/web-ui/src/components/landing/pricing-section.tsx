"use client";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  highlighted?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: "default" | "outline";
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individual developers and small projects",
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      "Up to 5 MCP servers",
      "Basic API registration",
      "Standard templates",
      "Community support",
      "Basic monitoring",
      "Standard documentation"
    ],
    icon: <Zap className="w-6 h-6" />,
    buttonText: "Get Started Free",
    buttonVariant: "outline"
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams and businesses",
    price: {
      monthly: 29,
      yearly: 290
    },
    features: [
      "Unlimited MCP servers",
      "Advanced API analysis",
      "Custom templates",
      "Priority support",
      "Advanced monitoring & analytics",
      "Auto-generated SDKs",
      "Team collaboration",
      "Custom domains",
      "Advanced security features"
    ],
    highlighted: true,
    icon: <Crown className="w-6 h-6" />,
    buttonText: "Start Free Trial",
    buttonVariant: "default"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with specific needs",
    price: {
      monthly: 99,
      yearly: 990
    },
    features: [
      "Everything in Professional",
      "Dedicated support manager",
      "Custom integrations",
      "On-premise deployment",
      "Advanced security & compliance",
      "Custom SLA",
      "White-label solutions",
      "Advanced audit logs",
      "SSO & LDAP integration"
    ],
    icon: <Rocket className="w-6 h-6" />,
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/10 via-blue-950/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Simple, <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your needs. All plans include our core features with no hidden fees.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm ${!isYearly ? 'text-white' : 'text-neutral-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isYearly ? 'bg-purple-500' : 'bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isYearly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-white' : 'text-neutral-400'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="text-sm bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${tier.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`bg-neutral-900 border rounded-2xl p-8 h-full relative overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                tier.highlighted 
                  ? 'border-purple-500/50 shadow-purple-500/10' 
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}>
                {tier.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 pointer-events-none" />
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                    tier.highlighted 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-neutral-400 text-sm">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-bold text-white mb-2">
                    ${isYearly ? tier.price.yearly : tier.price.monthly}
                    <span className="text-lg text-neutral-400 font-normal">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  {isYearly && tier.price.monthly > 0 && (
                    <div className="text-sm text-neutral-400">
                      <span className="line-through">${tier.price.monthly * 12}/year</span>
                      <span className="text-green-400 ml-2">Save ${(tier.price.monthly * 12) - tier.price.yearly}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  asChild 
                  variant={tier.buttonVariant}
                  size="lg" 
                  className={`w-full group ${
                    tier.highlighted 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0' 
                      : ''
                  }`}
                >
                  <Link href={tier.id === 'enterprise' ? '/contact' : '/auth/register'}>
                    {tier.buttonText}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-neutral-400 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>99.9% uptime SLA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}