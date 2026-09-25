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
          bg: '#0d1117',
          surface: '#161b22',
          card: '#21262d',
          border: '#30363d',
          borderHover: '#484f58',
          accent: '#2563eb',
          blue: {
            DEFAULT: '#2563eb',
            hover: '#1d4ed8',
            light: '#3b82f6',
            subtle: 'rgba(37, 99, 235, 0.12)',
            border: 'rgba(59, 130, 246, 0.35)',
          },
          green: {
            DEFAULT: '#238636',
            subtle: 'rgba(46, 160, 67, 0.15)',
            border: 'rgba(46, 160, 67, 0.35)',
            text: '#3fb950',
          },
          red: {
            DEFAULT: '#da3633',
            subtle: 'rgba(248, 81, 73, 0.15)',
            border: 'rgba(248, 81, 73, 0.35)',
            text: '#f85149',
          },
        }
      }
    },
  },
  plugins: [],
}
