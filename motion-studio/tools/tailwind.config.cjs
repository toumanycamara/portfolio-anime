// Même configuration que celle embarquée dans les pages PHP d'origine (couleurs + Inter).
module.exports = {
  content: [process.env.DEMO + '/app/pages/*.php', process.env.DEMO + '/includes/*.php'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: { primary: '#e11d2a', ink: '#141414', muted: '#5f5e5e', page: '#f4f4f5', primarydark: '#8f1119' },
    },
  },
};
