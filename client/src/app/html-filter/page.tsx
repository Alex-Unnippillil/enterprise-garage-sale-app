'use client';

import { useState } from 'react';
import { diffLines } from 'diff';

interface Rule {
  pattern: string;
  replacement: string;
}

export default function HtmlFilterPage() {
  const [rulesText, setRulesText] = useState(
    '[\n  {"pattern": "<script[^>]*>[\\s\\S]*?<\\/script>", "replacement": ""}\n]',
  );
  const [htmlText, setHtmlText] = useState('<div>Hello <script>alert("x")</script>World</div>');
  const [diff, setDiff] = useState(diffLines(htmlText, htmlText));
  const [error, setError] = useState<string | null>(null);

  const applyRules = () => {
    try {
      const rules = JSON.parse(rulesText) as Rule[];
      let rewritten = htmlText;
      for (const rule of rules) {
        const regex = new RegExp(rule.pattern, 'g');
        rewritten = rewritten.replace(regex, rule.replacement);
      }
      setDiff(diffLines(htmlText, rewritten));
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setDiff(diffLines(htmlText, htmlText));
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">HTML Filter Sandbox</h1>
      <p className="text-sm text-gray-600">
        Enter filter rules and sample HTML to preview how rewriting affects the markup.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Filter Rules (JSON)</label>
          <textarea
            className="h-40 w-full rounded border p-2 font-mono"
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label className="font-medium">Sample HTML</label>
          <textarea
            className="h-40 w-full rounded border p-2 font-mono"
            value={htmlText}
            onChange={(e) => setHtmlText(e.target.value)}
          />
        </div>
      </div>
      <button onClick={applyRules} className="rounded bg-blue-600 px-4 py-2 text-white">
        Apply Rules
      </button>
      {error && <p className="text-red-600">{error}</p>}
      <pre className="whitespace-pre-wrap rounded border p-2 font-mono text-sm">
        {diff.map((part, idx) => (
          <span
            key={idx}
            className={part.added ? 'bg-green-200' : part.removed ? 'bg-red-200' : ''}
          >
            {part.value}
          </span>
        ))}
      </pre>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Risks and Mitigations</h2>
        <p className="text-sm text-gray-600">
          Rewriting HTML can inadvertently remove required attributes or expose the application to
          cross‑site scripting (XSS) if filters are misconfigured. Validate rule syntax, test
          changes thoroughly, and sanitize output before rendering it to users.
        </p>
      </section>
    </div>
  );
}
