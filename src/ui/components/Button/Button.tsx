import { ButtonType, ButtonVariant } from "@/types";
import React, { FunctionComponent } from "react";
import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";

import $ from "./Button.module.css";

interface ButtonProps {
  onClick?: () => void;
  type?: ButtonType;
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading,
}) => {
  return (
    <button
      // TODO: Add conditional classNames
      // - Must have a condition to set the '.primary' className
      // - Must have a condition to set the '.secondary' className
      // - Display loading spinner per demo video. NOTE: add data-testid="loading-spinner" for spinner element (used for grading)
      className={cx($.button, {
        [$.primary]: variant === "primary",
        [$.secondary]: variant === "secondary",
      })}
      type={type}
      onClick={onClick}
      disabled={loading}
    >
      <motion.span
        className={$.spinner}
        data-testid="loading-spinner"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: loading ? 1 : 0,
          scale: loading ? 1 : 0.8,
          rotate: loading ? 360 : 0,
        }}
        transition={{
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
          rotate: {
            duration: 0.6,
            repeat: loading ? Infinity : 0,
            ease: "linear",
          },
        }}
        style={{
          display: loading ? "inline-block" : "none",
          width: loading ? "1em" : 0,
          height: loading ? "1em" : 0,
          marginRight: loading ? "0.5em" : 0,
        }}
      />
      {children}
    </button>
  );
};

export default Button;
