export type Mode = "dec" | "bin" | "hex";
export type Operation = "+" | "-" | "*" | "/" | "AND" | "OR" | "XOR" | "NOT";

const parse = (value: string, mode: Mode): number => {
  switch (mode) {
    case "bin":
      return parseInt(value, 2);
    case "hex":
      return parseInt(value, 16);
    default:
      return parseInt(value, 10);
  }
};

const format = (value: number, mode: Mode): string => {
  switch (mode) {
    case "bin":
      return (value >>> 0).toString(2);
    case "hex":
      return (value >>> 0).toString(16).toUpperCase();
    default:
      return value.toString(10);
  }
};

export const calculate = (
  aStr: string,
  bStr: string | null,
  op: Operation,
  mode: Mode
): string => {
  const a = parse(aStr, mode);
  const b = bStr !== null ? parse(bStr, mode) : null;
  let result: number;

  switch (op) {
    case "+":
      result = a + (b ?? 0);
      break;
    case "-":
      result = a - (b ?? 0);
      break;
    case "*":
      result = a * (b ?? 0);
      break;
    case "/":
      result = b === 0 || b === null ? NaN : a / b;
      break;
    case "AND":
      result = a & (b ?? 0);
      break;
    case "OR":
      result = a | (b ?? 0);
      break;
    case "XOR":
      result = a ^ (b ?? 0);
      break;
    case "NOT":
      result = ~a;
      break;
    default:
      throw new Error(`Unsupported operation ${op}`);
  }

  if (!isFinite(result)) {
    return "NaN";
  }

  return format(result, mode);
};
