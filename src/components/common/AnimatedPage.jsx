import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0.8,
    y: 15,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0.8,
    y: -15,
  },
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}>
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
