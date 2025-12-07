// src/theme/typography.js

const typography = {
  fontFamily: [
    '"Public Sans"',
    'sans-serif',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
  ].join(','),
  h1: {
    fontWeight: 700,
    fontSize: '3.5rem',
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 700,
    fontSize: '3rem',
    lineHeight: 1.2,
  },
  h3: {
    fontWeight: 700,
    fontSize: '2.25rem',
    lineHeight: 1.2,
  },
  h4: {
    fontWeight: 700,
    fontSize: '1.75rem',
    lineHeight: 1.2,
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.2,
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.1rem',
    lineHeight: 1.2,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
  },
  button: {
    textTransform: 'none', // Keep button text as is (e.g., "Add to Cart" instead of "ADD TO CART")
    fontWeight: 600,
  },
};

export default typography;
