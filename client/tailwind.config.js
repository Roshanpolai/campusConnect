/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F1EFFE",
          100: "#E4E0FD",
          200: "#C9C1FC",
          300: "#ADA2FA",
          400: "#8B7DF9",
          500: "#6D5EF8",
          600: "#5643E8",
          700: "#4433C4",
          800: "#35279C",
          900: "#281D75",
        },
        sidebar: {
          DEFAULT: "#12101C",
          hover: "#1D1A2B",
          active: "#241F3B",
          border: "#242038",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        ink: {
          900: "rgb(var(--ink-900) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
          400: "rgb(var(--ink-400) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        pill: "999px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21, 19, 33, 0.04), 0 8px 24px -8px rgba(21, 19, 33, 0.08)",
        card: "0 1px 2px rgba(21, 19, 33, 0.03), 0 12px 32px -12px rgba(109, 94, 248, 0.12)",
        glow: "0 8px 30px -8px rgba(109, 94, 248, 0.45)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #7C6FFA 0%, #6D5EF8 45%, #5643E8 100%)",
        "sidebar-gradient": "linear-gradient(180deg, #15121F 0%, #0F0D18 100%)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
