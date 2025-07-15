import React, { useState, useEffect, useRef } from "react";
import {
  Github,
  Mail,
  Lightbulb,
  Rocket,
  Code,
  Sprout,
  Users,
  ShieldCheck,
  BrainCircuit,
  Eye,
  BookOpen,
} from "lucide-react";

// --- Helper Hook for On-Scroll Animations ---
const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return [ref, isInView];
};

// --- Helper Components ---

const Section = ({ children, className = "" }) => (
  <section className={`py-20 sm:py-24 ${className}`}>{children}</section>
);

const SectionTitle = ({ children }) => (
  <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
    {children}
  </h2>
);

const ShieldVisual = () => (
  <div className="relative w-64 h-64 flex items-center justify-center">
    {/* Pulsing glow */}
    <div className="absolute w-full h-full bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
    {/* Rotating rings */}
    <div className="absolute w-full h-full border-2 border-cyan-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
    <div className="absolute w-48 h-48 border-2 border-cyan-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
    {/* Central icon */}
    <ShieldCheck size={96} className="text-cyan-400 relative z-10" />
  </div>
);

// --- Main About Component ---

const About = () => {
  return (
    <div className="bg-transparent text-white">
      {/* Hero Section */}
      <header className="relative text-center py-24 sm:py-32 px-6">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            About SafeSwap
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            We're on a mission to build a safer, smarter, and more transparent
            DeFi experience on the Aptos blockchain.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Our Mission Section */}
        <Section>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-lg text-gray-300 leading-relaxed space-y-6">
              <h2 className="text-4xl font-bold text-white">
                Security is no longer optional—it’s essential.
              </h2>
              <p>
                In the rapidly growing world of DeFi, every user deserves{" "}
                <strong className="text-cyan-300">trustworthy tools</strong> to
                navigate an open but unpredictable ecosystem. Our mission is to
                make token swapping safer for everyone, from first-time users to seasoned veterans.
              </p>
              <p>
                SafeSwap is our answer: a platform built to protect your wallet and give you peace of mind.
              </p>
            </div>
            <div className="flex justify-center items-center">
              <ShieldVisual />
            </div>
          </div>
        </Section>

        {/* Our Core Principles Section */}
        <Section className="bg-[#101014]/50 rounded-3xl">
          <SectionTitle>Our Core Principles</SectionTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <PrincipleCard icon={ShieldCheck} title="Real-time Protection" description="We analyze smart contracts and token data in real time to flag risks before you transact." />
            <PrincipleCard icon={BrainCircuit} title="AI-Powered Intelligence" description="Our model is trained on thousands of real-world scam patterns to provide highly accurate warnings." />
            <PrincipleCard icon={Eye} title="Actionable Clarity" description="Receive clear, understandable alerts about potential risks, not confusing jargon." />
            <PrincipleCard icon={BookOpen} title="Radical Transparency" description="Track all your swaps with a detailed history for education, review, and peace of mind." />
          </div>
        </Section>

        {/* The Hackathon Story Section */}
        <Section>
          <div className="text-center">
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-pink-500 p-1 rounded-full mb-8">
              <div className="bg-black px-4 py-2 rounded-full">
                <p className="text-lg font-semibold text-white">
                  Forged at the Vietnam Aptos Hackathon 2025
                </p>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built By Developers, For Everyone
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              SafeSwap was created by a passionate team of developers, designers,
              and security researchers who believe in a safer Web3. Our combined expertise in Machine Learning, Blockchain Development, and Product Design drove us to build a solution we'd confidently use ourselves.
            </p>
          </div>
        </Section>

        {/* Our Vision Section */}
        <Section>
          <SectionTitle>Our Vision for a Safer Web3</SectionTitle>
          <p className="text-center text-lg text-gray-300 max-w-3xl mx-auto mb-20">
            We don’t just want to protect users—we want to{" "}
            <strong className="text-cyan-300">raise the security standard</strong>{" "}
            for the entire ecosystem. Here's our roadmap:
          </p>
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/10 -translate-x-1/2"></div>
            <div className="space-y-4">
              <TimelineNode icon={Sprout} title="Public Scam Registry" desc="Launch a community-driven database of fraudulent tokens and contracts." />
              <TimelineNode icon={Code} title="Verification APIs for Builders" desc="Offer real-time token verification APIs for other dApps and wallets to integrate." side="right" />
              <TimelineNode icon={Rocket} title="Direct DEX Integrations" desc="Integrate swap safety features directly into the most popular Aptos DEXes." />
              <TimelineNode icon={Users} title="Protocol Partnerships" desc="Partner with leading DeFi protocols and wallets to expand user protection across the ecosystem." side="right" />
            </div>
          </div>
        </Section>

        {/* Join Us Section */}
        <Section className="bg-[#101014]/50 rounded-3xl">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">Let's Build Together</h2>
            <p className="text-lg text-gray-300 mb-8">
              Whether you're a builder, investor, or DeFi explorer, we welcome
              your feedback and contributions. Let's make Web3 safer, together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/vtuanhung1205/SafeSwap-Token" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105">
                <Github size={20} />
                View on GitHub
              </a>
              <a href="mailto:safeswap@proton.me" className="flex items-center justify-center gap-3 px-8 py-4 border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300">
                <Mail size={20} />
                Contact Us
              </a>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
};

// --- More Helper Components ---

const PrincipleCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 h-full hover:-translate-y-1">
    <div className="flex items-center gap-4 mb-4">
      <Icon className="text-cyan-400" size={28} />
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const TimelineNode = ({ icon: Icon, title, desc, side = "left" }) => {
  const [ref, isInView] = useInView({ threshold: 0.5, triggerOnce: true });
  const alignmentClass = side === "left" ? "md:text-right" : "md:text-left";
  const orderClass = side === "left" ? "md:pr-12" : "md:pl-12 md:order-last";
  const animationClass = isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5";

  return (
    <div ref={ref} className={`grid md:grid-cols-2 items-center my-8 transition-all duration-700 ease-out ${animationClass}`}>
      <div className={`space-y-2 ${orderClass} ${alignmentClass}`}>
        <h4 className="font-bold text-white text-xl">{title}</h4>
        <p className="text-gray-400">{desc}</p>
      </div>
      <div className="absolute w-10 h-10 bg-black border-2 border-cyan-400 rounded-full left-1/2 -translate-x-1/2 flex items-center justify-center">
        <Icon className="text-cyan-400" size={20} />
      </div>
      {/* Spacer div */}
      <div></div>
    </div>
  );
};

export default About;