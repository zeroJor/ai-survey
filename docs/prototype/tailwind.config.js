/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        brand: ['"Barlow Condensed"', "system-ui", "sans-serif"],
      },
      colors: {
        idwa: {
          blue: "rgb(0 180 255 / <alpha-value>)",
          "blue-light": "rgb(110 231 255 / <alpha-value>)",
          "blue-dark": "rgb(0 119 255 / <alpha-value>)",
          ink: "rgb(10 10 10 / <alpha-value>)",
          charcoal: "rgb(10 10 10 / <alpha-value>)",
          muted: "rgb(115 115 115 / <alpha-value>)",
          surface: "rgb(255 255 255 / <alpha-value>)",
          page: "rgb(255 255 255 / <alpha-value>)",
          line: "rgb(229 229 229 / <alpha-value>)",
          accent: "rgb(110 231 255 / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
