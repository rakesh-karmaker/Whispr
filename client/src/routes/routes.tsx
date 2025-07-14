import type React from "react";
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "@/components/ui/Loader/Loader";
import AuthProfile from "@/pages/auth/profile";
import ForgotPassword from "@/pages/auth/forgotPasword";

const Login = lazy(() => import("@/pages/auth/login"));
const Register = lazy(() => import("@/pages/auth/register"));
const AuthPageLayout = lazy(() => import("@/layouts/authPageLayout"));

const ChatLayout = lazy(() => import("@/layouts/chatLayout"));
const Chat = lazy(() => import("@/pages/chat/chat"));
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
    path: "/chat",
    element: (
      <Suspense fallback={<Loader />}>
        <ChatLayout />
      </Suspense>
    ),
    children: [
      {
        path: "/chat",
        element: (
          <Suspense fallback={<Loader />}>
            <Chat />
          </Suspense>
        ),
      },
    ],
  },

  {
    path: "/auth",
    element: <AuthPageLayout />,
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
