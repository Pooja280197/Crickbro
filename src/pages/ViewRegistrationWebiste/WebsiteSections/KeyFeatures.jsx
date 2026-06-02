import React, { useState, useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";

const Points = ({ pagedata }) => {
  const [visibleCards, setVisibleCards] = useState({});
  const sectionRef = useRef(null);
  const keyFeatures = pagedata?.keyFeatures?.features || [];

  const hardcodedPoints = [
    {
      id: 1,
      title: "Create Your Player Identity",
      description:
        "Build a powerful profile with your role, skills, and stats to stand out in the auction.",
      icon: "👤",
    },
    {
      id: 2,
      title: "Step Into the Live Auction",
      description:
        "Be part of a real-time bidding experience where teams compete to pick you.",
      icon: "🔨",
    },
    {
      id: 3,
      title: "Get Valued for Your Skills",
      description:
        "Your performance and profile decide your demand and price in the auction.",
      icon: "📈",
    },
    {
      id: 4,
      title: "Fair & Transparent Selection",
      description:
        "Experience a completely fair auction process where every player gets equal visibility and opportunity.",
      icon: "⚖️",
    },
    {
      id: 5,
      title: "Stay Updated Instantly",
      description:
        "Know your auction status, bids, and selection updates without missing a moment.",
      icon: "⚡",
    },
    {
      id: 6,
      title: "Secure Your Spot in a Team",
      description:
        "Get selected by teams and lock your place for the tournament.",
      icon: "✅",
    },
    {
      id: 7,
      title: "Play & Win Exciting Prizes",
      description:
        "Participate in tournaments and compete for rewards, prizes, and recognition.",
      icon: "🏆",
    },
    {
      id: 8,
      title: "Join Multiple Auctions",
      description:
        "Participate in different auctions and increase your chances of getting selected.",
      icon: "🔁",
    },
  ];

  const keyFeaturesTitle =
    pagedata?.keyFeatures?.title || "THIS IS MORE THAN CRICKET.";

  console.log("🚀 ~ file: Points.jsx:24 ~ Points ~ keyFeatures:", keyFeatures)

  useEffect(() => {
    const observers = new Map();

    hardcodedPoints.forEach((point) => {
      const pointId = point._id || point.id;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => ({
              ...prev,
              [pointId]: true,
            }));
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
      );

      const element = document.getElementById(`point-${pointId}`);
      if (element) {
        observer.observe(element);
        observers.set(pointId, observer);
      }
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  console.log("🚀 ~ file: Points.jsx:24 ~ Points ~ keyFeatures:", keyFeatures)

  return (
    <div ref={sectionRef} className="relative py-12 md:py-20 bg-gray-50">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 opacity-10 w-96 h-96 rounded-full bg-yellow-400" />
      <div className="absolute bottom-0 left-0 opacity-10 w-80 h-80 rounded-full bg-purple-400" />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-blue-900">
            Key Features of Our Player Auction
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {keyFeatures?.map((point, idx) =>
            (<div
              key={point?._id}

              className={`flex flex-col transform transition-all duration-700 ease-out 
                 `}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="flex-1 bg-white rounded-xl p-4 border flex flex-col justify-between border-l-4 border-gray-400 hover:shadow-lg hover:scale-105 transition-all duration-300">
                {/* Top Section */}
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{point?.icon}</div>
                  <h3 className="text-lg md:text-base font-semibold text-gray-900">
                    {point?.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm md:text-sm leading-relaxed">
                  {point?.description}
                </p>

                {/* Checkmark Icon */}
                <div className="flex justify-end mt-4 text-yellow-500">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>)

          )}
        </div>
      </div>
    </div>
  );
};

export default Points;