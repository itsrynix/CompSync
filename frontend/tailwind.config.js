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
          bg: '#16191e',          // Soft dark charcoal background
          surface: '#1f242c',     // GitHub Desktop top/panel background
          sidebar: '#1a1e24',     // Subdued left panel
          card: '#242932',        // Soft item cards/buttons
          cardHover: '#2b313c',   // Subtle hover state
          border: 'rgba(255, 255, 255, 0.08)',       // Very subtle border
          borderSubtle: 'rgba(255, 255, 255, 0.04)', // Minimal border
          borderHover: 'rgba(255, 255, 255, 0.16)',  // Hover border
          text: {
            primary: '#e6edf3',   // Soft white for text
            secondary: '#8b949e', // Muted text
            muted: '#6e7681',     // Very muted caption text
          },
          blue: {
            DEFAULT: '#1f6feb',
            hover: '#388bfd',
            light: '#58a6ff',
            subtle: 'rgba(31, 111, 235, 0.12)',
            border: 'rgba(56, 139, 253, 0.25)',
          },
          green: {
            DEFAULT: '#238636',
            hover: '#2ea043',
            subtle: 'rgba(35, 134, 54, 0.12)',
            border: 'rgba(46, 160, 67, 0.25)',
            text: '#3fb950',
          },
          red: {
            DEFAULT: '#da3633',
            subtle: 'rgba(218, 54, 51, 0.12)',
            border: 'rgba(248, 81, 73, 0.25)',
            text: '#f85149',
          },
        }
      }
    },
  },
  plugins: [],
}
