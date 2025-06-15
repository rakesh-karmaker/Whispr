import type React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/login";
import ProfileSelect from "@/pages/profileSelect";

interface Route {
  path: string;
  element: React.ReactNode;
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
];

const router = createBrowserRouter(routes);

export default router;
