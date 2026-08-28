export type Action = 'add' | 'remove' | 'modify' | 'search' | 'complete'
export type Category = 'dairy' | 'produce' | 'snacks' | 'grains' | 'household' | 'other'

export interface ListItem {
  id: string
  item: string
  quantity: number
  category: string
  added_at?: string | null
}

export interface Intent {
  action: Action
  item: string | null
  quantity: number
  category: Category
  original_language: string
  confidence: number
  notes?: string | null
}

export interface ParseResponse {
  intent: Intent
  transcript: string
  applied: boolean
  message: string
  items: ListItem[]
  parser: 'llm' | 'heuristic'
}

export interface Suggestion {
  item: string
  category: string
  reason: string
  avg_interval_days: number | null
  days_since_last: number | null
  purchase_count: number
  substitutes: string[]
}

export const LANGUAGES = [
  { code: 'en-IN', label: 'English', native: 'English' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
] as const

export const CATEGORY_META: Record<string, { label: string; icon: string; accent: string }> = {
  dairy: { label: 'Dairy', icon: '🥛', accent: 'bg-blue-50 text-blue-800 border-blue-200' },
  produce: { label: 'Produce', icon: '🥬', accent: 'bg-green-50 text-green-800 border-green-200' },
  snacks: { label: 'Snacks', icon: '🍪', accent: 'bg-amber-50 text-amber-800 border-amber-200' },
  grains: { label: 'Grains', icon: '🌾', accent: 'bg-orange-50 text-orange-800 border-orange-200' },
  household: { label: 'Household', icon: '🏠', accent: 'bg-violet-50 text-violet-800 border-violet-200' },
  other: { label: 'Other', icon: '📦', accent: 'bg-stone-50 text-stone-700 border-stone-200' },
}
