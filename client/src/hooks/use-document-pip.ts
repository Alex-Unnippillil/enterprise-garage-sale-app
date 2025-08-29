import { useCallback, useRef, useEffect } from "react";

export function useDocumentPiP() {
  const pipWindowRef = useRef<Window | null>(null);
  const appRootRef = useRef<HTMLElement | null>(null);

  const openPiP = useCallback(async () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.focus();
      return;
    }

    const api = (window as any).documentPictureInPicture;
    if (!api || typeof api.requestWindow !== "function") {
      return;
    }

    const pipWindow: Window = await api.requestWindow();
    pipWindowRef.current = pipWindow;

    appRootRef.current = document.getElementById("__next");
    if (appRootRef.current) {
      pipWindow.document.body.append(appRootRef.current);
    }

    const handleClose = () => {
      if (appRootRef.current) {
        document.body.append(appRootRef.current);
      }
      pipWindow.removeEventListener("pagehide", handleClose);
      pipWindow.removeEventListener("focus", handleFocus);
      pipWindowRef.current = null;
    };

    const handleFocus = () => {
      window.focus();
    };

    pipWindow.addEventListener("pagehide", handleClose);
    pipWindow.addEventListener("focus", handleFocus);
  }, []);

  const closePiP = useCallback(() => {
    pipWindowRef.current?.close();
  }, []);

  const togglePiP = useCallback(() => {
    if (pipWindowRef.current) {
      closePiP();
    } else {
      openPiP();
    }
  }, [openPiP, closePiP]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }
      if (appRootRef.current) {
        document.body.append(appRootRef.current);
      }
    };
  }, []);

  return { pipWindow: pipWindowRef.current, openPiP, closePiP, togglePiP };
}

export default useDocumentPiP;
