/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        green: "#00c896",
        "green-dark": "#009e78",
        "green-light": "#e6faf5",
        "green-subtle": "#0a2a1e",
        beige: "#f5f0e8",
        "beige-dark": "#e8e0d0",
        "beige-text": "#6b6155",
        black: "#0d1117",
        "black-card": "#161b22",
        "black-hover": "#1c2333",
        "black-border": "#30363d",
        white: "#ffffff",
        "white-soft": "#e6edf3",
        "white-muted": "#8b949e",
        "white-dim": "#484f58",
        warning: "#e3b341",
        error: "#f85149",
        info: "#58a6ff",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
    },
  },
  plugins: [],
};
