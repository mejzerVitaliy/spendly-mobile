/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "#1F2937",
        input: "#1F2937",
        ring: "#3B82F6",

        background: "#0C0516",
        foreground: "#E5E7EB",

        primary: {
          DEFAULT: "#977DFF",
          foreground: "#FFFFFF",
          hover: "#2563EB",
        },

        secondary: {
          DEFAULT: "#321F54",
          foreground: "#fff",
        },

        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#1F2937",
          foreground: "#9CA3AF",
        },

        accent: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },

        card: {
          DEFAULT: "#1B0642",
          foreground: "#E5E7EB",
        },

        success: {
          DEFAULT: "#22C55E",
          foreground: "#052E16",
        },

        warning: {
          DEFAULT: "#EAB308",
          foreground: "#422006",
        },

        info: {
          DEFAULT: "#0EA5E9",
          foreground: "#082F49",
        },
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
      },
    },
  },
  plugins: [],
}

