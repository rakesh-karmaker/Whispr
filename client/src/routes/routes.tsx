import type React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";

interface Route {
  path: string;
  element: React.ReactNode;
}

const routes: Route[] = [
  {
    path: "/",
    element: <App />,
  },
];

const router = createBrowserRouter(routes);

export default router;
