import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
      },
      colors: {
        // Primary
        midnight: "hsl(var(--midnight))",
        amber: "hsl(var(--amber))",
        "sunset-gold": "hsl(var(--sunset-gold))",
        "cloud-mist": "hsl(var(--cloud-mist))",
        
        // Remembrance
        "serenity-grey": "hsl(var(--serenity-grey))",
        "muted-indigo": "hsl(var(--muted-indigo))",
        "soft-lavender": "hsl(var(--soft-lavender))",
        
        // Culture
        terracotta: "hsl(var(--terracotta))",
        sand: "hsl(var(--sand))",
        "forest-teal": "hsl(var(--forest-teal))",
        
        // Travel
        "adventure-green": "hsl(var(--adventure-green))",
        "sky-blue": "hsl(var(--sky-blue))",
        "volcano-grey": "hsl(var(--volcano-grey))",
        
        // AI
        "highlight-cyan": "hsl(var(--highlight-cyan))",
        "accent-violet": "hsl(var(--accent-violet))",
        
        // Semantic
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
        'section': '48px',
      },
      boxShadow: {
        'card': '0 8px 28px rgba(10, 26, 47, 0.08)',
        'card-hover': '0 16px 40px rgba(10, 26, 47, 0.14)',
        'card-elevated': '0 16px 32px rgba(10, 26, 47, 0.12)',
        'modal': '0 10px 40px rgba(10, 26, 47, 0.18)',
        'player': '0 -4px 24px rgba(10, 26, 47, 0.12)',
        'map': '0 12px 32px rgba(0, 0, 0, 0.12)',
        'hero': '0 28px 48px rgba(0, 0, 0, 0.18)',
        'search': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'footer': '0 -4px 24px rgba(0, 0, 0, 0.10)',
        'glow-amber': '0 0 12px 6px rgba(255, 184, 92, 0.45)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-hero": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "bounce-pin": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 184, 92, 0.4)" },
          "50%": { boxShadow: "0 0 12px 4px rgba(255, 184, 92, 0.6)" },
        },
        "slide-up-player": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-up": "float-up 0.5s cubic-bezier(0.2, 0, 0, 1) forwards",
        "fade-in-hero": "fade-in-hero 0.6s cubic-bezier(0.2, 0, 0, 1) forwards",
        "bounce-pin": "bounce-pin 1s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "slide-up-player": "slide-up-player 0.3s cubic-bezier(0.2, 0, 0, 1) forwards",
        "stagger-in": "stagger-in 0.4s cubic-bezier(0.2, 0, 0, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
