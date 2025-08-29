import React, { useState } from 'react';
import { parse, ParseError } from './parser';

export const CalcInput: React.FC = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<ParseError | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    try {
      parse(v);
      setError(null);
    } catch (err) {
      if (err instanceof ParseError) {
        setError(err);
      } else {
        setError(new ParseError((err as Error).message, 0));
      }
    }
  };

  return (
    <div>
      <textarea value={value} onChange={onChange} />
      {error && (
        <pre className="error-preview">
          {value.slice(0, error.index)}
          <span className="error-char">
            {value[error.index] || ' '}
          </span>
          {value.slice(error.index + 1)}
        </pre>
      )}
      {error && <div className="error-message">{error.message}</div>}
      <style jsx>{`
        .error-char {
          text-decoration: underline red;
        }
        .error-preview {
          margin: 0.5rem 0;
          white-space: pre-wrap;
        }
        .error-message {
          color: red;
        }
      `}</style>
    </div>
  );
};

export default CalcInput;
