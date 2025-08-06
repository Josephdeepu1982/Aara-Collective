import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  variant?: "default" | "white";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ variant = "default", className = "" }) => {
  return (
    <Link to="/" className={`inline-block ${className}`}>
      <img
        src="/Logo1.png"
        alt="Aara Collective Logo"
        className={`h-14 w-auto ${
          variant === "white" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
};

export default Logo;
