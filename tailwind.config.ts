import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme"; // Import defaultTheme

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        crete: ['"Crete Round"', ...defaultTheme.fontFamily.serif], // Add Crete Round with serif fallback
      },
    },
  },
  plugins: [],
} satisfies Config;