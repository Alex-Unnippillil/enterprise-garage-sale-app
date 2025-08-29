"use client";

import { useEffect, useRef, useState } from "react";
import type { Result } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected?: (value: string) => void;
}

const BarcodeScanner = ({ onDetected }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let reader: any;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        if ("BarcodeDetector" in window) {
          const formats = ["qr_code", "ean_13", "code_128", "upc_a", "ean_8"];
          // @ts-ignore
          const detector = new BarcodeDetector({ formats });

          const scan = async () => {
            if (!videoRef.current) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                onDetected?.(barcodes[0].rawValue);
              }
            } catch {
              /* ignore */
            }
            requestAnimationFrame(scan);
          };

          requestAnimationFrame(scan);
        } else {
          const { BrowserMultiFormatReader } = await import("@zxing/browser");
          reader = new BrowserMultiFormatReader();
          const devices = await BrowserMultiFormatReader.listVideoInputDevices();
          const firstDeviceId = devices[0]?.deviceId;

          await reader.decodeFromVideoDevice(
            firstDeviceId,
            videoRef.current!,
            (result: Result | undefined) => {
              if (result) {
                onDetected?.(result.getText());
              }
            }
          );
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    start();

    return () => {
      if (reader && typeof reader.reset === "function") {
        reader.reset();
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onDetected]);

  return (
    <div className="w-full">
      <video ref={videoRef} className="h-auto w-full" />
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default BarcodeScanner;

