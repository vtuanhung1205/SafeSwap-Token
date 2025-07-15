import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";

const DelayLink = ({ to, children, className, ...props }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(to);
    }, 3000); // 3 giây
  };

  return (
    <>
      <a href={to} className={className} onClick={handleClick} {...props}>
        {children}
      </a>
      {loading && <LoadingScreen />}
    </>
  );
};

export default DelayLink;
