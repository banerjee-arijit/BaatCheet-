import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDot } from "react-loading-indicators";

const LoadingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen  text-gray-800 text-2xl">
      <ThreeDot variant="bounce" color="#162D3A" size="medium" />
    </div>
  );
};

export default LoadingPage;
