import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // Azul suave (Indigo 600)
        secondary: '#F3F4F6',  // Cinzento claro
        'text-main': '#111827', // Cinzento escuro
        'text-light': '#6B7280', // Cinzento para texto secundário
        action: '#10B981',      // Verde
        error: '#EF4444',       // Vermelho suave
        'base-100': '#FFFFFF',  // Fundo principal (branco)
        'base-200': '#F9FAFB',  // Fundo ligeiramente mais escuro
      },
    },
  },
  plugins: [],
};
export default config;