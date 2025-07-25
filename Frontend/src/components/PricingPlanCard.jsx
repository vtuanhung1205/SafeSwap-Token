// components/PricingPlanCard.js
import React from "react";
import { BarChart3 } from "lucide-react";

// Accept `isLoaded` and `index` as new props
const PricingPlanCard = ({ plan, navigate, isLoaded, index }) => (
  <div
    className={`flex-1 bg-[#18181c] border rounded-2xl p-8 shadow-lg 
      ${plan.highlight ? "border-cyan-500 ring-2 ring-cyan-400/30" : "border-[#23232a]"}
      
      // These are the new animation classes
      transition-all duration-500 ease-out
      ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      
    // This inline style creates the staggered delay
    style={{ transitionDelay: `${index * 150}ms` }}
  >
    <div className="flex flex-col items-center mb-6">
      <div className="bg-gray-800 p-4 rounded-full text-cyan-400 mb-4">
        <plan.icon size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-white">{plan.name}</h2>
      <div className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        {plan.price}
      </div>
    </div>
    <ul className="text-gray-300 space-y-3 mb-8">
      {plan.features.map((feature) => (
        <li key={feature} className="flex items-center gap-2">
          <BarChart3 size={18} className="text-cyan-400" />
          {feature}
        </li>
      ))}
    </ul>
    {(plan.name === "Enterprise" || plan.name === "Advance") ? (
      <a
        href="mailto:safeswap@contact.me"
        className="block w-full text-center px-6 py-3 rounded-xl font-bold border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white transition-all duration-300"
      >
        Contact Us
      </a>
    ) : (
      <button
        className={`w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
          plan.highlight
            ? "bg-cyan-600 text-white hover:bg-cyan-700"
            : "bg-[#23232a] text-cyan-400 hover:bg-cyan-600 hover:text-white"
        }`}
        onClick={() =>
          plan.name !== "Free" &&
          navigate("/payment", { state: { plan: plan.name } })
        }
        disabled={plan.name === "Free"}
      >
        {plan.name === "Free" ? "Current Plan" : "Choose Plan"}
      </button>
    )}
  </div>
);

export default PricingPlanCard;