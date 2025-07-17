import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { plans } from "../../utils/pricingPlans";
import PricingPlanCard from "../PricingPlanCard";

const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Pricing...
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
          Pricing
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade anytime for more
          features and support.
        </p>
      </section>
      {/* Pricing Cards */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {plans.map((plan) => (
          <PricingPlanCard key={plan.name} plan={plan} navigate={navigate} />
        ))}
      </div>
    </div>
  );
};

export default Pricing;
