// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust according to your project's structure
    "./node_modules/daisyui/dist/**/*.js" // Include DaisyUI's path
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
