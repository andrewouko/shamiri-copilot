import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shamiri: {
          green: "#2E7D32",
          "green-light": "#4CAF50",
          "green-pale": "#E8F5E9",
          amber: "#F59E0B",
          "amber-pale": "#FEF3C7",
          red: "#DC2626",
          "red-pale": "#FEE2E2",
          slate: "#475569",
          "slate-light": "#F8FAFC",
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
