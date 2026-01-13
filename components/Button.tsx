"use client";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "solid" | "outlined" | "text";
  size?: "xs" | "normal";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "solid",
  size = "normal",
  className = "",
  ...props
}) => {
  // Base padding + transition
  const sizeClasses = size === "normal"
    ? "px-4 py-2 text-base md:text-base"
    : "px-2 py-1 text-xs md:text-sm";

  // Variant styles
  const variantClasses = {
    solid: "bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-400",
    outlined: "border border-zinc-700 text-zinc-700 rounded-md hover:bg-zinc-100 dark:border-zinc-300 dark:text-zinc-300 dark:hover:bg-zinc-700",
    text: "text-zinc-700 dark:text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-400",
  }[variant];

  const baseClasses = `transition-colors duration-150 cursor-pointer ${sizeClasses} ${variantClasses} ${className}`;

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
