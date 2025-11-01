import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import ChatPage from "../pages/Chatpage";
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: (
          <div className="hidden md:flex items-center justify-center flex-1 text-gray-500">
            Select a chat to start messaging
          </div>
        ),
      },
      { path: "chat/:id", element: <ChatPage /> },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
