import type React from "react";
import { createBrowserRouter } from "react-router-dom";
// import App from "@/App";
// import Login from "@/pages/auth/login";
// import ProfileSelect from "@/pages/profileSelect";
// import AuthLayout from "@/layouts/auth";
// import Register from "@/pages/auth/register";
import { lazy, Suspense } from "react";
import Loader from "@/components/ui/Loader/Loader";
import AuthProfile from "@/pages/auth/profile";
import ForgotPassword from "@/pages/auth/forgotPasword";

const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const ProfileSelect = lazy(() => import("@/pages/profileSelect"));
const AuthLayout = lazy(() => import("@/layouts/auth"));
const App = lazy(() => import("@/App"));

interface Route {
  path: string;
  element: React.ReactNode;
  children?: Route[];
}

const routes: Route[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<Loader />}>
        <App />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/profile-select",
    element: (
      <Suspense fallback={<Loader />}>
        <ProfileSelect />
      </Suspense>
    ),
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "/auth/register",
        element: (
          <Suspense fallback={<Loader />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "/auth/login",
        element: (
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/auth/profile",
        element: (
          <Suspense fallback={<Loader />}>
            <AuthProfile />
          </Suspense>
        ),
      },
      {
        path: "/auth/forgot-password",
        element: (
          <Suspense fallback={<Loader />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default router;
