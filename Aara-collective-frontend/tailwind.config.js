// content: [] Tells Tailwind where to look for class names.Keeps your final CSS lean by removing unused styles (via PurgeCSS).
//theme.extend lets us customize Tailwind’s default design system to match your brand.

import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import lineClamp from "@tailwindcss/line-clamp";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Great Vibes"', "cursive"], // for "Aara"
        sans: ['"Inter"', "sans-serif"], // for "COLLECTIVE"
      },
      colors: {
        pink: {
          50: "#fff5f7",
          100: "#ffe5ea",
          200: "#f9ccd5",
          300: "#f4a7b5",
          400: "#ee7997",
          500: "#e6547b",
          600: "#d63384", // primary pink
          700: "#b31965",
          800: "#8c124f",
          900: "#5e0c35",
        },
        gold: {
          50: "#fdf7e7",
          100: "#fbefc5",
          200: "#f9e7a1",
          300: "#f4d76f",
          400: "#efc743",
          500: "#d4af37", // brand gold
          600: "#b6962f",
          700: "#937726",
          800: "#71591c",
          900: "#4f3c13",
        },
      },
    },
  },
  plugins: [typography, forms, aspectRatio, lineClamp],
};
