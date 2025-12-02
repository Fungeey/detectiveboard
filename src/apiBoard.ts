// src/apiBoard.ts

export type BoardState = unknown;

interface CaseBoard {
  caseId: string;
  boardState: BoardState | null;
  updatedAt: string;
}

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Board API error ${res.status} for ${path}`);
  }

  return (await res.json()) as T;
}

export async function loadBoard(caseId: string): Promise<BoardState | null> {
  const data = await request<CaseBoard>(`/cases/${caseId}/board`);
  return data.boardState;
}

export async function saveBoard(
  caseId: string,
  state: BoardState
): Promise<void> {
  await request<CaseBoard>(`/cases/${caseId}/board`, {
    method: 'PUT',
    body: JSON.stringify({ boardState: state }),
  });
}
