"use client";

import StoreProvider from "@/state/redux";
import { Authenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/auth-provider";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { addTask } from "@/lib/opfs-tasks";

const Providers = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
      navigator.serviceWorker.addEventListener("message", async (event) => {
        if (event.data?.action === "share") {
          const { text, fileName, fileData } = event.data;
          let file: File | undefined;
          if (fileData && fileName) {
            const bytes = new Uint8Array(fileData);
            file = new File([bytes], fileName);
          }
          await addTask({ text: text || fileName || "", file });
        }
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>
        <Authenticator.Provider>
          <Auth>{children}</Auth>
        </Authenticator.Provider>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default Providers;
