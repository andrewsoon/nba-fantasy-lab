"use client";
import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "solid" | "outlined"; // solid = colored, outlined = no background
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "solid",
  className = "",
  ...props
}) => {
  const baseClasses = `
    px-4 py-2 font-medium transition-colors duration-150
    cursor-pointer
  `;

  const variantClasses =
    variant === "solid"
      ? "bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-400"
      : "border border-zinc-700 text-zinc-700 rounded-md hover:bg-zinc-100 dark:border-zinc-300 dark:text-zinc-300 dark:hover:bg-zinc-700";

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
