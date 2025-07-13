import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "@/routes/routes.tsx";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthLayout } from "./layouts/authLayout";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthLayout>
      <RouterProvider router={router} />
    </AuthLayout>
  </QueryClientProvider>
);
