

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        moveUp: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-50%)" },
        },
        moveDown: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0%)" },
        },
        zoomOut: {
          "0%": { transform: "scale(1.12)" },
          "100%": { transform: "scale(1)" },
        },
        moveRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },

        textUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "20%": { opacity: "1", transform: "translateY(0)" },
          "80%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideFade: {
          "0%": { opacity: "0" },
          "10%": { opacity: "1" },
          "40%": { opacity: "1" },
          "50%": { opacity: "0" },
          "100%": { opacity: "0" },
        },

        kenBurns: {
          "0%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },

        textFadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "20%": { opacity: "1", transform: "translateY(0)" },
          "80%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      fontFamily: {
        primary: ["var(--font-primary)"],
        heading: ["var(--font-heading)"],
        bebas: ["Bebas Neue", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },

      animation: {
        slide1: "slideFade 20s ease-in-out infinite",
        slide2: "slideFade 20s ease-in-out infinite 5s",
        slide3: "slideFade 20s ease-in-out infinite 10s",
        slide4: "slideFade 20s ease-in-out infinite 15s",
        slideDown: "slideDown 0.25s ease-out",
        moveUp: "moveUp 10s linear infinite",
        moveDown: "moveDown 10s linear infinite",
        kenBurns: "kenBurns 20s ease-out infinite",
        textFadeUp: "textFadeUp 20s ease-in-out infinite",
        moveright: 'moveRight 50s linear infinite',

      },
    },

  },
  plugins: [],
};
