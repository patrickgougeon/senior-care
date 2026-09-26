import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Corresponds exactly to the warm cream background of the animation
        sand: {
          50:  "#FAF8F4",
          100: "#EDE9E1",   // main page background — matches the animation
          200: "#E0DBD1",
          300: "#CCC5B7",
        },
        // Ribbon colors from the animation
        ribbon: {
          lavender: "#B8A8D4",
          pink:     "#E8A0C0",
          blue:     "#90B8D8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
