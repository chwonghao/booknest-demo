import React from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const StaggeredItem = ({ children }) => {
  return <motion.div variants={itemVariants}>{children}</motion.div>;
};

export default StaggeredItem;
