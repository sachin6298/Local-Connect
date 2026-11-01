export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: { brand: "#245B9A", brandDark: "#173F70", teal: "#2C8C86", ink: "#17212F", paper: "#F6F8FB" },
    boxShadow: { card: "0 14px 40px rgba(23,33,47,.08)" }
  }},
  plugins: []
};