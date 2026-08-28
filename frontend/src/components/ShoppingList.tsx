import { Minus, Plus, ShoppingBag, Trash2, Check } from 'lucide-react'
import type { ListItem } from '../types'
import { CATEGORY_META } from '../types'
import { getProductImage } from '../data/products'

interface Props {
  items: ListItem[]
  query: string | null
  onQty: (id: string, qty: number) => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
}

export function ShoppingList({ items, query, onQty, onDelete, onComplete }: Props) {
  const filtered = query
    ? items.filter((i) => i.item.toLowerCase().includes(query.toLowerCase()))
    : items

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E2DA] bg-white px-8 py-16 text-center">
        <ShoppingBag size={48} className="mb-4 text-[#D4CCC2]" />
        <h3 className="font-display text-xl font-semibold text-[#2D2A26]">Your cart is empty</h3>
        <p className="mt-2 max-w-xs text-sm text-[#8C8680]">
          Try saying "Add milk", "పాల ప్యాకెట్ కావాలి" or click items below to build your shopping list.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filtered.map((item) => {
        const meta = CATEGORY_META[item.category] ?? CATEGORY_META.other
        const imgUrl = getProductImage(item.item, item.category)

        return (
          <div
            key={item.id}
            className="card-hover group relative flex items-center gap-4 rounded-xl border border-[#E8E2DA] bg-white p-4 transition-all duration-300 hover:border-[#3D6B52]/40 hover:shadow-md"
          >
            {/* Interactive Pop-Out Product Image */}
            <div className="relative h-14 w-14 shrink-0 overflow-visible">
              <img
                src={imgUrl}
                alt={item.item}
                className="h-14 w-14 rounded-lg object-cover border border-[#E8E2DA] shadow-sm transition-all duration-300 ease-out transform-gpu group-hover:scale-135 group-hover:z-30 group-hover:shadow-xl group-hover:rounded-xl"
              />
              <span className="absolute -bottom-1 -right-1 z-20 rounded-full bg-white px-1 py-0.5 text-xs shadow">
                {meta.icon}
              </span>
            </div>

            {/* Item Details */}
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-semibold capitalize text-[#2D2A26] transition-colors group-hover:text-[#3D6B52]">
                {item.item}
              </h4>
              <span
                className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.accent}`}
              >
                {meta.label}
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center gap-1.5 bg-[#FAF5EF] p-1 rounded-lg border border-[#E8E2DA]">
              <button
                type="button"
                onClick={() => onQty(item.id, Math.max(1, item.quantity - 1))}
                className="grid h-7 w-7 place-items-center rounded bg-white text-[#8C8680] shadow-xs transition hover:border-[#3D6B52] hover:text-[#3D6B52]"
                aria-label="Decrease quantity"
              >
                <Minus size={13} />
              </button>
              <span className="w-6 text-center text-xs font-bold text-[#2D2A26]">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQty(item.id, item.quantity + 1)}
                className="grid h-7 w-7 place-items-center rounded bg-white text-[#8C8680] shadow-xs transition hover:border-[#3D6B52] hover:text-[#3D6B52]"
                aria-label="Increase quantity"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Complete (Purchased) Button */}
            <button
              type="button"
              onClick={() => onComplete(item.id)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-green-200 bg-green-50 text-green-700 transition-transform hover:scale-105 hover:bg-green-100"
              aria-label="Mark as purchased"
              title="Mark as purchased"
            >
              <Check size={15} />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition-transform hover:scale-105 hover:bg-red-100 hover:text-red-700"
              aria-label="Remove item"
              title="Remove item"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
