import { useCallback, useState } from "react";

/**
 * Hook to open the current document in a Picture-in-Picture window.
 * Moves the app's body content into the PiP window and returns it when closed.
 * Also syncs focus events between the PiP window and the main window.
 */
export function useDocumentPiP() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const open = useCallback(async () => {
    if (pipWindow || typeof window === "undefined") return;
    // Document Picture-in-Picture is experimental and not typed in TS yet.
    const dpip = (window as any).documentPictureInPicture;
    if (!dpip?.requestWindow) return;

    const pip = await dpip.requestWindow();
    const elements = Array.from(document.body.children);
    elements.forEach((el) => pip.document.body.appendChild(el));

    pip.addEventListener(
      "pagehide",
      () => {
        elements.forEach((el) => document.body.appendChild(el));
        setPipWindow(null);
      },
      { once: true }
    );

    pip.addEventListener("focus", () => window.focus());
    setPipWindow(pip);
  }, [pipWindow]);

  return { pipWindow, open };
}

export default useDocumentPiP;
