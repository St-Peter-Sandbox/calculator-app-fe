import { renderToString } from 'react-dom/server';
import React from 'react';
import { App, type CalculatorHandlers } from '../../src/App';
import { INITIAL_STATE } from '../../src/calculatorEngine';

describe('App', () => {
  it('renders the default service title', () => {
    const html = renderToString(<App />);
    expect(html).toContain('calculator-app-frontend');
    expect(html).toContain('data-testid="display"');
    expect(html).toContain('data-testid="equation-display"');
  });

  it('renders a custom title', () => {
    expect(renderToString(<App title="custom" />)).toContain('custom');
  });

  it('renders error indicator when error exists', () => {
    const html = renderToString(
      <App
        initialState={{
          ...INITIAL_STATE,
          error: 'Cannot divide by zero',
          currentInput: 'Error',
        }}
      />,
    );
    expect(html).toContain('data-testid="error-indicator"');
    expect(html).toContain('Cannot divide by zero');
  });

  it('renders history tape when expanded with items', () => {
    const html = renderToString(
      <App
        initialState={{
          ...INITIAL_STATE,
          history: [
            { id: '1', equation: '5 + 3 = 8', result: '8', timestamp: Date.now() },
          ],
        }}
        initialHistoryOpen={true}
      />,
    );
    expect(html).toContain('data-testid="history-tape"');
    expect(html).toContain('5 + 3 = 8');
    expect(html).toContain('Recall');
  });

  it('renders empty history tape message when history is empty', () => {
    const html = renderToString(
      <App
        initialState={INITIAL_STATE}
        initialHistoryOpen={true}
      />,
    );
    expect(html).toContain('data-testid="history-empty"');
    expect(html).toContain('No calculations recorded yet.');
  });

  it('exercises all button actions and handlers via testHook', async () => {
    let capturedHandlers: CalculatorHandlers | undefined;
    const actions: string[] = [];

    renderToString(
      <App
        initialState={{
          ...INITIAL_STATE,
          accumulator: 5,
          pendingOperation: '+',
          currentInput: '3',
        }}
        onAction={(action) => actions.push(action)}
        testHook={(handlers) => {
          capturedHandlers = handlers;
        }}
      />,
    );

    expect(capturedHandlers).toBeDefined();

    // Direct handlers
    capturedHandlers!.handleDigit('5');
    capturedHandlers!.handleDecimal();
    capturedHandlers!.handleOperation('+');
    await capturedHandlers!.handleEquals();
    capturedHandlers!.handleClearEntry();
    capturedHandlers!.handleAllClear();
    capturedHandlers!.handleRecall('42');
    capturedHandlers!.handleClearHistory();
    capturedHandlers!.handleToggleHistory();

    // Keypad button click event handler
    const mockClick = (action: string, value?: string) =>
      ({
        currentTarget: {
          dataset: { action, value },
        },
      } as unknown as React.MouseEvent<HTMLButtonElement>);

    capturedHandlers!.onKeypadButtonClick(mockClick('digit', '9'));
    capturedHandlers!.onKeypadButtonClick(mockClick('decimal'));
    capturedHandlers!.onKeypadButtonClick(mockClick('op', '×'));
    capturedHandlers!.onKeypadButtonClick(mockClick('equals'));
    capturedHandlers!.onKeypadButtonClick(mockClick('clearEntry'));
    capturedHandlers!.onKeypadButtonClick(mockClick('allClear'));
    capturedHandlers!.onKeypadButtonClick(mockClick('clearHistory'));
    capturedHandlers!.onKeypadButtonClick({
      currentTarget: { dataset: {} },
    } as unknown as React.MouseEvent<HTMLButtonElement>);

    // Recall click event handler
    capturedHandlers!.onRecallButtonClick({
      currentTarget: { dataset: { result: '42' } },
    } as unknown as React.MouseEvent<HTMLButtonElement>);
    capturedHandlers!.onRecallButtonClick({
      currentTarget: { dataset: {} },
    } as unknown as React.MouseEvent<HTMLButtonElement>);

    expect(actions).toContain('digit');
    expect(actions).toContain('decimal');
    expect(actions).toContain('operation');
    expect(actions).toContain('equals');
    expect(actions).toContain('clearEntry');
    expect(actions).toContain('allClear');
    expect(actions).toContain('recall');
    expect(actions).toContain('clearHistory');
    expect(actions).toContain('toggleHistory');
  });
});
