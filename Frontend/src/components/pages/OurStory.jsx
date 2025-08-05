import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  Target,
  Rocket,
  Lightbulb,
  Github,
  Facebook,
} from "lucide-react";

import avt1 from "../../../public/avt1.jpg";
import avt2 from "../../../public/avt2.jpg";
import avt3 from "../../../public/avt3.jpg";
import avt4 from "../../../public/avt4.jpg";
import avt5 from "../../../public/avt5.jpg";

// --- Helper Hook for On-Scroll Animations ---
// This hook detects when an element is visible on the screen.
const useInView = (options) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Optional: stop observing after it's visible once
        // observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isInView];
};

// --- Main OurStory Component ---
const OurStory = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Our Story...
      </div>
    );
  }

  return (
    <div className="bg-transparent text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-6 flex items-center justify-center text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            From a simple idea to a revolutionary platform. Discover the journey
            of SafeSwap and the vision that drives us.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-24">
            Our Mission to Make DeFi Safer
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gray-800"></div>

            <TimelineItem
              icon={Lightbulb}
              side="left"
              title="The Problem"
              titleColor="text-cyan-400"
            >
              <p className="mb-4">
                DeFi is exciting but dangerous. With over{" "}
                <strong>$300 million</strong> lost to rugpulls in 2023 alone,
                most users lack the tools to verify a token's safety before
                swapping.
              </p>
            </TimelineItem>

            <TimelineItem
              icon={Award}
              side="right"
              title="Our Response"
              titleColor="text-pink-400"
            >
              <p className="mb-4">
                We built a tool that thinks ahead of the scam. We combined a
                clean UI with real-time machine learning analysis to help you
                understand risks before you click "Swap."
              </p>
            </TimelineItem>

            <TimelineItem
              icon={Target}
              side="left"
              title="The Impact"
              titleColor="text-cyan-400"
            >
              <p className="mb-4">
                We don't just want users to trade. We want them to understand,
                feel confident, and stay safe. We're building a trust layer that
                the Aptos ecosystem—and Web3—desperately needs.
              </p>
            </TimelineItem>

            <TimelineItem
              icon={Rocket}
              side="right"
              title="What Comes Next"
              titleColor="text-pink-400"
            >
              <p className="mb-4">
                SafeSwap is just getting started. We're working on mainnet
                support, a public scam token registry, advanced audit
                scorecards, and a developer SDK to make DeFi safer for everyone.
              </p>
            </TimelineItem>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-[#101014]/50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-16">Meet the Team</h2>
          <div className="flex flex-wrap justify-center gap-10">
            <TeamMember
              imgSrc={avt3}
              name="Võ Tuấn Hùng"
              role="Team Leader & Idea Creator"
              glowColor="cyan"
              github="https://github.com/vtuanhung1205"
              facebook="https://www.facebook.com/tuane1205/"
            />
            <TeamMember
              imgSrc={avt4}
              name="Nguyễn Tăng Minh Thông"
              role="Backend Developer"
              glowColor="pink"
              github="https://github.com/thongntms171742"
              facebook="https://www.facebook.com/nguyentangminhthong"
            />
            <TeamMember
              imgSrc={avt1}
              name="Võ Đức Duy"
              role="UX/UI & Frontend Developer"
              glowColor="cyan"
              github="https://github.com/JION2004"
              facebook="https://www.facebook.com/vo.uc.duy.898055"
            />
            <TeamMember
              imgSrc={avt5}
              name="Trần Quốc Huy"
              role="Machine Learning Engineer"
              glowColor="pink"
              github="https://github.com/quwyimn"
              facebook="https://www.facebook.com/tran.quoc.huy.198847"
            />
            <TeamMember
              imgSrc={avt2}
              name="Nguyễn Văn Linh"
              role="Business Analyst"
              glowColor="cyan"
              github="https://github.com/mazino189"
              facebook="https://www.facebook.com/nguyen.van.linh.449754"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 text-center">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience the future of safe and intelligent token swapping on
            Aptos. Your secure journey into DeFi starts here.
          </p>
          <a
            href="/swap"
            className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 inline-block text-lg"
          >
            Start Swapping Securely
          </a>
        </div>
      </section>
    </div>
  );
};

// --- Helper Components ---

const TimelineItem = ({ icon: Icon, side, title, titleColor, children }) => {
  const [ref, isInView] = useInView({ threshold: 0.5, triggerOnce: true });
  const isLeft = side === "left";

  const animationClasses = isInView
    ? "opacity-100 translate-y-0"
    : "opacity-0 translate-y-8";

  return (
    <div
      ref={ref}
      className={`mb-16 flex ${
        isLeft ? "md:flex-row-reverse" : "md:flex-row"
      } flex-col items-center w-full`}
    >
      <div className="md:w-1/2 w-full">
        <div
          className={`transition-all duration-700 ease-out ${animationClasses} bg-[#18181c]/80 backdrop-blur-sm border border-[#23232a] rounded-2xl p-6 max-w-md ${
            isLeft ? "md:ml-auto" : "md:mr-auto"
          } ml-12 md:ml-0`}
        >
          <h3 className={`text-2xl font-bold ${titleColor} mb-3`}>{title}</h3>
          <div className="text-gray-300">{children}</div>
        </div>
      </div>
      <div
        className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center ring-4 ring-gray-800 transition-colors duration-500 ${
          isInView ? "text-cyan-400" : "text-gray-600"
        }`}
      >
        <Icon size={24} />
      </div>
      <div className="md:w-1/2"></div>
    </div>
  );
};

const TeamMember = ({ imgSrc, name, role, glowColor, github, facebook }) => {
  const glowClasses =
    glowColor === "cyan"
      ? "from-cyan-500/60 to-transparent"
      : "from-pink-500/60 to-transparent";

  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${glowClasses} rounded-3xl blur-lg opacity-0 group-hover:opacity-75 transition duration-300`}
      ></div>

      {/* Card Content */}
      <div className="relative bg-[#18181c] border border-[#23232a] rounded-2xl p-6 w-64 text-center transform group-hover:scale-105 transition-transform duration-300 flex flex-col h-full">
        <div className="flex-grow">
          <img
            src={imgSrc}
            alt={`Team Member ${name}`}
            className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-800"
          />
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <p className="text-gray-400">{role}</p>
        </div>

        {/* --- ADDED SOCIAL ICONS HERE --- */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex justify-center items-center space-x-4">
          {/* Remember to replace '#' with the actual links to the profiles */}
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-cyan-400 transition-colors duration-200"
            aria-label={`${name}'s Github Profile`}
          >
            <Github size={22} />
          </a>
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-cyan-400 transition-colors duration-200"
            aria-label={`${name}'s Facebook Profile`}
          >
            <Facebook size={22} />
          </a>
        </div>
        {/* --- END OF ADDED ICONS --- */}
      </div>
    </div>
  );
};

export default OurStory;
