import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        script: ['"Arizonia"', "cursive"],
        sans: ['"Inter"', "sans-serif"],
      },
      colors: {
        ...colors,
        brand: {
          pink: {
            50: "#fff5f7",
            100: "#ffe5ea",
            200: "#f9ccd5",
            300: "#f4a7b5",
            400: "#ee7997",
            500: "#e6547b",
            600: "#d63384",
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
            500: "#d4af37",
            600: "#b6962f",
            700: "#937726",
            800: "#71591c",
            900: "#4f3c13",
          },
        },
        border: "var(--border)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
      },
    },
  },
  plugins: [typography, forms, aspectRatio, lineClamp],
};

export default config;
