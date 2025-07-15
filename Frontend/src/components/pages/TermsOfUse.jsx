import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Ban,
  Copyright,
  AlertTriangle,
  Info,
  History,
} from "lucide-react";

// --- Main TermsOfUse Component ---
const TermsOfUse = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      // The loading screen should also be transparent to work with the animated background
      <div className="flex items-center justify-center h-screen bg-transparent text-gray-400">
        Loading Terms Of Use...
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 flex items-center justify-center text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Terms of Use
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your agreement for using the SafeSwap platform. Please read these
            terms carefully before accessing or using our services.
          </p>
        </div>
      </section>

      {/* Terms Content Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <TermCard
            icon={FileText}
            title="1. Acceptance of Terms"
          >
            By using SafeSwap, you agree to comply with and be legally bound by
            these Terms of Use. If you do not agree to these terms, please do
            not use the platform.
          </TermCard>

          <TermCard
            icon={ShieldCheck}
            title="2. User Responsibilities"
          >
            You are responsible for your use of the platform and for any
            consequences thereof. You agree to provide accurate information and
            to use SafeSwap in compliance with all applicable laws.
          </TermCard>

          <TermCard
            icon={Ban}
            title="3. Prohibited Activities"
          >
            Engaging in fraudulent, illegal, or abusive activities, attempting
            to gain unauthorized access, or disrupting the platform's security
            is strictly prohibited.
          </TermCard>

          <TermCard
            icon={Copyright}
            title="4. Intellectual Property"
          >
            All content, trademarks, and data on SafeSwap are the property of
            the platform or its licensors. You may not use, copy, or distribute
            any content without permission.
          </TermCard>

          <TermCard
            icon={AlertTriangle}
            title="5. Disclaimer of Warranties"
          >
            SafeSwap is provided "as is" and "as available" without warranties
            of any kind. We do not guarantee the accuracy, reliability, or
            availability of the platform.
          </TermCard>

          <TermCard
            icon={History}
            title="6. Changes to Terms"
          >
            We reserve the right to modify these Terms at any time. Continued
            use of the platform constitutes acceptance of the new terms. Please
            review this page regularly.
          </TermCard>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            If you have any questions about these Terms, please don't hesitate
            to reach out to our support team.
          </p>
          <a
            href="mailto:support@safeswap.com"
            className="px-8 py-4 border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

// --- Helper Component for each Term Card (styled like FeatureCard) ---
const TermCard = ({ icon: Icon, title, children }) => {
  return (
    <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6 flex flex-col shadow-lg transition-all duration-300 hover:border-cyan-500/50 hover:scale-105">
      <div className="flex items-center mb-4">
        <div className="bg-gray-800 p-3 rounded-full text-cyan-400 mr-4">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  );
};

export default TermsOfUse;