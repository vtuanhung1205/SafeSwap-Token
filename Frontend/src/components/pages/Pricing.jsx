// pages/Pricing.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { plans } from "../../utils/pricingPlans";
import PricingPlanCard from "../PricingPlanCard";
import SkeletonCard from "../SkeletonCard"; // Assuming SkeletonCard.js exists from the previous step

const Pricing = () => {
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false); // New state for animation
  const navigate = useNavigate();

  useEffect(() => {
    // This timer simulates fetching data
    const dataFetchTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(dataFetchTimer);
  }, []);

  useEffect(() => {
    // This effect runs when `loading` becomes false
    if (!loading) {
      // A tiny delay to ensure cards are in the DOM before we trigger the animationad
      const animationTimer = setTimeout(() => setIsLoaded(true), 50);
      return () => clearTimeout(animationTimer);
    }
  }, [loading]);

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

      {/* Pricing Cards Section */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          plans.map((plan, index) => (
            <PricingPlanCard
              key={plan.name}
              plan={plan}
              navigate={navigate}
              isLoaded={isLoaded} // Pass the animation state
              index={index}       // Pass the index for staggering
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Pricing;