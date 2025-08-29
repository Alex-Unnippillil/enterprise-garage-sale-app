"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import BarcodeScanner from "@/components/barcode-scanner";

const ScanPage = () => {
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="h-full w-full">
      <Navbar />
      <main className="flex flex-col items-center p-4">
        <BarcodeScanner onDetected={setResult} />
        {result && <p className="mt-4 font-bold">{result}</p>}
      </main>
    </div>
  );
};

export default ScanPage;

