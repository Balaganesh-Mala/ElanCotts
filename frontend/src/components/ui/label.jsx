import React from "react";

const Label = ({ children, className = "", htmlFor = "", ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-semibold text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
