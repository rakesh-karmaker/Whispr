import type React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/login";
import ProfileSelect from "@/pages/profileSelect";
import AuthLayout from "@/layouts/auth";

interface Route {
  path: string;
  element: React.ReactNode;
  children?: Route[];
}

const routes: Route[] = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/profile-select",
    element: <ProfileSelect />,
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "/auth/register",
        element: <Login />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
