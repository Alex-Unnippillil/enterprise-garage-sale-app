"use client";

import { useEffect, useState } from "react";
import { GamepadProfile, saveGamepadProfile, loadGamepadProfile } from "@/lib/gamepad";

export default function GamepadMappingPage() {
  const [gamepad, setGamepad] = useState<Gamepad | null>(null);
  const [gameId, setGameId] = useState("default");
  const [profile, setProfile] = useState<GamepadProfile>({ buttons: {}, axes: {} });

  useEffect(() => {
    const update = () => {
      const pads = navigator.getGamepads?.();
      for (const gp of pads) {
        if (gp) {
          setGamepad(gp);
          break;
        }
      }
    };
    window.addEventListener("gamepadconnected", update);
    window.addEventListener("gamepaddisconnected", update);
    update();
    return () => {
      window.removeEventListener("gamepadconnected", update);
      window.removeEventListener("gamepaddisconnected", update);
    };
  }, []);

  useEffect(() => {
    loadGamepadProfile(gameId).then((p) => {
      if (p) setProfile(p);
    });
  }, [gameId]);

  const handleSave = async () => {
    await saveGamepadProfile(gameId, profile);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Gamepad Mapping</h1>
      <label className="block">
        <span className="mr-2">Game ID:</span>
        <input
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="border px-2 py-1"
        />
      </label>
      {gamepad ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Buttons</h2>
            {gamepad.buttons.map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 my-1">
                <span className="w-24">Button {idx}</span>
                <input
                  value={profile.buttons[idx] || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      buttons: { ...prev.buttons, [idx]: e.target.value },
                    }))
                  }
                  className="border px-2 py-1 flex-1"
                />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Axes</h2>
            {gamepad.axes.map((_, idx) => (
              <div key={idx} className="flex items-center gap-2 my-1">
                <span className="w-24">Axis {idx}</span>
                <input
                  value={profile.axes[idx] || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      axes: { ...prev.axes, [idx]: e.target.value },
                    }))
                  }
                  className="border px-2 py-1 flex-1"
                />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white">
            Save Profile
          </button>
        </div>
      ) : (
        <p>No gamepad detected.</p>
      )}
    </div>
  );
}
