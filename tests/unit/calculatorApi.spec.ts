import {
  fetchBackendHistory,
  requestBackendCalculation,
} from '../../src/services/calculatorApi';

describe('Calculator API Service', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns calculation result on successful response', async () => {
    const mockResult = {
      result: 8,
      equation: '5 + 3 = 8',
      isSuccess: true,
      errorMessage: null,
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResult),
    });

    const result = await requestBackendCalculation(5, 3, 'add');
    expect(result).toEqual(mockResult);
  });

  it('returns parsed body even on 400 bad request (e.g., division by zero)', async () => {
    const mockError = {
      result: null,
      equation: '5 ÷ 0',
      isSuccess: false,
      errorMessage: 'Cannot divide by zero',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue(mockError),
    });

    const result = await requestBackendCalculation(5, 0, 'divide');
    expect(result).toEqual(mockError);
  });

  it('returns null on 500 internal server error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await requestBackendCalculation(5, 3, 'add');
    expect(result).toBeNull();
  });

  it('gracefully handles network failures returning null', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await requestBackendCalculation(5, 3, 'add');
    expect(result).toBeNull();
  });

  it('fetches backend history successfully', async () => {
    const mockHistory = [
      { id: '1', equation: '5 + 3 = 8', result: 8, timestamp: '2026-11-05T00:00:00Z' },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockHistory),
    });

    const history = await fetchBackendHistory();
    expect(history).toEqual(mockHistory);
  });

  it('handles history fetch failure gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const history = await fetchBackendHistory();
    expect(history).toBeNull();
  });
});

