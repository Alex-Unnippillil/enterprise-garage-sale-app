"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify: any;
  }
}

interface PlayerProps {
  /** Spotify access token with streaming scopes */
  token?: string;
  /** Full iframe embed URL such as https://open.spotify.com/embed/track/... */
  embedUrl: string;
}

const Player: React.FC<PlayerProps> = ({ token = "", embedUrl }) => {
  const [useSdk, setUseSdk] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Determine if the provided token belongs to a Premium account
  useEffect(() => {
    if (!token) return;
    const checkPremium = async () => {
      try {
        const res = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIsPremium(data?.product === "premium");
      } catch {
        setIsPremium(false);
      }
    };
    checkPremium();
  }, [token]);

  // Initialize Web Playback SDK when toggled on
  useEffect(() => {
    if (!useSdk || !isPremium || !token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    let player: any;

    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({
        name: "Web Playback SDK Player",
        getOAuthToken: (cb: (t: string) => void) => cb(token),
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
      });

      player.connect();
    };

    return () => {
      player?.disconnect();
      document.body.removeChild(script);
    };
  }, [useSdk, isPremium, token]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="sdk-toggle" className="text-sm">
          Use Web Playback SDK
        </label>
        <Switch
          id="sdk-toggle"
          checked={useSdk}
          onCheckedChange={(checked) => setUseSdk(checked)}
          disabled={!isPremium}
        />
      </div>
      {useSdk && isPremium ? (
        <div className="rounded border p-4">
          <p>
            Web Playback SDK active
            {deviceId ? ` (Device: ${deviceId})` : ""}
          </p>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          width="100%"
          height="352"
          allow="encrypted-media"
        />
      )}
    </div>
  );
};

export default Player;

