import type { CalculatorState } from '../../src/calculatorEngine';
import {
  allClear,
  calculateEquals,
  clearEntry,
  clearHistoryTape,
  executeOperation,
  formatResult,
  INITIAL_STATE,
  inputDecimal,
  inputDigit,
  normalizeOperator,
  recallHistory,
  setOperation,
} from '../../src/calculatorEngine';

describe('Calculator Engine', () => {
  describe('normalizeOperator', () => {
    it('normalizes operator symbols and names', () => {
      expect(normalizeOperator('+')).toBe('+');
      expect(normalizeOperator('add')).toBe('+');
      expect(normalizeOperator('-')).toBe('-');
      expect(normalizeOperator('subtract')).toBe('-');
      expect(normalizeOperator('*')).toBe('×');
      expect(normalizeOperator('x')).toBe('×');
      expect(normalizeOperator('multiply')).toBe('×');
      expect(normalizeOperator('/')).toBe('÷');
      expect(normalizeOperator('divide')).toBe('÷');
      expect(normalizeOperator('unknown')).toBe('unknown');
    });
  });

  describe('executeOperation', () => {
    it('adds two numbers', () => {
      const { result, error } = executeOperation(5, 3, '+');
      expect(result).toBe(8);
      expect(error).toBeNull();
    });

    it('subtracts two numbers', () => {
      const { result, error } = executeOperation(10, 4, '-');
      expect(result).toBe(6);
      expect(error).toBeNull();
    });

    it('multiplies two numbers', () => {
      const { result, error } = executeOperation(6, 7, '×');
      expect(result).toBe(42);
      expect(error).toBeNull();
    });

    it('divides two numbers', () => {
      const { result, error } = executeOperation(20, 4, '÷');
      expect(result).toBe(5);
      expect(error).toBeNull();
    });

    it('returns error on division by zero', () => {
      const { result, error } = executeOperation(20, 0, '÷');
      expect(result).toBeNull();
      expect(error).toBe('Cannot divide by zero');
    });

    it('handles unsupported operations', () => {
      const { result, error } = executeOperation(5, 2, '^');
      expect(result).toBeNull();
      expect(error).toContain('Unsupported operation');
    });
  });

  describe('formatResult', () => {
    it('formats clean integers and decimals', () => {
      expect(formatResult(8)).toBe('8');
      expect(formatResult(2.5)).toBe('2.5');
      expect(formatResult(0.1 + 0.2)).toBe('0.3');
      expect(formatResult(Infinity)).toBe('Error');
    });
  });

  describe('Feature 01: Basic Arithmetic Operations', () => {
    it('Happy path: Addition (5 + 3 = 8)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      state = inputDigit(state, '3');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('8');
      expect(state.equation).toBe('5 + 3 = 8');
      expect(state.error).toBeNull();
      expect(state.history.length).toBe(1);
    });

    it('Happy path: Subtraction (10 - 4 = 6)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '1');
      state = inputDigit(state, '0');
      state = setOperation(state, '-');
      state = inputDigit(state, '4');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('6');
      expect(state.equation).toBe('10 - 4 = 6');
      expect(state.error).toBeNull();
    });

    it('Happy path: Multiplication (6 × 7 = 42)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '6');
      state = setOperation(state, '×');
      state = inputDigit(state, '7');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('42');
      expect(state.equation).toBe('6 × 7 = 42');
      expect(state.error).toBeNull();
    });

    it('Happy path: Division (20 ÷ 4 = 5)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '2');
      state = inputDigit(state, '0');
      state = setOperation(state, '÷');
      state = inputDigit(state, '4');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('5');
      expect(state.equation).toBe('20 ÷ 4 = 5');
      expect(state.error).toBeNull();
    });
  });

  describe('Feature 02: Chained Operations', () => {
    it('chains operations without pressing equals each time (5 + 3 + 2 = 10)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      state = inputDigit(state, '3');
      // Pressing '+' immediately executes 5 + 3 -> 8 and prepares next addition
      state = setOperation(state, '+');

      expect(state.currentInput).toBe('8');
      expect(state.accumulator).toBe(8);
      expect(state.equation).toBe('8 +');

      state = inputDigit(state, '2');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('10');
      expect(state.equation).toBe('8 + 2 = 10');
    });

    it('chains subtraction and multiplication (10 - 4 × 2 = 12)', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '1');
      state = inputDigit(state, '0');
      state = setOperation(state, '-');
      state = inputDigit(state, '4');
      state = setOperation(state, '×');

      expect(state.currentInput).toBe('6');
      expect(state.accumulator).toBe(6);

      state = inputDigit(state, '2');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('12');
    });
  });

  describe('Feature 03: Divide by Zero Error Handling', () => {
    it('displays error indicator when attempting to divide by zero without crashing', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '2');
      state = inputDigit(state, '0');
      state = setOperation(state, '÷');
      state = inputDigit(state, '0');
      state = calculateEquals(state);

      expect(state.currentInput).toBe('Error');
      expect(state.error).toBe('Cannot divide by zero');
      expect(state.equation).toBe('20 ÷ 0 =');

      // Recover by inputting a new digit
      state = inputDigit(state, '7');
      expect(state.currentInput).toBe('7');
      expect(state.error).toBeNull();
    });

    it('handles divide by zero in chained operation', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '5');
      state = setOperation(state, '÷');
      state = inputDigit(state, '0');
      state = setOperation(state, '+');

      expect(state.currentInput).toBe('Error');
      expect(state.error).toBe('Cannot divide by zero');
    });
  });

  describe('Feature 04: Active Equation String and Registers', () => {
    it('shows active equation string alongside current input during calculation', () => {
      let state = INITIAL_STATE;
      expect(state.equation).toBe('');
      expect(state.currentInput).toBe('0');

      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      expect(state.equation).toBe('5 +');

      state = inputDigit(state, '3');
      expect(state.equation).toBe('5 +');
      expect(state.currentInput).toBe('3');

      state = calculateEquals(state);
      expect(state.equation).toBe('5 + 3 = 8');
      expect(state.currentInput).toBe('8');
    });
  });

  describe('Feature 05: Clear Entry (C) and All Clear (AC)', () => {
    it('clears only current input with C without resetting pending equation or accumulator', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      state = inputDigit(state, '9'); // mistaken entry

      state = clearEntry(state);
      expect(state.currentInput).toBe('0');
      expect(state.accumulator).toBe(5);
      expect(state.pendingOperation).toBe('+');
      expect(state.equation).toBe('5 +');

      state = inputDigit(state, '3');
      state = calculateEquals(state);
      expect(state.currentInput).toBe('8');
    });

    it('resets entire calculation with AC', () => {
      let state = INITIAL_STATE;
      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      state = inputDigit(state, '3');

      state = allClear(state);
      expect(state.currentInput).toBe('0');
      expect(state.accumulator).toBeNull();
      expect(state.pendingOperation).toBeNull();
      expect(state.equation).toBe('');
      expect(state.error).toBeNull();
    });
  });

  describe('Feature 06: Calculation History Tape', () => {
    it('records completed calculations, allows recall and clearing', () => {
      let state = INITIAL_STATE;

      // First calculation: 5 + 3 = 8
      state = inputDigit(state, '5');
      state = setOperation(state, '+');
      state = inputDigit(state, '3');
      state = calculateEquals(state);

      // Second calculation: 10 - 4 = 6
      state = inputDigit(state, '1');
      state = inputDigit(state, '0');
      state = setOperation(state, '-');
      state = inputDigit(state, '4');
      state = calculateEquals(state);

      expect(state.history.length).toBe(2);
      expect(state.history[0].result).toBe('6');
      expect(state.history[1].result).toBe('8');

      // Recall previous result '8'
      state = recallHistory(state, '8');
      expect(state.currentInput).toBe('8');
      expect(state.isNewInput).toBe(true);

      // Clear history tape
      state = clearHistoryTape(state);
      expect(state.history).toEqual([]);
    });
  });

  describe('Decimals and Input Edge Cases', () => {
    it('inputs decimal correctly and prevents duplicate decimal point', () => {
      let state = INITIAL_STATE;
      state = inputDecimal(state);
      expect(state.currentInput).toBe('0.');

      state = inputDigit(state, '5');
      expect(state.currentInput).toBe('0.5');

      state = inputDecimal(state); // second decimal should be ignored
      expect(state.currentInput).toBe('0.5');

      // Additional check when currentInput already contains decimal and isNewInput is false
      const unchanged = inputDecimal(state);
      expect(unchanged).toBe(state);
    });

    it('clears error on new decimal input', () => {
      let state: CalculatorState = { ...INITIAL_STATE, error: 'Cannot divide by zero', currentInput: 'Error' };
      state = inputDecimal(state);
      expect(state.currentInput).toBe('0.');
      expect(state.error).toBeNull();
    });

    it('ignores setOperation or equals when state has error or no pending op', () => {
      const state: CalculatorState = { ...INITIAL_STATE, error: 'Error' };
      const nextOp = setOperation(state, '+');
      expect(nextOp.error).toBe('Error');

      const nextEq = calculateEquals(INITIAL_STATE);
      expect(nextEq).toBe(INITIAL_STATE);
    });
  });
});




