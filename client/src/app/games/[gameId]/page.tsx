"use client";

import { useEffect } from "react";
import { loadGamepadProfile } from "@/lib/gamepad";

export default function GamePage({ params }: { params: { gameId: string } }) {
  useEffect(() => {
    loadGamepadProfile(params.gameId).then((profile) => {
      console.log("Loaded profile", profile);
    });
  }, [params.gameId]);

  return <div className="p-4">Launching game {params.gameId}...</div>;
}
