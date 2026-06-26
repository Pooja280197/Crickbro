import { useEffect, useState } from "react";

export default function Slider({ pagedata }) {
  const [active, setActive] = useState(0);

  const slides = pagedata?.sliderImages || [];

  // AUTO SLIDE
  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] overflow-hidden bg-black">
      
      {slides.map((slide, index) => {
        const isActive = index === active;

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 
            ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          >
            {/* 🔥 BLUR BACKGROUND (fills empty space nicely) */}
            <div
              className="absolute inset-0 bg-center bg-cover blur-2xl scale-110"
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            />

            {/* ✅ FULL IMAGE (NO CROP, NO STRETCH) */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* TEXT */}
            <div
              className={`absolute bottom-[10%] left-[5%] sm:left-[10%] text-white max-w-xl
              transition-all duration-700
              ${
                isActive
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <h1 className="text-xl sm:text-3xl md:text-5xl font-bold">
                {slide.title}
              </h1>

              <p className="mt-2 text-sm sm:text-base md:text-lg text-white/90">
                {slide.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
