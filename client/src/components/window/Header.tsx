"use client";

import React from "react";
import { Pin } from "lucide-react";
import useDocumentPiP from "@/hooks/use-document-pip";

const Header = () => {
  const { open } = useDocumentPiP();

  return (
    <div className="flex items-center justify-end border-b p-2">
      <button
        type="button"
        onClick={open}
        aria-label="Pin window"
        className="rounded p-1 hover:bg-muted"
      >
        <Pin className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Header;
