"use client";
import React, { useEffect, useRef, useState } from "react";

interface CompactGaugeProps {
  /**
   * Function returning current value for the gauge (0-100)
   */
  getValue: () => number;
}

interface DocumentPictureInPicture {
  requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>;
}

declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

/**
 * Compact gauge component that updates its value every <200ms
 * and can be pinned into a Document Picture-in-Picture window.
 */
export const CompactGauge: React.FC<CompactGaugeProps> = ({ getValue }) => {
  const [value, setValue] = useState<number>(getValue());
  const [pinned, setPinned] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);

  // Update gauge value at a 200ms interval
  useEffect(() => {
    const id = setInterval(() => {
      const v = getValue();
      setValue(v);
      // Reflect updates inside PiP window if open
      if (pipWindowRef.current) {
        const doc = pipWindowRef.current.document;
        const valueEl = doc.getElementById("pip-gauge-value") as HTMLSpanElement | null;
        const progressEl = doc.getElementById("pip-gauge-progress") as HTMLProgressElement | null;
        if (valueEl) valueEl.textContent = v.toFixed(0);
        if (progressEl) progressEl.value = v;
      }
    }, 200);
    return () => clearInterval(id);
  }, [getValue]);

  const handlePiPClose = () => {
    pipWindowRef.current = null;
    setPinned(false);
  };

  // Open Document Picture-in-Picture window
  const openPiP = async () => {
    if (pipWindowRef.current || !window.documentPictureInPicture) return;
    const pip = await window.documentPictureInPicture.requestWindow({ width: 160, height: 96 });
    pip.document.write(
      `<html><body style="margin:0;display:flex;align-items:center;justify-content:center;font-family:sans-serif;background:#fff;">
        <div><progress id="pip-gauge-progress" max="100" value="${value}" style="width:100px;height:6px"></progress>
        <div style="text-align:center;font-size:12px"><span id="pip-gauge-value">${value.toFixed(0)}</span></div></div>
       </body></html>`
    );
    pip.document.close();
    pip.addEventListener("pagehide", handlePiPClose);
    pipWindowRef.current = pip;
    setPinned(true);
  };

  // Close PiP window
  const closePiP = () => {
    if (pipWindowRef.current) {
      pipWindowRef.current.removeEventListener("pagehide", handlePiPClose);
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
    setPinned(false);
  };

  // Ensure PiP window is closed on unmount
  useEffect(() => {
    return () => closePiP();
  }, []);

  return (
    <div className="compact-gauge flex items-center space-x-2">
      <progress max={100} value={value} className="h-2 w-24" aria-label="gauge" />
      <span className="text-sm">{value.toFixed(0)}</span>
      {"documentPictureInPicture" in window && (
        <button
          onClick={pinned ? closePiP : openPiP}
          aria-label="pin to pip"
          className="ml-2 text-xs px-2 py-1 border rounded"
        >
          {pinned ? "Unpin" : "Pin"}
        </button>
      )}
    </div>
  );
};

export default CompactGauge;
