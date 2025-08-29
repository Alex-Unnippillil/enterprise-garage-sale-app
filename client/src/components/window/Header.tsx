import { Pin } from "lucide-react";
import { useDocumentPiP } from "@/hooks/use-document-pip";
import React from "react";

const WindowHeader = () => {
  const { togglePiP } = useDocumentPiP();

  return (
    <div className="flex justify-end p-2 border-b bg-white">
      <button
        aria-label="Pin window"
        onClick={togglePiP}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Pin className="h-4 w-4" />
      </button>
    </div>
  );
};

export default WindowHeader;
