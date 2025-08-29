"use client";

import React, { useState } from "react";

const steps = [
  {
    title: "Load the target page",
    content:
      "Open this page from your browser to simulate a same-origin environment.",
  },
  {
    title: "Inject the hook",
    content:
      "In a real exercise, the BeEF hook script would run here. In this lab, nothing is executed.",
  },
  {
    title: "Observe safe results",
    content:
      "The hook completes without capturing data or making network calls. This page is for educational use only.",
  },
];

const BeefLab = () => {
  const [current, setCurrent] = useState(0);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">BeEF Hook Lab</h1>
      <ol className="mb-8 flex flex-col gap-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={`rounded border p-4 ${
              index === current ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <h2 className="font-semibold">
              {`Step ${index + 1}: ${step.title}`}
            </h2>
            {index === current && (
              <p className="mt-2 text-sm text-muted-foreground">
                {step.content}
              </p>
            )}
          </li>
        ))}
      </ol>
      <div className="flex justify-between">
        <button
          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
        >
          Previous
        </button>
        <button
          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
          onClick={() => setCurrent(Math.min(steps.length - 1, current + 1))}
          disabled={current === steps.length - 1}
        >
          Next
        </button>
      </div>
      <section className="mt-8 text-xs text-gray-600">
        <p>
          This demonstration page is provided for educational purposes. Use only on
          systems you are authorized to test. No network requests are made and no
          data is collected.
        </p>
        <p className="mt-2">
          Safe outcome: completing the steps results only in on-screen changes. No
          exploitation or exfiltration occurs.
        </p>
      </section>
    </main>
  );
};

export default BeefLab;

