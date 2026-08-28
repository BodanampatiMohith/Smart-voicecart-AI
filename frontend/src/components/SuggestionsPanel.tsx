import { Plus, RefreshCw } from 'lucide-react'
import type { Suggestion } from '../types'

interface Props {
  suggestions: Suggestion[]
  method: string
  onAdd: (item: string, category: string) => void
  onAddSubstitute: (item: string) => void
}

export function SuggestionsPanel({ suggestions, method, onAdd, onAddSubstitute }: Props) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E8E2DA] bg-white px-6 py-10 text-center">
        <RefreshCw size={32} className="mx-auto mb-3 text-[#D4CCC2]" />
        <p className="text-sm text-[#8C8680]">
          Purchase a few items to unlock personalized suggestions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl text-[#2D2A26]">You might need</h2>
        <p className="mt-1 text-xs text-[#8C8680]">
          Based on your purchase patterns{method === 'frequency-interval' ? ' and restock cycles' : ''}
        </p>
      </div>
      <div className="space-y-3">
        {suggestions.map((s) => (
          <div
            key={s.item}
            className="card-hover rounded-xl border border-[#E8E2DA] bg-white p-4 transition-all hover:border-[#D4CCC2]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold capitalize text-[#2D2A26]">{s.item}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#8C8680]">{s.reason}</p>

                {s.substitutes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#8C8680]">
                      Also try:
                    </span>
                    {s.substitutes.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => onAddSubstitute(sub)}
                        className="rounded-full border border-[#E07A5F]/20 bg-[#E07A5F]/5 px-2.5 py-0.5 text-xs font-medium text-[#E07A5F] transition hover:bg-[#E07A5F]/10"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onAdd(s.item, s.category)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#3D6B52]/20 bg-[#3D6B52]/5 text-[#3D6B52] transition hover:bg-[#3D6B52]/15"
                aria-label={`Add ${s.item} to cart`}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
