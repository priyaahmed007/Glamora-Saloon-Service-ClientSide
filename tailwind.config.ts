import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          50: "#F8F5FA",
          100: "#EFE9F2",
          200: "#DDD2E4",
          300: "#C9BDD0",
          500: "#7C6585",
          700: "#4D3558",
          900: "#2B1A33",
          950: "#1F1226",
        },
        mulberry: {
          50: "#FBF0F6",
          100: "#F6DCEA",
          200: "#EDB9D4",
          400: "#D0679F",
          500: "#B63F82",
          600: "#9B2E6B",
          700: "#7E2557",
          800: "#651F47",
        },
        sage: {
          50: "#EFF6F3",
          100: "#D6E9E1",
          600: "#2F7D63",
          700: "#256350",
        },
        pearl: "#FBF8FB",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(43,26,51,0.06), 0 6px 20px -8px rgba(43,26,51,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
