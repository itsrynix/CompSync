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
          bg: 'var(--studio-bg)',
          surface: 'var(--studio-surface)',
          sidebar: 'var(--studio-sidebar)',
          card: 'var(--studio-card)',
          cardHover: 'var(--studio-card-hover)',
          border: 'var(--studio-border)',
          borderSubtle: 'var(--studio-border-subtle)',
          borderHover: 'var(--studio-border-hover)',
          text: {
            primary: 'var(--studio-text-primary)',
            secondary: 'var(--studio-text-secondary)',
            muted: 'var(--studio-text-muted)',
          },
          blue: {
            DEFAULT: 'var(--studio-blue)',
            hover: 'var(--studio-blue-hover)',
            light: 'var(--studio-blue-light)',
            subtle: 'var(--studio-blue-subtle)',
            border: 'var(--studio-blue-border)',
          },
          green: {
            DEFAULT: '#238636',
            hover: '#2ea043',
            subtle: 'rgba(35, 134, 54, 0.14)',
            border: 'rgba(46, 160, 67, 0.28)',
            text: '#3fb950',
          },
          red: {
            DEFAULT: '#da3633',
            subtle: 'rgba(218, 54, 51, 0.14)',
            border: 'rgba(248, 81, 73, 0.28)',
            text: '#f85149',
          },
        }
      }
    },
  },
  plugins: [],
}
