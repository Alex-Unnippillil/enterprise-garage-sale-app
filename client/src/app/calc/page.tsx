"use client";

import { useState } from "react";
import { calculate, Mode, Operation } from "../../../../apps/calc/logic";

interface TapeEntry {
  expression: string;
  result: string;
  mode: Mode;
}

const CalcPage = () => {
  const [mode, setMode] = useState<Mode>("dec");
  const [op, setOp] = useState<Operation>("+");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState("");
  const [tape, setTape] = useState<TapeEntry[]>([]);
  const [search, setSearch] = useState("");

  const handleCalculate = () => {
    const res = calculate(a, op === "NOT" ? null : b, op, mode);
    setResult(res);
    const expression = op === "NOT" ? `${op} ${a}` : `${a} ${op} ${b}`;
    setTape([...tape, { expression, result: res, mode }]);
  };

  const filteredTape = tape.filter(
    (t) =>
      t.expression.toLowerCase().includes(search.toLowerCase()) ||
      t.result.toLowerCase().includes(search.toLowerCase())
  );

  const downloadTape = () => {
    const content = tape
      .map((t) => `${t.expression} = ${t.result}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tape.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="mode">Mode:</label>
        <select
          id="mode"
          className="border p-1"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
        >
          <option value="dec">DEC</option>
          <option value="bin">BIN</option>
          <option value="hex">HEX</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          className="border p-1 w-24"
          value={a}
          onChange={(e) => setA(e.target.value)}
        />
        {op !== "NOT" && (
          <input
            className="border p-1 w-24"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        )}
        <select
          className="border p-1"
          value={op}
          onChange={(e) => setOp(e.target.value as Operation)}
        >
          <option value="+">+</option>
          <option value="-">-</option>
          <option value="*">*</option>
          <option value="/">/</option>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
          <option value="XOR">XOR</option>
          <option value="NOT">NOT</option>
        </select>
        <button
          className="bg-blue-500 text-white px-3 py-1"
          onClick={handleCalculate}
        >
          =
        </button>
        <span className="ml-2">{result}</span>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <input
            className="border p-1 flex-1"
            placeholder="Search tape"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-3 py-1"
            onClick={downloadTape}
          >
            Download
          </button>
        </div>
        <div className="border p-2 max-h-64 overflow-auto">
          {filteredTape.map((t, i) => (
            <div key={i}>{`${t.expression} = ${t.result}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalcPage;
