import React, { useEffect, useRef, useState } from "react";

interface Props {
  videoId: string;
}

const rates = [0.25, 0.5, 1, 1.5, 2];

const YouTubePlayer: React.FC<Props> = ({ videoId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [theater, setTheater] = useState(false);

  // load youtube api
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setupPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current!, {
        videoId,
        events: {
          onReady: (e: any) => {
            setPlaybackRate(e.target.getPlaybackRate());
          },
          onStateChange: (e: any) => {
            setPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
          onPlaybackRateChange: (e: any) => {
            setPlaybackRate(e.target.getPlaybackRate());
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      window.onYouTubeIframeAPIReady = setupPlayer;
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const changeSpeed = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseFloat(e.target.value);
    playerRef.current?.setPlaybackRate(rate);
    setPlaybackRate(rate);
  };

  const handleKey = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
    switch (e.key) {
      case "k":
        togglePlay();
        break;
      case "t":
        setTheater((v) => !v);
        break;
      case ",":
        setPlaybackRate((r) => {
          const idx = Math.max(0, rates.indexOf(r) - 1);
          const newRate = rates[idx];
          playerRef.current?.setPlaybackRate(newRate);
          return newRate;
        });
        break;
      case ".":
        setPlaybackRate((r) => {
          const idx = Math.min(rates.length - 1, rates.indexOf(r) + 1);
          const newRate = rates[idx];
          playerRef.current?.setPlaybackRate(newRate);
          return newRate;
        });
        break;
      case "l":
        setLoopStart(playerRef.current?.getCurrentTime());
        break;
      case "o":
        setLoopEnd(playerRef.current?.getCurrentTime());
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // loop check
  useEffect(() => {
    if (!playerRef.current) return;
    if (loopStart == null || loopEnd == null) return;
    const id = setInterval(() => {
      const t = playerRef.current.getCurrentTime();
      if (t >= loopEnd) {
        playerRef.current.seekTo(loopStart);
      }
    }, 250);
    return () => clearInterval(id);
  }, [loopStart, loopEnd]);

  return (
    <div className={theater ? "fixed inset-0 z-50 bg-black flex flex-col items-center justify-center" : ""}>
      <div className="w-full max-w-3xl mx-auto">
        <div ref={containerRef} className="w-full aspect-video" />
        <div className="flex gap-2 mt-2 items-center">
          <button onClick={togglePlay} aria-label="play-pause">{playing ? "Pause" : "Play"}</button>
          <select aria-label="speed" value={playbackRate} onChange={changeSpeed}>
            {rates.map((r) => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>
          <button onClick={() => setLoopStart(playerRef.current?.getCurrentTime())} aria-label="set-start">Set A</button>
          <button onClick={() => setLoopEnd(playerRef.current?.getCurrentTime())} aria-label="set-end">Set B</button>
          <button onClick={() => setTheater((v) => !v)} aria-label="theater">{theater ? "Exit Theater" : "Theater"}</button>
        </div>
        {loopStart != null && loopEnd != null && (
          <div className="text-sm mt-1">Looping {loopStart.toFixed(1)}s - {loopEnd.toFixed(1)}s</div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer;
