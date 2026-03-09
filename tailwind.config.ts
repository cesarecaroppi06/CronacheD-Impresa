import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.css",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        accent: "#2563eb",
        paper: "#f5f5f5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      maxWidth: {
        reading: "72ch",
      },
      boxShadow: {
        soft: "0 10px 30px -16px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
