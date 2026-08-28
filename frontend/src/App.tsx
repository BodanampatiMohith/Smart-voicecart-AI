import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { LanguageSelect } from './components/LanguageSelect'
import { ShoppingList } from './components/ShoppingList'
import { SuggestionsPanel } from './components/SuggestionsPanel'
import { Toasts, useToastTimeout, type ToastMsg } from './components/Toasts'
import { VoiceDock } from './components/VoiceDock'
import { useVoiceRecognition } from './hooks/useVoiceRecognition'
import type { ListItem, Suggestion } from './types'
import { CATEGORY_META } from './types'
import { CATALOG_PRODUCTS } from './data/products'
import { LoaderCircle, Search, ShoppingBag, Plus, Sparkles, ArrowRight } from 'lucide-react'

/* ---- Marquee messages (grocery-related, seasonal, deals) ---- */
const MARQUEE_ANNOUNCEMENTS = [
  '⚡ Smart Voice Shopping Active — Speak in English, हिन्दी, or తెలుగు',
  '🥛 10% Off on Farm-Fresh Dairy Essentials This Week',
  '🚚 Complimentary Express Delivery on Orders Above ₹499',
  '🥑 Fresh Seasonal Produce Restocked Daily at 6:00 AM',
  '🌾 Buy 2 Get 1 Free on Organic Wholegrains & Millets',
  '✨ Predictive Restock Cycles Computed From Your Purchase History',
  '🌿 Natural & Healthy Substitutes Instantly Suggested',
]

export default function App() {
  const [lang, setLang] = useState('en-IN')
  const [items, setItems] = useState<ListItem[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [method, setMethod] = useState('')
  const [query, setQuery] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const toastId = useRef(0)
  const voice = useVoiceRecognition(lang)
  useToastTimeout(toasts, setToasts)

  const toast = useCallback((text: string, tone: ToastMsg['tone'] = 'info') => {
    toastId.current += 1
    setToasts((t) => [...t, { id: toastId.current, text, tone }])
  }, [])

  const refresh = useCallback(async () => {
    const [list, sug] = await Promise.all([api.items(), api.suggestions()])
    setItems(list)
    setSuggestions(sug.suggestions)
    setMethod(sug.method)
  }, [])

  useEffect(() => {
    api.health().catch(() => {})
    refresh().catch((err: Error) => toast(err.message, 'err'))
  }, [refresh, toast])

  useEffect(() => {
    if (voice.error) toast(voice.error, 'err')
  }, [voice.error, toast])

  const runTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      setBusy(true)
      try {
        const res = await api.parse(text.trim(), lang)
        setItems(res.items)
        if (res.intent.action === 'search') {
          setQuery(res.intent.item)
        } else {
          setQuery(null)
        }
        toast(res.message, res.applied ? 'ok' : 'err')
        const sug = await api.suggestions()
        setSuggestions(sug.suggestions)
        setMethod(sug.method)
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Could not process command', 'err')
      } finally {
        setBusy(false)
      }
    },
    [lang, toast],
  )

  const onMicStart = () => {
    voice.start((text) => {
      void runTranscript(text)
    })
  }

  const handleQuickAdd = async (productName: string, category: string) => {
    try {
      await api.addItem(productName.toLowerCase(), 1, category)
      toast(`Added ${productName} to cart`, 'ok')
      await refresh()
    } catch {
      toast('Failed to add product', 'err')
    }
  }

  const filteredItems = activeCategory
    ? items.filter((i) => i.category === activeCategory)
    : items

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="min-h-svh bg-[#FAF5EF] text-[#2D2A26] selection:bg-[#3D6B52] selection:text-white">
      <Toasts toasts={toasts} />

      {/* ===== Luxury Marquee Banner ===== */}
      <div className="overflow-hidden border-b border-[#E8E2DA] bg-[#3D6B52] py-2.5">
        <div className="marquee-track flex w-max items-center gap-14 whitespace-nowrap px-6">
          {[...MARQUEE_ANNOUNCEMENTS, ...MARQUEE_ANNOUNCEMENTS].map((announcement, i) => (
            <span key={i} className="flex items-center gap-3 text-xs font-medium tracking-wide text-white/95">
              <span>{announcement}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/40" />
            </span>
          ))}
        </div>
      </div>

      {/* ===== Skanvi-Style Classy Header Navigation ===== */}
      <nav className="sticky top-0 z-40 border-b border-[#E8E2DA] bg-[#FAF5EF]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#3D6B52] text-white shadow-sm transition-transform hover:scale-105">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-[#2D2A26]">
                Smartcart<span className="text-[#3D6B52]">-AI</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#8C8680]">
                Smart Voice Grocery Assistant
              </span>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <Search size={16} className="absolute left-4 text-[#8C8680]" />
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void runTranscript(typed)
                  setTyped('')
                }
              }}
              placeholder='Try "Add 2 bananas" or "పాల ప్యాకెట్ కావాలి"...'
              className="h-11 w-full rounded-full border border-[#E8E2DA] bg-white pl-11 pr-10 text-sm text-[#2D2A26] placeholder-[#8C8680] outline-none transition-all focus:border-[#3D6B52] focus:ring-3 focus:ring-[#3D6B52]/10"
            />
            {typed && (
              <button
                type="button"
                onClick={() => {
                  void runTranscript(typed)
                  setTyped('')
                }}
                className="absolute right-2 grid h-7 w-7 place-items-center rounded-full bg-[#3D6B52] text-white text-xs"
              >
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Right Navigation & Locale Selector */}
          <div className="flex items-center gap-4">
            <LanguageSelect value={lang} onChange={setLang} />

            {/* Cart Counter Button */}
            <div className="relative flex items-center gap-2 rounded-full border border-[#E8E2DA] bg-white px-4 py-2 shadow-xs transition hover:border-[#3D6B52]/40">
              <ShoppingBag size={18} className="text-[#3D6B52]" />
              <span className="text-xs font-bold text-[#2D2A26]">Cart ({cartCount})</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E07A5F] px-1 text-[10px] font-bold text-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section with Skanvi Editorial Aesthetic ===== */}
      <header className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          
          {/* Left Hero Narrative */}
          <div className="flex flex-col justify-center lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3D6B52]/20 bg-[#3D6B52]/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#3D6B52] w-fit">
              <Sparkles size={13} />
              <span>Multilingual Voice Grocery Intelligence</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.1] text-[#2D2A26] font-medium">
              Effortless Groceries,<br />
              <span className="text-[#3D6B52] italic font-normal">Commanded by Voice.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-[#6B655F]">
              Speak naturally in <strong>Telugu (తెలుగు)</strong>, <strong>Hindi (हिन्दी)</strong>, or <strong>English</strong>. 
              Smartcart-AI parses items, auto-categorizes, tracks consumption cycles, and curates proactive restock suggestions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onMicStart}
                className="btn-primary flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold shadow-md cursor-pointer"
              >
                <span>Hold to Speak</span>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs">🎙️</span>
              </button>

              <span className="text-xs text-[#8C8680] font-medium">
                Try saying: <em>"2 లీటర్ల పాలు"</em> or <em>"Add 6 eggs"</em>
              </span>
            </div>
          </div>

          {/* Right Hero Visual Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 rounded-3xl bg-[#E8F0EB]/60 p-6 border border-[#E8E2DA]">
            <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-[#FAF5EF]">
                <img
                  src="https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80"
                  alt="Organic Milk"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2A26]">Organic Milk</h3>
                  <p className="text-xs text-[#8C8680]">Dairy · ₹64</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd('milk', 'dairy')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#3D6B52]/10 text-[#3D6B52] transition hover:bg-[#3D6B52] hover:text-white"
                  title="Quick Add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-[#FAF5EF]">
                <img
                  src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80"
                  alt="Robusta Bananas"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2A26]">Robusta Bananas</h3>
                  <p className="text-xs text-[#8C8680]">Produce · ₹48</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd('bananas', 'produce')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#3D6B52]/10 text-[#3D6B52] transition hover:bg-[#3D6B52] hover:text-white"
                  title="Quick Add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-[#FAF5EF]">
                <img
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
                  alt="Sourdough Bread"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2A26]">Sourdough Bread</h3>
                  <p className="text-xs text-[#8C8680]">Grains · ₹85</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd('bread', 'grains')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#3D6B52]/10 text-[#3D6B52] transition hover:bg-[#3D6B52] hover:text-white"
                  title="Quick Add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-[#FAF5EF]">
                <img
                  src="https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=400&q=80"
                  alt="Brown Eggs"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#2D2A26]">Farm Brown Eggs</h3>
                  <p className="text-xs text-[#8C8680]">Dairy · ₹92</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd('eggs', 'dairy')}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#3D6B52]/10 text-[#3D6B52] transition hover:bg-[#3D6B52] hover:text-white"
                  title="Quick Add"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ===== Featured Fresh Essentials (Direct Skanvi-Style Hover Pop Strip) ===== */}
      <section className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[#2D2A26]">Featured Essentials</h2>
            <p className="text-xs text-[#8C8680]">Hover to zoom · Tap '+' to add directly to your active list</p>
          </div>
          <span className="text-xs font-semibold text-[#3D6B52] uppercase tracking-wider">Fresh Restocks</span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {CATALOG_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#E8E2DA] bg-white p-3 shadow-xs transition-all duration-300 hover:border-[#3D6B52]/50 hover:shadow-lg hover:-translate-y-1"
            >
              {/* Image with 3D Pop Out Effect on Hover */}
              <div className="relative aspect-square w-full overflow-visible rounded-xl bg-[#FAF5EF]">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="h-full w-full rounded-xl object-cover transition-all duration-300 ease-out transform-gpu group-hover:scale-125 group-hover:z-30 group-hover:shadow-2xl"
                />
                {prod.badge && (
                  <span className="absolute top-1 left-1 z-10 rounded-md bg-[#FAF5EF]/90 px-1.5 py-0.5 text-[9px] font-bold text-[#3D6B52] backdrop-blur-xs">
                    {prod.badge}
                  </span>
                )}
              </div>

              <div className="mt-3">
                <h4 className="line-clamp-1 text-xs font-semibold text-[#2D2A26] transition group-hover:text-[#3D6B52]">
                  {prod.name}
                </h4>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D6B52]">{prod.price}</span>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(prod.name, prod.category)}
                    className="grid h-6 w-6 place-items-center rounded-full bg-[#3D6B52] text-white text-xs transition hover:scale-110"
                    title={`Add ${prod.name}`}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Category Filter Bar ===== */}
      <section className="border-y border-[#E8E2DA] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-4 scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`cat-card shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-all ${
              activeCategory === null
                ? 'border-[#3D6B52] bg-[#3D6B52] text-white shadow-xs'
                : 'border-[#E8E2DA] bg-white text-[#8C8680] hover:border-[#D4CCC2] hover:text-[#2D2A26]'
            }`}
          >
            All Items
          </button>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={`cat-card shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                activeCategory === key
                  ? 'border-[#3D6B52] bg-[#3D6B52] text-white shadow-xs'
                  : 'border-[#E8E2DA] bg-white text-[#8C8680] hover:border-[#D4CCC2] hover:text-[#2D2A26]'
              }`}
            >
              <span className="mr-1.5">{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== Main Content Workspace ===== */}
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-8 pb-36 lg:grid-cols-12">
        {/* Active Shopping List Section */}
        <section className="lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#2D2A26]">
                Shopping Cart
              </h2>
              <p className="mt-0.5 text-xs text-[#8C8680]">
                {items.length} unique item{items.length !== 1 ? 's' : ''} on your active list
              </p>
            </div>
            {query && (
              <button
                type="button"
                className="rounded-full border border-[#E07A5F]/30 bg-[#E07A5F]/8 px-3.5 py-1.5 text-xs font-semibold text-[#E07A5F] transition hover:bg-[#E07A5F]/15"
                onClick={() => setQuery(null)}
              >
                Clear filter: "{query}" &times;
              </button>
            )}
          </div>

          <ShoppingList
            items={activeCategory ? filteredItems : items}
            query={query}
            onQty={async (id, qty) => {
              await api.patchItem(id, { quantity: qty })
              await refresh()
            }}
            onDelete={async (id) => {
              await api.deleteItem(id)
              await refresh()
            }}
            onComplete={async (id) => {
              const res = await api.completeItem(id)
              setItems(res.items)
              toast(res.message, 'ok')
              const sug = await api.suggestions()
              setSuggestions(sug.suggestions)
            }}
          />
        </section>

        {/* Predictive Suggestions & Restock Panel */}
        <section className="lg:col-span-5">
          <SuggestionsPanel
            suggestions={suggestions}
            method={method}
            onAdd={async (item, category) => {
              await api.addItem(item, 1, category)
              toast(`Added ${item} to cart`, 'ok')
              await refresh()
            }}
            onAddSubstitute={async (item) => {
              await api.addItem(item, 1, 'other')
              toast(`Added ${item} to cart`, 'ok')
              await refresh()
            }}
          />
        </section>
      </main>

      {/* ===== Fixed Floating Voice & Command Bar ===== */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E2DA] bg-[#FAF5EF]/95 px-6 py-4 shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <form
            className="flex w-full max-w-xl gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              void runTranscript(typed)
              setTyped('')
            }}
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8680]" />
              <input
                id="command-input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder='Type: "పాల ప్యాకెట్" or "add 2 dozen bananas"...'
                className="h-12 w-full rounded-full border border-[#E8E2DA] bg-white pl-11 pr-4 text-sm text-[#2D2A26] placeholder-[#8C8680] outline-none transition-all focus:border-[#3D6B52] focus:ring-3 focus:ring-[#3D6B52]/10"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary grid h-12 w-12 shrink-0 place-items-center rounded-full shadow-md cursor-pointer"
              title="Send Command"
            >
              {busy ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            </button>
          </form>

          <VoiceDock
            supported={voice.supported}
            listening={voice.isListening}
            interim={voice.interim}
            onHoldStart={onMicStart}
            onHoldEnd={() => voice.stop()}
          />
        </div>
      </footer>
    </div>
  )
}
