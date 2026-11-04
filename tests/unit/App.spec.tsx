import { renderToString } from 'react-dom/server';

import { App } from '../../src/App';

describe('App', () => {
  it('renders the default service title', () => {
    expect(renderToString(<App />)).toContain('calculator-app-frontend');
  });

  it('renders a custom title', () => {
    expect(renderToString(<App title="custom" />)).toContain('custom');
  });
});