/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#121214",
        panel: "#1C1C21",
        raised: "#26262C",
        edge: "#33333A",
        ink: "#F2F1ED",
        inkMuted: "#9B9AA3",
        cab: "#F5B400",
        cabDim: "#8A6600",
        meter: "#34D399",
        alert: "#F87171",
      },
      fontFamily: {
        display: ["'Work Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
