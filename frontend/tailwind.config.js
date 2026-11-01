/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#6366f1", dark: "#4338ca", light: "#a5b4fc", 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81" },
        teal: { DEFAULT: "#14b8a6", dark: "#0d9488", light: "#5eead4", 50: "#f0fdfa", 100: "#ccfbf1" },
        ink: "#0f172a",
        paper: "#f8fafc",
        muted: "#64748b",
        // Keep old names for backward compat with dashboards etc
        brandDark: "#4338ca",
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.06), 0 20px 48px rgba(0,0,0,0.1)",
        glow: "0 0 60px -12px rgba(99,102,241,0.25)",
        "glow-teal": "0 0 60px -12px rgba(20,184,166,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.7s ease-out forwards",
        "fade-in-down": "fadeInDown 0.5s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "counter": "counter 2s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "shake": "shake 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeInUp: { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeInDown: { "0%": { opacity: "0", transform: "translateY(-16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { "0%": { opacity: "0", transform: "translateX(32px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideInLeft: { "0%": { opacity: "0", transform: "translateX(-32px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.9)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "15%, 45%, 75%": { transform: "translateX(-4px)" },
          "30%, 60%, 90%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};
