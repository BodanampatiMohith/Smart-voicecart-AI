import { LANGUAGES } from '../types'

interface Props {
  value: string
  onChange: (code: string) => void
}

export function LanguageSelect({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#E8E2DA] bg-white p-1">
      {LANGUAGES.map((lang) => {
        const active = value === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.code)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-[#3D6B52] text-white shadow-sm'
                : 'text-[#8C8680] hover:text-[#2D2A26] hover:bg-[#F0EAE0]'
            }`}
          >
            {lang.native}
          </button>
        )
      })}
    </div>
  )
}
