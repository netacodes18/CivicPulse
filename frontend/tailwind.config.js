module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif", "'Plus Jakarta Sans'"],
      },
      colors: {
        brand: {
          dark: "#047857",     // emerald-700
          DEFAULT: "#059669",  // emerald-600
          light: "#10b981",    // emerald-500
          accent: "#d1fae5",   // emerald-100
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
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
