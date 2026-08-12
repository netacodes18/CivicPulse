module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif", "'Plus Jakarta Sans'"],
      },
      colors: {
        brand: {
          dark: "#0F432B",
          DEFAULT: "#155D3A",
          light: "#2B8256",
          accent: "#E6F0EB",
        },
        status: {
          resolved: "#3B82F6",
          pending: "#F59E0B",
          inprogress: "#10B981",
          high: "#EF4444",
          medium: "#F59E0B",
          low: "#3B82F6",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        }
      },
    },
  },
  plugins: [],
};
