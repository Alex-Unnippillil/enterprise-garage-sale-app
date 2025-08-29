"use client";

import { useState } from "react";
import { Parser, EnhancedPacketBlock } from "pcapjs";

interface Event {
  ts: number;
  type: string;
  src: string;
  dest: string;
}

function formatMac(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
}

export default function PcapAnalyzer() {
  const [events, setEvents] = useState<Event[]>([]);

  const handleFile = async (file: File) => {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const parser = new Parser();
    const capture = await parser.parse(buffer);
    const evs: Event[] = [];
    capture.list.forEach((section) => {
      section.list.forEach((block) => {
        if (block instanceof EnhancedPacketBlock) {
          const ts = block.timestampHigh * 4294967296 + block.timestampLow;
          const frame = block.blockBytes;
          const fc = frame[0] | (frame[1] << 8);
          const type = (fc >> 2) & 0x3;
          const subtype = (fc >> 4) & 0xf;
          const src = formatMac(frame.slice(10, 16));
          const dest = formatMac(frame.slice(4, 10));
          let kind: string | null = null;
          if (type === 0) {
            if (subtype === 4) kind = "Probe Request";
            else if (subtype === 5) kind = "Probe Response";
            else if (subtype === 8) kind = "Beacon";
            else if (subtype === 11) kind = "Authentication";
          } else if (type === 2) {
            for (let i = 24; i < frame.length - 1; i++) {
              if (frame[i] === 0x88 && frame[i + 1] === 0x8e) {
                kind = "EAPOL";
                break;
              }
            }
          }
          if (kind) {
            evs.push({ ts, type: kind, src, dest });
          }
        }
      });
    });
    evs.sort((a, b) => a.ts - b.ts);
    setEvents(evs);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const apMac = events.find((e) => e.type === "Beacon")?.src;

  return (
    <div className="space-y-4">
      <input type="file" accept=".pcap,.pcapng" onChange={onChange} />
      {events.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="font-bold">Timeline</h2>
            <ul className="list-disc ml-6">
              {events
                .filter((e) =>
                  ["Probe Request", "Probe Response", "Authentication", "EAPOL"].includes(e.type)
                )
                .map((e, i) => (
                  <li key={i}>{`${e.ts} - ${e.type} ${e.src} -> ${e.dest}`}</li>
                ))}
            </ul>
          </div>
          <div>
            <h2 className="font-bold">Beacon/Probe Flow</h2>
            <svg width={400} height={40 * events.length}>
              <line x1={50} y1={0} x2={50} y2={40 * events.length} stroke="black" />
              <text x={50} y={15} textAnchor="middle">AP</text>
              <line x1={350} y1={0} x2={350} y2={40 * events.length} stroke="black" />
              <text x={350} y={15} textAnchor="middle">Client</text>
              {events
                .filter((e) => ["Beacon", "Probe Request", "Probe Response"].includes(e.type))
                .map((e, i) => {
                  const y = 40 * (i + 1);
                  const fromAp = apMac && e.src === apMac;
                  const x1 = fromAp ? 50 : 350;
                  const x2 = fromAp ? 350 : 50;
                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke="blue"
                        markerEnd="url(#arrow)"
                      />
                      <text x={(x1 + x2) / 2} y={y - 5} textAnchor="middle">
                        {e.type}
                      </text>
                    </g>
                  );
                })}
              <defs>
                <marker
                  id="arrow"
                  markerWidth="10"
                  markerHeight="10"
                  refX="10"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L0,6 L9,3 z" fill="blue" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

