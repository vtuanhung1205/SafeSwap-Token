import React, { useState, useEffect } from "react";

const PrivacyPolicy = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Privacy Policy...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Privacy Policy
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, and protect your information when you use SafeSwap.
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Table of Contents
        </h2>
        <ol className="list-decimal list-inside text-gray-300 mb-8 space-y-1">
          <li>Information We Collect</li>
          <li>How We Use Your Information</li>
          <li>Cookies and Tracking Technologies</li>
          <li>How We Protect Your Information</li>
          <li>Sharing Your Information</li>
          <li>Your Rights and Choices</li>
          <li>Children's Privacy</li>
          <li>Changes to This Policy</li>
          <li>Contact Us</li>
        </ol>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>
            Personal information you provide (e.g., email, wallet address).
          </li>
          <li>
            Usage data (e.g., pages visited, actions taken on the platform).
          </li>
          <li>
            Technical data (e.g., browser type, device information, IP address).
          </li>
        </ul>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>To provide and improve SafeSwap services.</li>
          <li>To communicate with you about updates, features, and support.</li>
          <li>To ensure the security and integrity of the platform.</li>
        </ul>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          3. Cookies and Tracking Technologies
        </h2>
        <p className="text-gray-400 mb-6">
          We use cookies and similar technologies to enhance your experience,
          analyze usage, and deliver personalized content. You can control
          cookies through your browser settings.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          4. How We Protect Your Information
        </h2>
        <p className="text-gray-400 mb-6">
          We implement security measures such as encryption and access controls
          to protect your data from unauthorized access, disclosure, or
          destruction.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          5. Sharing Your Information
        </h2>
        <p className="text-gray-400 mb-6">
          We do not sell or rent your personal information. We may share data
          with trusted partners who assist us in operating SafeSwap, subject to
          confidentiality agreements.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          6. Your Rights and Choices
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>
            You may access, update, or delete your personal information at any
            time.
          </li>
          <li>
            You can opt out of marketing communications by following the
            instructions in our emails.
          </li>
          <li>
            You may disable cookies in your browser, but some features may not
            work as intended.
          </li>
        </ul>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          7. Children's Privacy
        </h2>
        <p className="text-gray-400 mb-6">
          SafeSwap is not intended for children under 13. We do not knowingly
          collect personal information from children.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          8. Changes to This Policy
        </h2>
        <p className="text-gray-400 mb-6">
          We may update this Privacy Policy from time to time. We will notify
          you of any significant changes by posting the new policy on this page.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">9. Contact Us</h2>
        <p className="text-gray-400 mb-2">
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a
            href="mailto:privacy@safeswap.com"
            className="text-cyan-400 underline"
          >
            privacy@safeswap.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
