import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import AdminPanel from "./AdminPanel";
import "./index.css";

setBaseUrl(import.meta.env.BASE_URL.replace(/\/+$/, ""));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");
const isAdminRoute = window.location.pathname === `${basePath}/admin` || window.location.pathname === `${basePath}/admin/`;

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    {isAdminRoute ? <AdminPanel /> : <App />}
  </QueryClientProvider>,
);
