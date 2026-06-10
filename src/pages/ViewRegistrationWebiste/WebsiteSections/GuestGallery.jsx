import React, { useEffect, useState, useRef } from "react";
import { useContent } from "../../../context/ContentContext";

const GuestGallery = ({ pagedata }) => {
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
        if (
          slider.scrollLeft >=
          slider.scrollWidth - slider.clientWidth
        ) {
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
      {/* ================= TEAM SECTION ================= */}

      {cards.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Meet Our Teams
          </h2>

          <p className="text-gray-600 mb-6 max-w-2xl">
            A showcase of personalities who bring energy and inspiration to the
            event.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
            {/* MAIN IMAGE */}

            <div className="md:col-span-3">
              <div className="relative rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[340px] bg-white">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <img
                  decoding="async"
                  src={cards[activeIndex]?.imageUrl}
                  alt=""
                  onLoad={() => setIsImageLoaded(true)}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
                    animate ? "opacity-100" : "opacity-0 scale-105"
                  }`}
                />
              </div>
            </div>

            {/* THUMBNAILS */}

            <div className="md:col-span-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cards.map((card, index) => (
                  <div
                    key={card._id}
                    onClick={() => handleThumbnailClick(index)}
                    className={`cursor-pointer rounded-xl overflow-hidden shadow h-[120px] transition-all duration-300 ${
                      activeIndex === index
                        ? "ring-2 ring-indigo-500 scale-105"
                        : "hover:scale-105"
                    }`}
                  >
                    <img
                      loading="lazy"
                      decoding="async"
                      src={card.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="h-4 md:h-6" />
   
    </div>
  );
};

export default GuestGallery;
