import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// Official X (Twitter) timeline component with profile/list toggle
export interface TimelineProps {
  /** Twitter/X profile screen name (without @) */
  profile?: string;
  /** Twitter/X list identifier */
  list?: {
    /** Numeric list id */
    id: string;
  };
}

type Mode = "profile" | "list";

declare global {
  interface Window {
    twttr?: any;
  }
}

const loadScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.twttr) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};

const Timeline = ({ profile, list }: TimelineProps) => {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("profile");
  const profileRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const renderTimelines = () => {
    const theme = resolvedTheme === "dark" ? "dark" : "light";
    if (profileRef.current) {
      profileRef.current.innerHTML = "";
      if (profile) {
        window.twttr?.widgets.createTimeline(
          { sourceType: "profile", screenName: profile },
          profileRef.current,
          { theme }
        );
      }
    }
    if (listRef.current) {
      listRef.current.innerHTML = "";
      if (list?.id) {
        window.twttr?.widgets.createTimeline(
          { sourceType: "list", id: list.id },
          listRef.current,
          { theme }
        );
      }
    }
  };

  useEffect(() => {
    loadScript().then(renderTimelines);
  }, [resolvedTheme, profile, list]);

  const hasProfile = Boolean(profile);
  const hasList = Boolean(list?.id);
  const showProfile = mode === "profile" && hasProfile;
  const showList = mode === "list" && hasList;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded ${mode === "profile" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => setMode("profile")}
        >
          Profile
        </button>
        <button
          className={`px-3 py-1 rounded ${mode === "list" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          onClick={() => setMode("list")}
        >
          List
        </button>
      </div>
      {showProfile && <div ref={profileRef} />}
      {showList && <div ref={listRef} />}
      {!showProfile && mode === "profile" && (
        <p className="text-sm text-muted-foreground">No profile timeline to display.</p>
      )}
      {!showList && mode === "list" && (
        <p className="text-sm text-muted-foreground">No list timeline to display.</p>
      )}
    </div>
  );
};

export default Timeline;
