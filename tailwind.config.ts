import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta NOK extraída de nok.rent
        "nok-bg":           "#f7f7f3",   // crema principal
        "nok-black":        "#1d1d1b",   // negro NOK
        "nok-green-dark":   "#0b2922",   // verde bosque oscuro (sidebar)
        "nok-green":        "#193125",   // verde bosque medio
        "nok-green-muted":  "#3f4c39",   // verde oliva apagado
        "nok-gold":         "#d6a700",   // dorado sunset (acento principal)
        "nok-gold-light":   "#f5e9b0",   // dorado claro
        "nok-earth":        "#833b0e",   // tierra cálida (botones)
        "nok-gray":         "#6c6c6c",   // gris medio
        "nok-gray-light":   "#8b8b8b",   // gris claro
        "nok-border":       "#d4d4d4",   // bordes
        "nok-border-light": "#e9ebea",   // bordes muy suaves
        // Aliases para compatibilidad con código existente
        background:         "#f7f7f3",
        border:             "#d4d4d4",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "nok": "14px",      // radius de cards NOK
        "nok-sm": "10px",   // radius de botones NOK
        "nok-lg": "22px",   // radius grande NOK
      },
      boxShadow: {
        "nok": "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
        "nok-hover": "0 4px 12px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
