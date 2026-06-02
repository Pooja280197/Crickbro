import React, { useEffect, useState, useRef } from "react";
import { useContent } from "../../contexts/ContentContext";

const Sponsors = ({ pagedata }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const { content } = useContent();

  const sponsors = pagedata?.sponsors || content?.sponsors || [];
  const cards = pagedata?.cardImages?.Images || [];

  // AUTO SCROLL ONLY IF MORE THAN 5 LOGOS
  const shouldAutoScroll = sponsors?.length > 5;

  const sliderRef = useRef(null);

  /* ================= TEAM IMAGE AUTO CHANGE ================= */

  useEffect(() => {
    if (!cards.length) return;

    const interval = setInterval(() => {
      setAnimate(false);

      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % cards.length);
        setAnimate(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [cards.length]);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [activeIndex]);

  const handleThumbnailClick = (index) => {
    setAnimate(false);

    setTimeout(() => {
      setActiveIndex(index);
      setAnimate(true);
    }, 200);
  };

  /* ================= SPONSOR AUTO SCROLL ================= */

  useEffect(() => {
    if (!shouldAutoScroll) return;

    const slider = sliderRef.current;

    if (!slider) return;

    let animationFrame;

    const autoScroll = () => {
      if (!slider) return;

      if (!isPaused) {
        slider.scrollLeft += 0.7;

        // INFINITE LOOP
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) {
          slider.scrollLeft = 0;
        }
      }

      animationFrame = requestAnimationFrame(autoScroll);
    };

    animationFrame = requestAnimationFrame(autoScroll);

    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, shouldAutoScroll]);

  return (
    <div
      className="h-auto pb-12"
      style={{
        background:
          "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 50%, #f1f5f9 100%)",
      }}
    >

     <div className="h-4 md:h-6" />

      {/* ================= SPONSORS ================= */}

      <section
        className="
          pt-6 pb-16 md:pt-8 md:pb-20
          bg-white/90 backdrop-blur-md
          border border-gray-200
          rounded-2xl
          shadow-[0_-12px_30px_rgba(0,0,0,0.15),0_20px_50px_rgba(0,0,0,0.25)]
        "
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-center text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Our Sponsors
          </h2>

          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            We proudly collaborate with partners who support and inspire
            excellence.
          </p>

          {/* SLIDER */}

          <div
            ref={sliderRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="
              flex
              gap-6
              md:gap-8
              items-center
              overflow-x-scroll
              overflow-y-hidden
              whitespace-nowrap
              touch-pan-x
              py-4
              scrollbar-hide
            "
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {(shouldAutoScroll ? [...sponsors, ...sponsors] : sponsors).map(
              (s, i) => (
                <div
                  key={i}
                  className="
                  min-w-[180px]
                  md:min-w-[220px]
                  flex-shrink-0
                  flex
                  flex-col
                  items-center
                  justify-center
                  p-5
                  md:p-6
                  bg-gradient-to-br
                  from-white
                  via-gray-50
                  to-white
                  rounded-2xl
                  border border-gray-200
                  shadow-[0_10px_25px_rgba(0,0,0,0.15)]
                  hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]
                  hover:-translate-y-2
                  hover:scale-105
                  transition-all
                  duration-300
                  relative
                  overflow-hidden
                "
                >
                  {/* GLOW EFFECT */}

                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-transparent opacity-0 hover:opacity-100 transition" />

                  {/* LOGO */}

                  <div className="h-[85px] flex items-center justify-center bg-white rounded-md px-3 z-10">
                    <img
                      src={s.logo}
                      alt={s.name}
                      className="max-h-[70px] object-contain"
                    />
                  </div>

                  {/* NAME */}

                  <p className="text-gray-900 text-sm font-semibold text-center mt-3 z-10">
                    {s.name}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sponsors;
