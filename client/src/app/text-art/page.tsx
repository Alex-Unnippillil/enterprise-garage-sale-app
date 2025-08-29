"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import figlet from "figlet";
import {
  styleFromSearchParams,
  styleToSearchParams
} from "@/lib/style-url";

export default function TextArtPage() {
  const router = useRouter();
  const search = useSearchParams();
  const initial = styleFromSearchParams(new URLSearchParams(search.toString()));

  const [text, setText] = useState(initial.text || "Hello");
  const [font, setFont] = useState(initial.font);
  const [startColor, setStartColor] = useState(initial.sc);
  const [endColor, setEndColor] = useState(initial.ec);
  const [kerning, setKerning] = useState(initial.k);
  const [ascii, setAscii] = useState("");

  useEffect(() => {
    figlet.text(text, { font }, (err, data) => {
      if (!err && data) {
        setAscii(data);
      }
    });
  }, [text, font]);

  useEffect(() => {
    const qs = styleToSearchParams({
      text,
      font,
      sc: startColor,
      ec: endColor,
      k: kerning,
    });
    router.replace(`/text-art?${qs}`, { scroll: false });
  }, [text, font, startColor, endColor, kerning, router]);

  const handleFontFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    const name = file.name.replace(/\.flf$/i, "");
    figlet.parseFont(name, content);
    setFont(name);
  };

  return (
    <div className="p-6 space-y-4">
      <input
        className="border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Text"
      />
      <input type="file" accept=".flf" onChange={handleFontFile} />
      <div className="flex items-center gap-2">
        <label>Start</label>
        <input
          type="color"
          value={startColor}
          onChange={(e) => setStartColor(e.target.value)}
        />
        <label>End</label>
        <input
          type="color"
          value={endColor}
          onChange={(e) => setEndColor(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <label>Kerning</label>
        <input
          type="range"
          min="-5"
          max="20"
          value={kerning}
          onChange={(e) => setKerning(parseInt(e.target.value))}
        />
      </div>
      <pre
        style={{
          whiteSpace: "pre",
          background: `linear-gradient(to right, ${startColor}, ${endColor})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: `${kerning}px`,
        }}
      >
        {ascii}
      </pre>
    </div>
  );
}
