import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { router } from "@/routes";
import { tryRestoreSession } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { BrandHead } from "@/components/layout/BrandHead";

function App() {
  useEffect(() => {
    tryRestoreSession();
  }, []);
  useAdminRealtime();

  return (
    <QueryClientProvider client={queryClient}>
      <BrandHead />
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}

export default App;
