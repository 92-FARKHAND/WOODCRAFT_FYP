"use client";

import { SessionProvider } from "next-auth/react";
import ReduxProvider from "./providers/ReduxProvider";
import { Toaster } from "react-hot-toast";

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ReduxProvider>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </ReduxProvider>
    </SessionProvider>
  );
}
