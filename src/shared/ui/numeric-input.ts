const MAX_DECIMAL_PLACES = 2;
const OPERATORS = ['+', '-', '*', '/'] as const;
type Operator = (typeof OPERATORS)[number];

function isOperator(char: string | undefined): char is Operator {
  return !!char && (OPERATORS as readonly string[]).includes(char);
}

// The operand currently being typed - the substring after the last operator
// (or the whole string if there isn't one yet). Decimal-point rules apply
// per operand, not to the whole expression, e.g. "12.5+3" typing "." next
// should start a new decimal in "3", not be blocked because "12.5" already
// has one.
function currentOperand(value: string): string {
  for (let i = value.length - 1; i >= 0; i--) {
    if (isOperator(value[i])) return value.slice(i + 1);
  }
  return value;
}

/**
 * Appends a key pressed on NumericKeyboard to a running amount/expression
 * string. Shared by every NumericKeyboard consumer so the decimal-point
 * rules (one dot per operand, at most 2 digits after it) and the basic
 * calculator operators are consistent everywhere - previously only one of
 * three consumers guarded against a second dot, which didn't matter while
 * the keyboard had no "." key to press.
 *
 * Operators are evaluated left-to-right with no precedence (a basic
 * four-function calculator, not a scientific one) - see
 * evaluateNumericExpression.
 */
export function appendNumericKey(current: string, key: string): string {
  if (isOperator(key)) {
    if (current === '') return current; // nothing to operate on yet
    if (isOperator(current[current.length - 1])) {
      return current.slice(0, -1) + key; // changed their mind about the operator
    }
    return current + key;
  }

  const operand = currentOperand(current);

  if (key === '.') {
    if (operand.includes('.')) return current;
    if (operand === '') return `${current}0.`;
    return current + key;
  }

  const dotIndex = operand.indexOf('.');
  if (dotIndex !== -1 && operand.length - dotIndex - 1 >= MAX_DECIMAL_PLACES) {
    return current;
  }

  return current + key;
}

export function deleteNumericKey(current: string): string {
  return current.slice(0, -1);
}

/**
 * Evaluates a typed amount/expression like "12.50+5-2" into a final numeric
 * string, left-to-right with no operator precedence. Falls back gracefully
 * (drop a trailing incomplete operator, bail to the raw string if nothing
 * parses) so a confirm tap never crashes on odd input.
 */
export function evaluateNumericExpression(value: string): string {
  if (!value) return value;

  const trimmed = isOperator(value[value.length - 1]) ? value.slice(0, -1) : value;
  if (trimmed === '') return '0';
  if (!OPERATORS.some((op) => trimmed.includes(op))) return trimmed;

  const tokens = trimmed.split(/([+\-*/])/).filter((t) => t !== '');
  let result = parseFloat(tokens[0]);
  if (!Number.isFinite(result)) return trimmed;

  for (let i = 1; i < tokens.length - 1; i += 2) {
    const op = tokens[i];
    const operand = parseFloat(tokens[i + 1]);
    if (!Number.isFinite(operand)) break;
    switch (op) {
      case '+': result += operand; break;
      case '-': result -= operand; break;
      case '*': result *= operand; break;
      case '/': if (operand !== 0) result /= operand; break;
    }
  }

  if (!Number.isFinite(result)) return trimmed;
  // Round to 2dp to shake off float noise (0.1+0.2 etc.); String() drops a
  // trailing ".00" on its own, so "5+5" -> "10" not "10.00".
  return String(Math.round(result * 100) / 100);
}
