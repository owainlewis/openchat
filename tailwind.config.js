/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent-color)',
        // ChatGPT-style dark theme colors
        dark: {
          bg: '#212121',
          'bg-secondary': '#2f2f2f',
          'bg-tertiary': '#424242',
          border: '#424242',
          'border-subtle': '#303030',
        },
      },
    },
  },
  plugins: [],
}
