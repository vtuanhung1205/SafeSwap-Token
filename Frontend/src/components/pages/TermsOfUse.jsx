import React, { useState, useEffect } from "react";

const TermsOfUse = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Terms Of Use...
      </div>
    );
  }
  return (
    <div className="min-h-screen  from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-center bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        Terms Of Use
      </h1>
      <p className="mb-8 text-gray-300 text-lg text-center max-w-2xl mx-auto">
        Please read these Terms of Use carefully before using SafeSwap. By
        accessing or using the platform, you agree to be bound by these terms.
      </p>
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          Table of Contents
        </h2>
        <ol className="list-decimal list-inside text-gray-300 mb-8 space-y-1">
          <li>Acceptance of Terms</li>
          <li>User Responsibilities</li>
          <li>Prohibited Activities</li>
          <li>Intellectual Property</li>
          <li>Disclaimer of Warranties</li>
          <li>Limitation of Liability</li>
          <li>Governing Law</li>
          <li>Changes to Terms</li>
          <li>Contact Information</li>
        </ol>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-400 mb-6">
          By using SafeSwap, you agree to comply with and be legally bound by
          these Terms of Use. If you do not agree to these terms, please do not
          use the platform.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          2. User Responsibilities
        </h2>
        <p className="text-gray-400 mb-6">
          You are responsible for your use of the platform and for any
          consequences thereof. You agree to provide accurate information and to
          use SafeSwap in compliance with all applicable laws and regulations.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          3. Prohibited Activities
        </h2>
        <ul className="list-disc list-inside text-gray-300 mb-6 space-y-1">
          <li>Engaging in fraudulent, illegal, or abusive activities.</li>
          <li>
            Attempting to gain unauthorized access to the platform or other
            users' accounts.
          </li>
          <li>
            Disrupting or interfering with the security or operation of
            SafeSwap.
          </li>
        </ul>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          4. Intellectual Property
        </h2>
        <p className="text-gray-400 mb-6">
          All content, trademarks, and data on SafeSwap are the property of the
          platform or its licensors. You may not use, copy, or distribute any
          content without permission.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          5. Disclaimer of Warranties
        </h2>
        <p className="text-gray-400 mb-6">
          SafeSwap is provided "as is" and "as available" without warranties of
          any kind. We do not guarantee the accuracy, reliability, or
          availability of the platform.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          6. Limitation of Liability
        </h2>
        <p className="text-gray-400 mb-6">
          To the fullest extent permitted by law, SafeSwap and its affiliates
          shall not be liable for any damages arising from your use of the
          platform.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          7. Governing Law
        </h2>
        <p className="text-gray-400 mb-6">
          These Terms of Use are governed by the laws of the jurisdiction in
          which SafeSwap operates.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          8. Changes to Terms
        </h2>
        <p className="text-gray-400 mb-6">
          We reserve the right to modify these Terms at any time. Continued use
          of the platform constitutes acceptance of the new terms. Please review
          this page regularly for updates.
        </p>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">
          9. Contact Information
        </h2>
        <p className="text-gray-400 mb-2">
          If you have any questions about these Terms, please contact us at{" "}
          <a
            href="mailto:support@safeswap.com"
            className="text-cyan-400 underline"
          >
            support@safeswap.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TermsOfUse;
