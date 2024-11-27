import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme"; // Import defaultTheme

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Custom CSS variable for background
        foreground: "var(--foreground)", // Custom CSS variable for foreground
        bb: {
          DEFAULT: '#042433'
        }
      },
      fontFamily: {
        crete: ["var(--font-crete-round)", ...defaultTheme.fontFamily.serif],
        raleway: ["var(--font-raleway)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config;