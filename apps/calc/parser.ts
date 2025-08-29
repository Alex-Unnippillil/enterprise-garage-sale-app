export interface Value {
  value: number;
  unit?: string;
}

export class ParseError extends SyntaxError {
  index: number;
  constructor(message: string, index: number) {
    super(message);
    this.index = index;
  }
}

interface Token {
  type: string;
  value: string;
  pos: number;
  unit?: string;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    if (/[0-9\.]/.test(char)) {
      const start = i;
      while (/[0-9\.]/.test(input[i])) i++;
      const num = input.slice(start, i);
      const unitStart = i;
      while (/[a-zA-Z]/.test(input[i])) i++;
      const unit = input.slice(unitStart, i) || undefined;
      tokens.push({ type: 'number', value: num, unit, pos: start });
      continue;
    }
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      while (/[a-zA-Z0-9_]/.test(input[i])) i++;
      const ident = input.slice(start, i);
      tokens.push({ type: 'identifier', value: ident, pos: start });
      continue;
    }
    if (char === '(') {
      tokens.push({ type: 'lparen', value: char, pos: i });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'rparen', value: char, pos: i });
      i++;
      continue;
    }
    if ('+-*/^'.includes(char)) {
      tokens.push({ type: 'operator', value: char, pos: i });
      i++;
      continue;
    }
    throw new ParseError(`Unexpected character '${char}'`, i);
  }
  tokens.push({ type: 'eof', value: '', pos: i });
  return tokens;
}

const FUNCTIONS: Record<string, (arg: Value) => Value> = {
  sin: (a) => ({ value: Math.sin(a.value) }),
  cos: (a) => ({ value: Math.cos(a.value) }),
  sqrt: (a) => ({ value: Math.sqrt(a.value), unit: a.unit }),
  log: (a) => ({ value: Math.log(a.value) }),
};

const CONSTANTS: Record<string, Value> = {
  pi: { value: Math.PI },
  e: { value: Math.E },
};

function applyAddSub(a: Value, b: Value, op: string, pos: number): Value {
  if (a.unit !== b.unit) {
    throw new ParseError('Unit mismatch', pos);
  }
  return {
    value: op === '+' ? a.value + b.value : a.value - b.value,
    unit: a.unit,
  };
}

function combineUnits(op: '*' | '/', a?: string, b?: string) {
  if (!a && !b) return undefined;
  if (!a) return op === '*' ? b : `1/${b}`;
  if (!b) return op === '*' ? a : a;
  return `${a}${op}${b}`;
}

function applyMulDiv(a: Value, b: Value, op: string): Value {
  return {
    value: op === '*' ? a.value * b.value : a.value / b.value,
    unit: combineUnits(op as '*' | '/', a.unit, b.unit),
  };
}

export function parse(input: string): Value {
  const tokens = tokenize(input);
  let pos = 0;

  function peek(): Token {
    return tokens[pos];
  }

  function consume(expectedType?: string, expectedValue?: string): Token {
    const token = tokens[pos];
    if (expectedType && token.type !== expectedType) {
      throw new ParseError(`Expected ${expectedType}`, token.pos);
    }
    if (expectedValue && token.value !== expectedValue) {
      throw new ParseError(`Expected '${expectedValue}'`, token.pos);
    }
    pos++;
    return token;
  }

  function parseExpression(): Value {
    return parseAddSub();
  }

  function parseAddSub(): Value {
    let left = parseMulDiv();
    while (true) {
      const t = peek();
      if (t.type === 'operator' && (t.value === '+' || t.value === '-')) {
        consume();
        const right = parseMulDiv();
        left = applyAddSub(left, right, t.value, t.pos);
        continue;
      }
      break;
    }
    return left;
  }

  function parseMulDiv(): Value {
    let left = parsePower();
    while (true) {
      const t = peek();
      if (t.type === 'operator' && (t.value === '*' || t.value === '/')) {
        consume();
        const right = parsePower();
        left = applyMulDiv(left, right, t.value);
        continue;
      }
      break;
    }
    return left;
  }

  function parsePower(): Value {
    let left = parseUnary();
    const t = peek();
    if (t.type === 'operator' && t.value === '^') {
      consume();
      const right = parsePower();
      return {
        value: Math.pow(left.value, right.value),
        unit: undefined,
      };
    }
    return left;
  }

  function parseUnary(): Value {
    const t = peek();
    if (t.type === 'operator' && (t.value === '+' || t.value === '-')) {
      consume();
      const res = parseUnary();
      return { value: t.value === '+' ? res.value : -res.value, unit: res.unit };
    }
    return parsePrimary();
  }

  function parsePrimary(): Value {
    const t = peek();
    if (t.type === 'number') {
      consume();
      return { value: parseFloat(t.value), unit: t.unit };
    }
    if (t.type === 'identifier') {
      consume();
      if (peek().type === 'lparen') {
        consume('lparen');
        const arg = parseExpression();
        if (peek().type !== 'rparen') {
          throw new ParseError("Expected ')'", peek().pos);
        }
        consume('rparen');
        const fn = FUNCTIONS[t.value];
        if (!fn) {
          throw new ParseError(`Unknown function ${t.value}`, t.pos);
        }
        return fn(arg);
      }
      const constant = CONSTANTS[t.value];
      if (!constant) {
        throw new ParseError(`Unknown identifier ${t.value}`, t.pos);
      }
      return constant;
    }
    if (t.type === 'lparen') {
      consume();
      const expr = parseExpression();
      if (peek().type !== 'rparen') {
        throw new ParseError("Expected ')'", peek().pos);
      }
      consume('rparen');
      return expr;
    }
    if (t.type === 'eof') {
      throw new ParseError('Unexpected end of input', t.pos);
    }
    throw new ParseError(`Unexpected token '${t.value}'`, t.pos);
  }

  const result = parseExpression();
  if (peek().type !== 'eof') {
    throw new ParseError(`Unexpected token '${peek().value}'`, peek().pos);
  }
  return result;
}
