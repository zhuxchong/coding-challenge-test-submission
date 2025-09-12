import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import $ from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={`${$.error} ${className || ''}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorMessage;