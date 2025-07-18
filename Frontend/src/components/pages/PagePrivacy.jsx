import React, { useState, useEffect } from "react";
import {
  Database,
  Cog,
  Cookie,
  Lock,
  Share2,
  UserCheck,
  Baby,
  History,
} from "lucide-react";

// --- Main PagePrivacy Component ---
const PagePrivacy = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent text-gray-400">
        Loading Privacy Policy...
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 flex items-center justify-center text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information when you use SafeSwap.
          </p>
        </div>
      </section>

      {/* Privacy Content Section */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <PrivacyItem icon={Database} title="1. Information We Collect">
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Personal Information:</strong> Data you provide, such as
                your email or wallet address when connecting.
              </li>
              <li>
                <strong>Usage Data:</strong> Information on how you interact
                with SafeSwap, like pages visited and actions taken.
              </li>
              <li>
                <strong>Technical Data:</strong> Your browser type, device
                information, and IP address for security and analytics.
              </li>
            </ul>
          </PrivacyItem>

          <PrivacyItem icon={Cog} title="2. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li>To provide, maintain, and improve SafeSwap services.</li>
              <li>To communicate with you about updates, features, and support.</li>
              <li>To ensure the security and integrity of our platform.</li>
            </ul>
          </PrivacyItem>

          <PrivacyItem icon={Cookie} title="3. Cookies and Tracking">
            <p>
              We use cookies and similar technologies to enhance your
              experience, analyze usage, and deliver personalized content. You
              can control cookies through your browser settings.
            </p>
          </PrivacyItem>

          <PrivacyItem icon={Lock} title="4. How We Protect Your Information">
            <p>
              We implement robust security measures, including encryption and
              access controls, to protect your data from unauthorized access,
              disclosure, or destruction.
            </p>
          </PrivacyItem>

          <PrivacyItem icon={Share2} title="5. Sharing Your Information">
            <p>
              We do not sell or rent your personal information. We may share
              data with trusted partners who assist us in operating SafeSwap,
              subject to strict confidentiality agreements.
            </p>
          </PrivacyItem>

          <PrivacyItem icon={UserCheck} title="6. Your Rights and Choices">
            <ul className="list-disc list-inside space-y-2">
              <li>You may access, update, or request deletion of your personal information.</li>
              <li>You can opt out of marketing communications at any time.</li>
              <li>You may disable cookies, though some features may not work as intended.</li>
            </ul>
          </PrivacyItem>

          <PrivacyItem icon={Baby} title="7. Children's Privacy">
            <p>
              SafeSwap is not intended for children under the age of 13. We do
              not knowingly collect personal information from children.
            </p>
          </PrivacyItem>

          <PrivacyItem icon={History} title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify
              you of any significant changes by posting the new policy on this
              page and updating the "Last Updated" date.
            </p>
          </PrivacyItem>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy, please feel
            free to contact our privacy team.
          </p>
          <a
            href="mailto:privacy@safeswap.com"
            className="px-8 py-4 border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300"
          >
            Contact Privacy Team
          </a>
        </div>
      </section>
    </div>
  );
};

// --- Helper Component for each Privacy Item Card ---
const PrivacyItem = ({ icon: Icon, title, children }) => {
  return (
    <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6 md:p-8 shadow-lg transition-all duration-300 hover:border-cyan-500/50 hover:scale-[1.02]">
      <div className="flex items-center mb-4">
        <div className="bg-gray-800 p-3 rounded-full text-cyan-400 mr-4">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="text-gray-400 text-base leading-relaxed">{children}</div>
    </div>
  );
};

export default PagePrivacy;