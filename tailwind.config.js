const config = {
  content: [
    "./src/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d7fe",
          300: "#a5b9fc",
          400: "#8093f9",
          500: "#5f6bf3",
          600: "#4a4de6",
          700: "#3c3bcb",
          800: "#3233a3",
          900: "#2d3081",
        },
        ink: "#111827",
        panel: "#f4f7fb",
        night: "#0f172a",
        sidebar: "#111827",
        cloud: "#eef2f7",
        mint: "#14b8a6",
        coral: "#f97316",
        gold: "#f59e0b",
        slate: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "wave": "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%":      { transform: "scaleY(1.5)" },
        },
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.04), 0 16px 40px rgba(0,0,0,0.10)",
        "brand": "0 8px 32px rgba(95,107,243,0.24)",
        "soft": "0 18px 45px rgba(23, 32, 42, 0.08)",
        "lift": "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
