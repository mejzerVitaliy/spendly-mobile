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
        border: "#262626",
        input: "#161616",
        ring: "rgba(34,211,238,0.4)",

        background: "#080808",
        foreground: "#F2F2F2",

        primary: {
          DEFAULT: "#22D3EE",
          foreground: "#080808",
        },

        secondary: {
          DEFAULT: "#1A1A1A",
          foreground: "#D4D4D4",
        },

        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#1C1C1C",
          foreground: "#737373",
        },

        accent: {
          DEFAULT: "#22D3EE",
          foreground: "#080808",
        },

        card: {
          DEFAULT: "#111111",
          foreground: "#F2F2F2",
        },

        success: {
          DEFAULT: "#22C55E",
          foreground: "#FFFFFF",
        },

        warning: {
          DEFAULT: "#EAB308",
          foreground: "#000000",
        },

        info: {
          DEFAULT: "#0EA5E9",
          foreground: "#FFFFFF",
        },

        glass: {
          DEFAULT: "rgba(255,255,255,0.05)",
          medium: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.12)",
          border: "rgba(255,255,255,0.08)",
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
