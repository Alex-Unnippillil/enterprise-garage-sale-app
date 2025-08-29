"use client";

import { useEffect, useRef } from "react";

export default function YouTubePiP() {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const createPlayer = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: "dQw4w9WgXcQ",
        events: {
          onReady: () => {
            /* no-op */
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    }
  }, []);

  const openPiP = async () => {
    if (!playerRef.current || !window.documentPictureInPicture) return;

    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 400,
      height: 80,
    });

    const doc = pipWindow.document;
    doc.body.style.margin = "0";
    doc.body.style.display = "flex";
    doc.body.style.alignItems = "center";
    doc.body.style.gap = "8px";
    doc.body.style.background = "#000";
    doc.body.style.color = "#fff";
    doc.body.style.padding = "8px";

    const playButton = doc.createElement("button");
    const backButton = doc.createElement("button");
    const fwdButton = doc.createElement("button");
    const volume = doc.createElement("input");

    playButton.textContent = "Play";
    backButton.textContent = "-10s";
    fwdButton.textContent = "+10s";

    volume.type = "range";
    volume.min = "0";
    volume.max = "100";
    volume.value = String(playerRef.current.getVolume());

    const updatePlay = () => {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playButton.textContent = "Pause";
      } else {
        playButton.textContent = "Play";
      }
    };

    playButton.addEventListener("click", () => {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    });

    backButton.addEventListener("click", () => {
      const t = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(Math.max(t - 10, 0), true);
    });

    fwdButton.addEventListener("click", () => {
      const t = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(t + 10, true);
    });

    volume.addEventListener("input", () => {
      playerRef.current.setVolume(Number(volume.value));
    });

    playerRef.current.addEventListener("onStateChange", updatePlay);
    const volInterval = setInterval(() => {
      volume.value = String(playerRef.current.getVolume());
    }, 1000);

    updatePlay();

    pipWindow.addEventListener("unload", () => {
      playerRef.current.removeEventListener("onStateChange", updatePlay);
      clearInterval(volInterval);
    });

    doc.body.append(playButton, backButton, fwdButton, volume);
  };

  return (
    <div className="space-y-2">
      <div id="youtube-player" className="aspect-video w-full max-w-xl" />
      <button onClick={openPiP}>Open PiP Controls</button>
    </div>
  );
}

