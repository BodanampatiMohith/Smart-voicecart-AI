import { Mic, MicOff, Square } from 'lucide-react'

interface Props {
  supported: boolean
  listening: boolean
  interim: string
  onHoldStart: () => void
  onHoldEnd: () => void
}

export function VoiceDock({ supported, listening, interim, onHoldStart, onHoldEnd }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {listening && (
          <>
            <span className="mic-ring absolute inset-0 rounded-full bg-[#3D6B52]/25" />
            <span className="mic-ring absolute inset-0 rounded-full bg-[#3D6B52]/15 [animation-delay:400ms]" />
          </>
        )}
        <button
          type="button"
          disabled={!supported}
          onMouseDown={onHoldStart}
          onMouseUp={onHoldEnd}
          onMouseLeave={listening ? onHoldEnd : undefined}
          onTouchStart={(e) => {
            e.preventDefault()
            onHoldStart()
          }}
          onTouchEnd={onHoldEnd}
          className={`relative grid h-12 w-12 place-items-center rounded-full shadow-md transition-all duration-200 ${
            listening
              ? 'bg-[#E07A5F] text-white scale-110 shadow-lg shadow-[#E07A5F]/30'
              : supported
                ? 'bg-[#3D6B52] text-white hover:bg-[#5A8A6E] hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          aria-label={listening ? 'Stop listening' : 'Tap to speak'}
        >
          {listening ? (
            <Square size={18} fill="currentColor" />
          ) : supported ? (
            <Mic size={20} />
          ) : (
            <MicOff size={20} />
          )}
        </button>
      </div>
      <div className="text-left">
        <p className={`text-sm font-medium ${listening ? 'text-[#E07A5F]' : 'text-[#2D2A26]'}`}>
          {listening ? (interim || 'Listening...') : 'Tap to speak'}
        </p>
        <p className="text-xs text-[#8C8680]">
          {supported ? 'English, Hindi, Telugu' : 'Use Chrome or Edge for voice'}
        </p>
      </div>
    </div>
  )
}
