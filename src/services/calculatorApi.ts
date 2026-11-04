export interface BackendCalculationRequest {
  operand1: number;
  operand2: number;
  operation: string;
}

export interface BackendCalculationResult {
  result: number | null;
  equation: string;
  isSuccess: boolean;
  errorMessage: string | null;
}

export interface BackendHistoryItem {
  id: string;
  equation: string;
  result: number;
  timestamp: string;
}

const API_BASE = (typeof process !== 'undefined' && process.env?.VITE_API_URL) || '';

export async function requestBackendCalculation(
  operand1: number,
  operand2: number,
  operation: string,
): Promise<BackendCalculationResult | null> {
  try {
    const url = `${API_BASE}/api/calculate`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operand1, operand2, operation }),
    });

    if (!response.ok && response.status !== 400) {
      return null;
    }

    const data: BackendCalculationResult = await response.json();
    return data;
  } catch {
    // If backend is not available or offline, return null for graceful client fallback
    return null;
  }
}

export async function fetchBackendHistory(): Promise<BackendHistoryItem[] | null> {
  try {
    const url = `${API_BASE}/api/history`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
