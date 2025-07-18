import { ShieldCheck, Zap, Star } from "lucide-react";

export const plans = [
  {
    icon: ShieldCheck,
    name: "Free",
    price: "$0",
    features: [
      " Email/Google",
      " Petra/Martian",
      "Limited (10/day)",
      "Basic (Safe/Suspicious)",
      "Last 5 swaps",
      "Community support",
    ],
    highlight: false,
  },
  {
    icon: Zap,
    name: "Pro",
    price: "$9.99/mo",
    features: [
      " Email/Google",
      " Petra/Martian",
      "Unlimited",
      "Detailed (Confidence Score)",
      "Full history",
      "Priority email",
    ],
    highlight: true,
  },
  {
    icon: Star,
    name: "Advance",
    price: "Contact Us",
    features: [
      " Email/Google + 2FA",
      " Petra/Martian + Multi-wallet",
      "Unlimited + Cross-chain",
      "Advanced (ML + Analytics)",
      "Full history + Analytics",
      "24/7 dedicated support",
    ],
    highlight: false,
    // ✅ Email/Google
  },
];
