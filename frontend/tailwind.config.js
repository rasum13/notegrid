/** @type {import('tailwindcss').Config} */

const fontSize = {
  xs:   ["13px",   { lineHeight: "1.5" }],   // metadata, captions, table headers
  sm:   ["14.5px", { lineHeight: "1.55" }],  // secondary text, labels, buttons
  base: ["16px",   { lineHeight: "1.6" }],   // body text, card titles
  lg:   ["18px",   { lineHeight: "1.45" }],  // page headings
  xl:   ["22px",   { lineHeight: "1.35" }],  // resource titles, big stats
  "2xl":["28px",   { lineHeight: "1.25" }],  // hero numbers (reputation)
};

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    fontSize,
    extend: {
      colors: {
        paper: "#FAFAF7",
        surface: "#FFFFFF",
        ink: "#1C1B18",
        muted: "#6B6A62",
        faint: "#9C9B91",
        line: "#E6E4DA",
        accent: {
          50: "#E9F3EF",
          100: "#CBE6DA",
          400: "#3E8F72",
          600: "#1D6B50",
          700: "#155A42",
        },
        warn: {
          100: "#FBEFDD",
          600: "#9A6B1E",
        },
        error: {
          600: "#F03333",
        },
      },
      fontFamily: {
        sans: ["Source Sans 3", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Source Serif 4", "Georgia", "serif"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
