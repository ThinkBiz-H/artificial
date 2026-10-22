import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { router } from "@/routes";
import { tryRestoreSession } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

function App() {
  useEffect(() => {
    tryRestoreSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-center"
        closeButton
        duration={3500}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              "flex w-[min(92vw,380px)] items-center gap-3 rounded-pill bg-surface-raised px-5 py-3.5 font-sans text-sm text-fg-inverse shadow-lift",
            title: "font-medium",
            description: "text-xs text-fg-inverse/70",
            icon: "flex-none",
            success: "[&_[data-icon]]:text-accent-light",
            error: "[&_[data-icon]]:text-danger-soft",
            info: "[&_[data-icon]]:text-accent-light",
            actionButton:
              "ml-auto flex-none rounded-pill bg-surface px-4 py-1.5 text-label font-medium uppercase tracking-label text-fg transition-colors hover:bg-surface-muted",
            closeButton: "!left-auto !right-1 !top-1/2 !-translate-y-1/2 !border-0 !bg-transparent text-fg-inverse/60 hover:!text-fg-inverse",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
