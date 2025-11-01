import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Router";
import { ThreeDot } from "react-loading-indicators";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";

const App = () => {
  const { isCheckingAuth, checkAuth, onlineUsers } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(onlineUsers);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-800 text-2xl">
        <ThreeDot variant="bounce" color="#162D3A" size="medium" />
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
