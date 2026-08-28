import type { ListItem, ParseResponse, Suggestion } from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<{ status: string; llm: boolean; db: string }>('/health'),
  items: () => request<ListItem[]>('/items'),
  parse: (transcript: string, language_hint: string) =>
    request<ParseResponse>('/parse-command', {
      method: 'POST',
      body: JSON.stringify({ transcript, language_hint }),
    }),
  addItem: (item: string, quantity = 1, category = 'other') =>
    request<ListItem>('/items', {
      method: 'POST',
      body: JSON.stringify({ item, quantity, category }),
    }),
  patchItem: (id: string, body: { quantity?: number; category?: string; item?: string }) =>
    request<ListItem>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteItem: (id: string) => request<{ ok: boolean }>(`/items/${id}`, { method: 'DELETE' }),
  completeItem: (id: string) =>
    request<{ ok: boolean; message: string; items: ListItem[] }>(`/items/${id}/complete`, {
      method: 'POST',
    }),
  suggestions: () => request<{ suggestions: Suggestion[]; method: string }>('/suggestions'),
}
