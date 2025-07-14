

import React from "react";
import {
  Github,
  Mail,
  Lightbulb,
  Lock,
  Rocket,
  Code,
  Sprout,
  Users,
  CheckCircle2,
  Beaker,
  Wrench,
  Paintbrush,
  Link as LinkIcon,
  Puzzle,
} from "lucide-react";

// A reusable Section component for consistent styling
const Section = ({ id, title, icon, children }) => (
  <section id={id} className="py-12">
    <div className="flex items-center justify-center gap-4 mb-8">
      {React.cloneElement(icon, { className: "text-cyan-400", size: 32 })}
      <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
        {title}
      </h2>
    </div>
    {children}
  </section>
);

// A reusable card for features and expertise areas
const InfoCard = ({ icon, title, description }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 h-full">
    <div className="flex items-center gap-4 mb-4">
      {React.cloneElement(icon, { className: "text-cyan-400", size: 24 })}
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const About = () => {
  const expertise = [
    { icon: <Beaker />, name: "Machine Learning" },
    { icon: <Wrench />, name: "Blockchain Dev" },
    { icon: <Paintbrush />, name: "UI/UX Design" },
    { icon: <LinkIcon />, name: "Web3 Integration" },
    { icon: <Puzzle />, name: "Product Thinking" },
  ];

  return (
    <div className="bg-black text-white">
      {/* Hero Section */}
      <header className="relative text-center py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-pink-900/20 opacity-70"></div>
        <div className="absolute inset-0 w-full h-full bg-[url('/path-to-grid.svg')] bg-repeat opacity-5"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            About SafeSwap
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Building a safer, smarter, and more transparent DeFi experience on
            the Aptos blockchain.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Our Mission Section */}
        <Section id="mission" title="Our Mission" icon={<Lightbulb />}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-lg text-gray-300 leading-relaxed space-y-4">
              <p>
                In the rapidly growing world of decentralized finance (DeFi),
                security is no longer optional—it’s essential. Our mission is to
                make token swapping{" "}
                <strong className="text-cyan-300">
                  safer, smarter, and more transparent
                </strong>{" "}
                for every user.
              </p>
              <p>
                We believe every Web3 user deserves{" "}
                <strong className="text-cyan-300">trustworthy tools</strong> to
                navigate an open but unpredictable ecosystem. SafeSwap is built
                to protect your wallet and give you peace of mind.
              </p>
            </div>
            <div className="flex justify-center items-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-cyan-500 rounded-full opacity-20 blur-2xl"></div>
                <Lock
                  size={128}
                  className="text-cyan-400 relative z-10 animate-pulse"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Why SafeSwap Section */}
        <Section id="why" title="Why SafeSwap?" icon={<Rocket />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={<CheckCircle2 />}
              title="Real-time Analysis"
              description="We analyze smart contracts and token data in real time to flag risks."
            />
            <InfoCard
              icon={<CheckCircle2 />}
              title="AI-Powered"
              description="Our model is trained on actual scam patterns to provide accurate warnings."
            />
            <InfoCard
              icon={<CheckCircle2 />}
              title="Clear Alerts"
              description="Receive clear, understandable alerts before you sign a risky transaction."
            />
            <InfoCard
              icon={<CheckCircle2 />}
              title="Full Transparency"
              description="Track all your swaps with a detailed history for education and review."
            />
          </div>
        </Section>

        {/* Built By Section */}
        <Section
          id="team"
          title="Built By Developers, For Everyone"
          icon={<Code />}
        >
          <p className="text-center text-lg text-gray-300 max-w-3xl mx-auto mb-10">
            SafeSwap was created by a passionate team of developers, designers,
            and security researchers during the{" "}
            <strong className="text-white">Vietnam Aptos Hackathon 2025</strong>
            . Our team combines expertise in:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {expertise.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-cyan-500/10 transition-colors"
              >
                {React.cloneElement(item.icon, {
                  className: "text-cyan-400",
                  size: 20,
                })}
                <span className="text-white font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Our Vision Section */}
        <Section id="vision" title="Our Vision" icon={<Sprout />}>
          <p className="text-center text-lg text-gray-300 max-w-3xl mx-auto mb-12">
            We don’t just want to protect users—we want to{" "}
            <strong className="text-cyan-300">
              raise the security standard
            </strong>{" "}
            for the entire Web3 ecosystem.
          </p>
          <div className="relative">
            {/* The timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-white/10 -translate-x-1/2"></div>
            <div className="space-y-16">
              {[
                {
                  title: "Public Scam Registry",
                  desc: "Launch a community-driven database of fraudulent tokens.",
                },
                {
                  title: "Verification APIs",
                  desc: "Offer real-time token verification APIs for other dApps to use.",
                },
                {
                  title: "DEX Integrations",
                  desc: "Integrate swap safety features directly into Aptos DEXes.",
                },
                {
                  title: "Protocol Partnerships",
                  desc: "Partner with DeFi protocols and wallets to expand protection.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="relative flex items-center justify-center"
                >
                  <div className="absolute w-4 h-4 bg-cyan-400 rounded-full left-1/2 -translate-x-1/2 ring-8 ring-black"></div>
                  <div
                    className={`w-5/12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm ${
                      index % 2 === 0 ? "text-right -translate-x-12" : "text-left translate-x-12"
                    }`}
                  >
                    <h4 className="font-bold text-white text-xl mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Join Us Section */}
        <Section id="join" title="Join Us" icon={<Users />}>
          <p className="text-center text-lg text-gray-300 max-w-3xl mx-auto mb-8">
            Whether you're a builder, investor, or DeFi explorer, we welcome
            your feedback and contributions. Let's make Web3 safer, together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yourteam/safeswap"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <Github size={20} />
              View on GitHub
            </a>
            <a
              href="mailto:safeswap@proton.me"
              className="flex items-center justify-center gap-3 px-8 py-4 border border-cyan-600 text-cyan-500 hover:bg-cyan-600 hover:text-white font-bold rounded-2xl transition-all duration-300"
            >
              <Mail size={20} />
              Contact Us
            </a>
          </div>
        </Section>
      </main>
    </div>
  );
};

export default About;