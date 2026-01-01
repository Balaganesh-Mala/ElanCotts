import React from "react";

const Input = ({
  type = "text",
  name = "",
  value = "",
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full bg-gray-100 border px-4 py-2 rounded-full text-sm outline-none focus:border-black transition ${className}`}
      {...props}
    />
  );
};

export default Input;
