"use client";

import { useState } from "react";
import WiresharkFilterSelect from "@/components/wireshark-filter-select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Packet {
  id: number;
  protocol: string;
  info: string;
  filter: string;
}

const packets: Packet[] = [
  { id: 1, protocol: "HTTP", info: "GET /index.html", filter: "http" },
  { id: 2, protocol: "TCP", info: "SYN", filter: "tcp" },
  { id: 3, protocol: "UDP", info: "DNS Query", filter: "udp" },
  { id: 4, protocol: "TCP", info: "ACK", filter: "tcp" },
];

export default function PacketPage() {
  const [filter, setFilter] = useState("");
  const filtered = packets.filter(
    (p) => !filter || p.filter.includes(filter)
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Enter filter expression"
          className="max-w-sm"
        />
        <WiresharkFilterSelect onSelect={setFilter} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packet List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2">ID</th>
                <th>Protocol</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-1">{p.id}</td>
                  <td>{p.protocol}</td>
                  <td>{p.info}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No packets match the current filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
