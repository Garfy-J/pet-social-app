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
        primary: {
          DEFAULT: "#FF6B4A",
          dark: "#E85536",
        },
        secondary: {
          DEFAULT: "#1B8A87",
          dark: "#146967",
        },
        accent: {
          DEFAULT: "#FFC94A",
          dark: "#F0B62E",
        },
        background: "#FFFBF7",
        foreground: "#3A2E29",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};
export default config;
