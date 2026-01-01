import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "default",
  ...props
}) => {
  const base =
    "px-5 py-2.5 rounded-full font-bold transition flex items-center justify-center gap-2";

  const variants = {
    default: "bg-black text-white hover:bg-gray-800",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-black hover:border-black bg-white",
  };

  const style = variants[variant] || variants.default;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${style} ${className}`}
      {...props}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
