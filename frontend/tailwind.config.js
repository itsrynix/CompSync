/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#0f1117',
          surface: '#181b24',
          card: '#202430',
          border: '#2e3444',
          accent: '#6366f1',
          ae: '#9999ff',
        }
      }
    },
  },
  plugins: [],
}
