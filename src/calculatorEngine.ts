export interface HistoryItem {
  id: string;
  equation: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  currentInput: string;
  equation: string;
  accumulator: number | null;
  pendingOperation: string | null;
  isNewInput: boolean;
  error: string | null;
  history: HistoryItem[];
}

export const INITIAL_STATE: CalculatorState = {
  currentInput: '0',
  equation: '',
  accumulator: null,
  pendingOperation: null,
  isNewInput: true,
  error: null,
  history: [],
};

export function normalizeOperator(op: string): string {
  if (op === '+' || op === 'add') return '+';
  if (op === '-' || op === 'subtract') return '-';
  if (op === '*' || op === '×' || op === 'multiply' || op === 'x') return '×';
  if (op === '/' || op === '÷' || op === 'divide') return '÷';
  return op;
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  // Avoid floating-point weirdness (e.g., 0.1 + 0.2 = 0.30000000000000004)
  const precisionClean = parseFloat(value.toPrecision(12));
  return String(precisionClean);
}

export function executeOperation(
  a: number,
  b: number,
  op: string,
): { result: number | null; error: string | null } {
  const normalized = normalizeOperator(op);
  switch (normalized) {
    case '+':
      return { result: a + b, error: null };
    case '-':
      return { result: a - b, error: null };
    case '×':
      return { result: a * b, error: null };
    case '÷':
      if (b === 0) {
        return { result: null, error: 'Cannot divide by zero' };
      }
      return { result: a / b, error: null };
    default:
      return { result: null, error: `Unsupported operation: ${op}` };
  }
}

export function inputDigit(state: CalculatorState, digit: string): CalculatorState {
  if (state.error) {
    return {
      ...state,
      currentInput: digit,
      isNewInput: false,
      error: null,
    };
  }

  if (state.isNewInput) {
    return {
      ...state,
      currentInput: digit,
      isNewInput: false,
    };
  }

  const nextInput = state.currentInput === '0' ? digit : state.currentInput + digit;
  return {
    ...state,
    currentInput: nextInput,
  };
}

export function inputDecimal(state: CalculatorState): CalculatorState {
  if (state.error) {
    return {
      ...state,
      currentInput: '0.',
      isNewInput: false,
      error: null,
    };
  }

  if (state.isNewInput) {
    return {
      ...state,
      currentInput: '0.',
      isNewInput: false,
    };
  }

  if (!state.currentInput.includes('.')) {
    return {
      ...state,
      currentInput: state.currentInput + '.',
    };
  }

  return state;
}

export function setOperation(state: CalculatorState, operation: string): CalculatorState {
  const op = normalizeOperator(operation);

  if (state.error) {
    return state;
  }

  const currentVal = parseFloat(state.currentInput);

  // If chaining operations (e.g., 5 + 3 then +)
  if (state.pendingOperation && !state.isNewInput && state.accumulator !== null) {
    const { result, error } = executeOperation(
      state.accumulator,
      currentVal,
      state.pendingOperation,
    );

    if (error || result === null) {
      return {
        ...state,
        error: error ?? 'Error',
        currentInput: 'Error',
        equation: `${state.accumulator} ${state.pendingOperation} 0`,
        pendingOperation: null,
        isNewInput: true,
      };
    }

    const formatted = formatResult(result);
    return {
      ...state,
      accumulator: result,
      currentInput: formatted,
      equation: `${formatted} ${op}`,
      pendingOperation: op,
      isNewInput: true,
      error: null,
    };
  }

  return {
    ...state,
    accumulator: currentVal,
    equation: `${state.currentInput} ${op}`,
    pendingOperation: op,
    isNewInput: true,
    error: null,
  };
}

export function calculateEquals(state: CalculatorState): CalculatorState {
  if (state.error || !state.pendingOperation || state.accumulator === null) {
    return state;
  }

  const currentVal = parseFloat(state.currentInput);
  const { result, error } = executeOperation(
    state.accumulator,
    currentVal,
    state.pendingOperation,
  );

  if (error || result === null) {
    return {
      ...state,
      error: error ?? 'Cannot divide by zero',
      currentInput: 'Error',
      equation: `${state.accumulator} ${state.pendingOperation} ${state.currentInput} =`,
      pendingOperation: null,
      isNewInput: true,
    };
  }

  const formatted = formatResult(result);
  const equation = `${state.accumulator} ${state.pendingOperation} ${state.currentInput} = ${formatted}`;
  const historyItem: HistoryItem = {
    id: String(Date.now()) + '-' + Math.random().toString(36).substring(2, 7),
    equation,
    result: formatted,
    timestamp: Date.now(),
  };

  return {
    ...state,
    currentInput: formatted,
    equation,
    accumulator: null,
    pendingOperation: null,
    isNewInput: true,
    error: null,
    history: [historyItem, ...state.history],
  };
}

export function clearEntry(state: CalculatorState): CalculatorState {
  return {
    ...state,
    currentInput: '0',
    isNewInput: true,
    error: null,
  };
}

export function allClear(state: CalculatorState): CalculatorState {
  return {
    ...INITIAL_STATE,
    history: state.history, // preserve existing history tape unless cleared explicitly
  };
}

export function recallHistory(state: CalculatorState, result: string): CalculatorState {
  return {
    ...state,
    currentInput: result,
    isNewInput: true,
    error: null,
  };
}

export function clearHistoryTape(state: CalculatorState): CalculatorState {
  return {
    ...state,
    history: [],
  };
}
