import { parse, Value } from '../parser';

describe('parser', () => {
  const valid: Array<[string, Value]> = [
    ['1', { value: 1 }],
    ['2', { value: 2 }],
    ['1+2', { value: 3 }],
    ['1-2', { value: -1 }],
    ['2*3', { value: 6 }],
    ['8/4', { value: 2 }],
    ['2^3', { value: 8 }],
    ['2^3^2', { value: 512 }],
    ['3+4*5', { value: 23 }],
    ['(3+4)*5', { value: 35 }],
    ['10/(5-3)', { value: 5 }],
    ['(2+3)*(4+5)', { value: 45 }],
    ['sin(0)', { value: 0 }],
    ['cos(0)', { value: 1 }],
    ['sqrt(9)', { value: 3 }],
    ['log(e)', { value: 1 }],
    ['sin(pi/2)', { value: 1 }],
    ['cos(pi)', { value: -1 }],
    ['sqrt(16)+cos(0)', { value: 5 }],
    ['sin(cos(0))', { value: Math.sin(1) }],
    ['3kg', { value: 3, unit: 'kg' }],
    ['3kg+2kg', { value: 5, unit: 'kg' }],
    ['4m*2m', { value: 8, unit: 'm*m' }],
    ['10m/2s', { value: 5, unit: 'm/s' }],
    ['5m-2m', { value: 3, unit: 'm' }],
    ['(2m+3m)*4', { value: 20, unit: 'm' }],
    ['2*(3kg+4kg)', { value: 14, unit: 'kg' }],
    ['log(1)+sqrt(4)', { value: 2 }],
    ['2 + sin(0) + cos(0)', { value: 3 }],
    ['2*(3+4*(5-2))', { value: 30 }],
    ['((2+3)*2)+1', { value: 11 }],
    ['3kg*2', { value: 6, unit: 'kg' }],
    ['3*2kg', { value: 6, unit: 'kg' }],
    ['3kg/2', { value: 1.5, unit: 'kg' }],
    ['3/(2kg)', { value: 1.5, unit: '1/kg' }],
    ['2^3*4', { value: 32 }],
    ['2*(3+4)*5', { value: 70 }],
    ['2*(3+(4*5))', { value: 46 }],
    ['((2))', { value: 2 }],
    ['--2', { value: 2 }],
    ['-(-2)', { value: 2 }],
    ['sin(-pi/2)', { value: -1 }],
    ['cos(-pi)', { value: -1 }],
    ['2+3*4+5', { value: 19 }],
    ['2^(1+1)', { value: 4 }],
    ['2^(3+1)', { value: 16 }],
    ['sqrt(4)+sqrt(9)', { value: 5 }],
    ['log(e^2)', { value: 2 }],
    ['sin(0)+cos(pi)', { value: -1 }],
    ['2m*3kg', { value: 6, unit: 'm*kg' }],
  ];

  valid.forEach(([expr, expected]) => {
    it(`evaluates ${expr}`, () => {
      const res = parse(expr);
      expect(res.value).toBeCloseTo(expected.value);
      if (expected.unit) {
        expect(res.unit).toBe(expected.unit);
      } else {
        expect(res.unit).toBeUndefined();
      }
    });
  });

  const errors: Array<[string, RegExp]> = [
    ['1+', /Unexpected end of input/],
    ['(1+2', /Expected '\)'/],
    ['sin(1', /Expected '\)'/],
    ['1+*2', /Unexpected token '\*'/],
    ['3kg+2m', /Unit mismatch/],
    ['foo(1)', /Unknown function foo/],
    ['sin)', /Unexpected token '\)'/],
    ['1 2', /Unexpected token '2'/],
    ['1/*2', /Unexpected token '\*'/],
    [')', /Unexpected token '\)'/],
  ];

  errors.forEach(([expr, msg]) => {
    it(`throws on ${expr}`, () => {
      expect(() => parse(expr)).toThrow(msg);
    });
  });
});
