import React, { useState } from 'react';
import {
  allClear,
  calculateEquals,
  clearEntry,
  clearHistoryTape,
  INITIAL_STATE,
  inputDecimal,
  inputDigit,
  recallHistory,
  setOperation,
  type CalculatorState,
} from './calculatorEngine';
import { requestBackendCalculation } from './services/calculatorApi';

export interface CalculatorHandlers {
  handleDigit: (digit: string) => void;
  handleDecimal: () => void;
  handleOperation: (op: string) => void;
  handleEquals: () => Promise<void>;
  handleClearEntry: () => void;
  handleAllClear: () => void;
  handleRecall: (result: string) => void;
  handleClearHistory: () => void;
  handleToggleHistory: () => void;
  handleButtonAction: (type: string, value?: string) => Promise<void>;
  onKeypadButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRecallButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface AppProps {
  title?: string;
  initialState?: CalculatorState;
  initialHistoryOpen?: boolean;
  onAction?: (action: string, value?: string) => void;
  testHook?: (handlers: CalculatorHandlers) => void;
}

interface ButtonConfig {
  label: string;
  testId: string;
  ariaLabel: string;
  action: 'allClear' | 'clearEntry' | 'clearHistory' | 'op' | 'digit' | 'decimal' | 'equals';
  value?: string;
  span?: number;
  styleType: 'number' | 'operator' | 'special' | 'equals';
}

const BUTTON_CONFIGS: ButtonConfig[] = [
  { label: 'AC', testId: 'btn-ac', ariaLabel: 'AC All clear', action: 'allClear', styleType: 'special' },
  { label: 'C', testId: 'btn-c', ariaLabel: 'C Clear current input', action: 'clearEntry', styleType: 'special' },
  { label: 'Clear Tape', testId: 'btn-history-clear', ariaLabel: 'Clear Tape', action: 'clearHistory', styleType: 'special' },
  { label: '÷', testId: 'btn-divide', ariaLabel: '÷ Divide', action: 'op', value: '÷', styleType: 'operator' },

  { label: '7', testId: 'btn-7', ariaLabel: '7', action: 'digit', value: '7', styleType: 'number' },
  { label: '8', testId: 'btn-8', ariaLabel: '8', action: 'digit', value: '8', styleType: 'number' },
  { label: '9', testId: 'btn-9', ariaLabel: '9', action: 'digit', value: '9', styleType: 'number' },
  { label: '×', testId: 'btn-multiply', ariaLabel: '× Multiply', action: 'op', value: '×', styleType: 'operator' },

  { label: '4', testId: 'btn-4', ariaLabel: '4', action: 'digit', value: '4', styleType: 'number' },
  { label: '5', testId: 'btn-5', ariaLabel: '5', action: 'digit', value: '5', styleType: 'number' },
  { label: '6', testId: 'btn-6', ariaLabel: '6', action: 'digit', value: '6', styleType: 'number' },
  { label: '-', testId: 'btn-subtract', ariaLabel: '- Subtract', action: 'op', value: '-', styleType: 'operator' },

  { label: '1', testId: 'btn-1', ariaLabel: '1', action: 'digit', value: '1', styleType: 'number' },
  { label: '2', testId: 'btn-2', ariaLabel: '2', action: 'digit', value: '2', styleType: 'number' },
  { label: '3', testId: 'btn-3', ariaLabel: '3', action: 'digit', value: '3', styleType: 'number' },
  { label: '+', testId: 'btn-add', ariaLabel: '+ Add', action: 'op', value: '+', styleType: 'operator' },

  { label: '0', testId: 'btn-0', ariaLabel: '0', action: 'digit', value: '0', span: 2, styleType: 'number' },
  { label: '.', testId: 'btn-decimal', ariaLabel: '. Decimal point', action: 'decimal', styleType: 'number' },
  { label: '=', testId: 'btn-equals', ariaLabel: '= Equals', action: 'equals', styleType: 'equals' },
];

export function App({
  title = 'calculator-app-frontend',
  initialState = INITIAL_STATE,
  initialHistoryOpen = false,
  onAction,
  testHook,
}: AppProps) {
  const [state, setState] = useState<CalculatorState>(initialState);
  const [isHistoryOpen, setIsHistoryOpen] = useState(initialHistoryOpen);

  const handleDigit = (digit: string) => {
    onAction?.('digit', digit);
    setState(inputDigit(state, digit));
  };

  const handleDecimal = () => {
    onAction?.('decimal');
    setState(inputDecimal(state));
  };

  const handleOperation = (op: string) => {
    onAction?.('operation', op);
    setState(setOperation(state, op));
  };

  const handleEquals = async () => {
    onAction?.('equals');
    if (state.accumulator !== null && state.pendingOperation && !state.error) {
      const currentVal = parseFloat(state.currentInput);
      requestBackendCalculation(state.accumulator, currentVal, state.pendingOperation);
    }
    setState(calculateEquals(state));
  };

  const handleClearEntry = () => {
    onAction?.('clearEntry');
    setState(clearEntry(state));
  };

  const handleAllClear = () => {
    onAction?.('allClear');
    setState(allClear(state));
  };

  const handleRecall = (result: string) => {
    onAction?.('recall', result);
    setState(recallHistory(state, result));
  };

  const handleClearHistory = () => {
    onAction?.('clearHistory');
    setState(clearHistoryTape(state));
  };

  const handleToggleHistory = () => {
    onAction?.('toggleHistory');
    setIsHistoryOpen(!isHistoryOpen);
  };

  const handleButtonAction = async (action: string, value?: string) => {
    switch (action) {
      case 'allClear':
        handleAllClear();
        break;
      case 'clearEntry':
        handleClearEntry();
        break;
      case 'clearHistory':
        handleClearHistory();
        break;
      case 'op':
        if (value) handleOperation(value);
        break;
      case 'digit':
        if (value) handleDigit(value);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'equals':
        await handleEquals();
        break;
    }
  };

  const onKeypadButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const action = e.currentTarget.dataset.action;
    const value = e.currentTarget.dataset.value;
    if (action) {
      void handleButtonAction(action, value);
    }
  };

  const onRecallButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const res = e.currentTarget.dataset.result;
    if (res) {
      handleRecall(res);
    }
  };

  if (testHook) {
    testHook({
      handleDigit,
      handleDecimal,
      handleOperation,
      handleEquals,
      handleClearEntry,
      handleAllClear,
      handleRecall,
      handleClearHistory,
      handleToggleHistory,
      handleButtonAction,
      onKeypadButtonClick,
      onRecallButtonClick,
    });
  }

  const getStyleForType = (type: ButtonConfig['styleType']) => {
    switch (type) {
      case 'operator':
        return operatorButtonStyle;
      case 'special':
        return specialButtonStyle;
      case 'equals':
        return equalsButtonStyle;
      default:
        return numberButtonStyle;
    }
  };

  return (
    <main
      className="calculator-container"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{title}</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Standard arithmetic calculator with equation register and history tape
        </p>
      </header>

      <div
        className="calculator-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
          border: '1px solid #334155',
          overflow: 'hidden',
        }}
      >
        {/* Display Section */}
        <section
          aria-label="Calculator display registers"
          style={{
            backgroundColor: '#020617',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: '110px',
            textAlign: 'right',
          }}
        >
          {/* Active Equation Register */}
          <div
            data-testid="equation-display"
            aria-label="Active equation string"
            role="status"
            aria-live="polite"
            style={{
              color: '#94a3b8',
              fontSize: '1rem',
              minHeight: '1.4rem',
              letterSpacing: '0.05em',
              wordBreak: 'break-all',
            }}
          >
            {state.equation || ' '}
          </div>

          {/* Current Input / Result Register */}
          <div
            data-testid="display"
            aria-label="Current number"
            role="status"
            aria-live="polite"
            style={{
              color: state.error ? '#f87171' : '#ffffff',
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              wordBreak: 'break-all',
              lineHeight: 1.2,
              marginTop: '0.25rem',
            }}
          >
            {state.currentInput}
          </div>

          {/* Clear Error Indicator */}
          {state.error && (
            <div
              data-testid="error-indicator"
              role="alert"
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              ⚠️ {state.error}
            </div>
          )}
        </section>

        {/* Toolbar: History Tape Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1.25rem',
            backgroundColor: '#1e293b',
            borderBottom: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Tape & Registers</span>
          <button
            type="button"
            data-testid="toggle-history"
            aria-expanded={isHistoryOpen}
            aria-controls="history-tape"
            onClick={handleToggleHistory}
            style={{
              background: isHistoryOpen ? '#0284c7' : '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            📜 {isHistoryOpen ? 'Hide History' : 'Expand History'}{' '}
            {state.history.length > 0 && `(${state.history.length})`}
          </button>
        </div>

        {/* Keypad Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.6rem',
            padding: '1.25rem',
          }}
        >
          {BUTTON_CONFIGS.map((btn) => (
            <button
              key={btn.testId}
              type="button"
              data-testid={btn.testId}
              data-action={btn.action}
              data-value={btn.value || ''}
              aria-label={btn.ariaLabel}
              onClick={onKeypadButtonClick}
              style={{
                ...getStyleForType(btn.styleType),
                ...(btn.span ? { gridColumn: `span ${btn.span}` } : {}),
                ...(btn.label === 'Clear Tape' ? { fontSize: '0.85rem' } : {}),
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Expandable History Tape */}
        {isHistoryOpen && (
          <section
            id="history-tape"
            data-testid="history-tape"
            aria-label="Calculation history tape"
            style={{
              borderTop: '1px solid #334155',
              backgroundColor: '#0f172a',
              padding: '1.25rem',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#e2e8f0' }}>
                History Tape
              </h2>
              {state.history.length > 0 && (
                <button
                  type="button"
                  data-testid="clear-history"
                  onClick={handleClearHistory}
                  style={{
                    background: 'transparent',
                    border: '1px solid #475569',
                    color: '#94a3b8',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {state.history.length === 0 ? (
              <p
                data-testid="history-empty"
                style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}
              >
                No calculations recorded yet.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {state.history.map((item) => (
                  <li
                    key={item.id}
                    data-testid={`history-item-${item.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0.4rem',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.equation}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>
                        {item.result}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid={`recall-${item.id}`}
                      data-result={item.result}
                      aria-label={`Recall result ${item.result}`}
                      onClick={onRecallButtonClick}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Recall
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

const baseButtonStyle: React.CSSProperties = {
  minHeight: '52px',
  borderRadius: '10px',
  fontSize: '1.25rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: 'none',
  transition: 'background-color 0.15s ease',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const numberButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#334155',
  color: '#f8fafc',
};

const operatorButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#0284c7',
  color: '#ffffff',
};

const specialButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

const equalsButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  backgroundColor: '#16a34a',
  color: '#ffffff',
};
