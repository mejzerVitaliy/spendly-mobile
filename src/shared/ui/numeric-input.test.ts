import { appendNumericKey, deleteNumericKey, evaluateNumericExpression } from './numeric-input';

describe('appendNumericKey', () => {
  it('appends digits normally', () => {
    expect(appendNumericKey('12', '3')).toBe('123');
  });

  it('starts a decimal with a leading zero when empty', () => {
    expect(appendNumericKey('', '.')).toBe('0.');
  });

  it('blocks a second dot within the same operand', () => {
    expect(appendNumericKey('12.5', '.')).toBe('12.5');
  });

  it('blocks more than 2 decimal places', () => {
    expect(appendNumericKey('12.34', '5')).toBe('12.34');
  });

  it('allows a new decimal point in the operand after an operator', () => {
    expect(appendNumericKey('12.5+3', '.')).toBe('12.5+3.');
  });

  it('enforces the 2-decimal cap per operand, not globally', () => {
    expect(appendNumericKey('12.34+5.67', '8')).toBe('12.34+5.67');
    expect(appendNumericKey('12.34+5', '.')).toBe('12.34+5.');
  });

  it('ignores an operator with nothing typed yet', () => {
    expect(appendNumericKey('', '+')).toBe('');
  });

  it('appends an operator after a complete operand', () => {
    expect(appendNumericKey('12.5', '+')).toBe('12.5+');
  });

  it('swaps a pending operator instead of stacking it', () => {
    expect(appendNumericKey('12+', '-')).toBe('12-');
  });
});

describe('deleteNumericKey', () => {
  it('removes the last character', () => {
    expect(deleteNumericKey('12.5')).toBe('12.');
    expect(deleteNumericKey('12+3')).toBe('12+');
  });
});

describe('evaluateNumericExpression', () => {
  it('returns a plain amount unchanged (no operator to evaluate)', () => {
    expect(evaluateNumericExpression('12.50')).toBe('12.50');
  });

  it('sums two operands', () => {
    expect(evaluateNumericExpression('12.50+5')).toBe('17.5');
  });

  it('evaluates strictly left-to-right, no operator precedence', () => {
    // A basic four-function calculator: (2+3)*4 = 20, not 2+(3*4) = 14.
    expect(evaluateNumericExpression('2+3*4')).toBe('20');
  });

  it('handles subtraction and division in a chain', () => {
    expect(evaluateNumericExpression('100-20*2/4')).toBe('40');
  });

  it('ignores division by zero rather than producing Infinity', () => {
    expect(evaluateNumericExpression('10/0')).toBe('10');
  });

  it('drops a trailing incomplete operator instead of failing', () => {
    expect(evaluateNumericExpression('12+')).toBe('12');
  });

  it('treats an empty string as zero', () => {
    expect(evaluateNumericExpression('')).toBe('');
  });
});
