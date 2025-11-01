import React, { useState } from "react";
import loginImage from "../asserts/Rectangle.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "./../store/useAuthStore";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData, navigate);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full max-w-6xl items-center justify-between gap-10 md:gap-8">
        <div className="flex flex-col justify-center w-full md:w-1/2 text-center md:text-left">
          <div className="mb-8 mt-60 md:mt-0">
            <h1 className="text-[28px] sm:text-[32px] md:text-[36px] font-semibold text-[#0C1421] leading-[110%] tracking-[0.36px]">
              Welcome Back
            </h1>
            <p className="text-[#313957] text-[16px] sm:text-[17px] md:text-[18px] leading-[160%] tracking-[0.2px] mt-4 mx-auto md:mx-0 w-[90%] md:w-[80%]">
              Today is a new day — it’s your day. Shape it your way and start
              managing your projects efficiently.
            </p>
          </div>

          <form className="space-y-6 mt-4 md:mt-0">
            <div>
              <label className="block mb-2 text-gray-700 font-medium text-left">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange(e)}
                name="email"
                placeholder="Enter your email"
                disabled={isLoading}
                className="w-full md:w-[90%] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1421] transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium text-left">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => onChange(e)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full md:w-[90%] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1421] transition"
              />
            </div>

            <div className="flex justify-between items-center w-full md:w-[90%]">
              <a
                href="#"
                className="text-sm text-[#0C1421] hover:underline font-medium"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full md:w-[90%] bg-[#0C1421] text-white py-3 rounded-xl text-lg font-semibold hover:bg-[#162D3A] transition duration-300 shadow-sm"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link
                to={"/signup"}
                className="text-[#0C1421] font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center mt-10 md:mt-0">
          <img
            src={loginImage}
            alt="Login Illustration"
            className=" w-[70%] md:w-[95%] md:ml-32  h-auto rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
