import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: {
          DEFAULT: "var(--bg-surface)",
          subtle: "var(--bg-surface-subtle)",
          hover: "var(--bg-hover)",
        },
        overlay: "var(--bg-overlay)",
        brand: "var(--brand-primary)",
        verified: "var(--accent-secondary)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverted: "var(--text-inverted)",
        },
        accent: {
          primary: {
            DEFAULT: "var(--accent-primary)",
            hover: "var(--accent-primary-hover)",
            active: "var(--accent-primary-active)",
          },
          secondary: "var(--accent-secondary)",
          cyan: "var(--accent-cyan)",
          indigo: "var(--accent-indigo)",
        },
        gold: {
          DEFAULT: "var(--gold-primary)",
          brushed: "var(--gold-brushed)",
          pale: "var(--gold-pale)",
        },
        "indigo-brand": "var(--accent-indigo)",
        border: {
          subtle: "var(--border-subtle)",
          warm: "var(--border-warm)",
          focus: "var(--border-focus)",
        },
        status: {
          success: {
            bg: "var(--status-success-bg)",
            border: "var(--status-success-border)",
            text: "var(--status-success-text)",
          },
          warning: {
            bg: "var(--status-warning-bg)",
            border: "var(--status-warning-border)",
            text: "var(--status-warning-text)",
          },
          danger: {
            bg: "var(--status-danger-bg)",
            border: "var(--status-danger-border)",
            text: "var(--status-danger-text)",
          },
          info: {
            bg: "var(--status-info-bg)",
            border: "var(--status-info-border)",
            text: "var(--status-info-text)",
          },
        },
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      minHeight: {
        tap: "44px",
      },
      minWidth: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
