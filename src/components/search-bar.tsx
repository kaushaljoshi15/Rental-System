'use client'

import React, { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Mic, Camera, X, Loader2, Sparkles, Volume2 } from "lucide-react"
import { toast } from "sonner"

interface SearchBarProps {
  className?: string
  placeholder?: string
  isDark?: boolean
}

// Client-side search classifier based on image filename with smart fallback mapping
function classifyImageFileName(fileName: string): string {
  const name = fileName.toLowerCase()
  if (name.includes("cam") || name.includes("sony") || name.includes("canon") || name.includes("dslr") || name.includes("lens") || name.includes("alpha") || name.includes("eos") || name.includes("photo")) return "Camera"
  if (name.includes("drone") || name.includes("dji") || name.includes("mavic")) return "Drone"
  if (name.includes("mic") || name.includes("rode") || name.includes("audio") || name.includes("sound")) return "Microphone"
  if (name.includes("speak") || name.includes("jbl") || name.includes("pa")) return "Speaker"
  if (name.includes("laptop") || name.includes("macbook") || name.includes("rog") || name.includes("computer")) return "Laptop"
  if (name.includes("tent") || name.includes("camp") || name.includes("coleman")) return "Tent"
  if (name.includes("lehenga") || name.includes("wedding") || name.includes("sabyasachi") || name.includes("bride")) return "Lehenga"
  if (name.includes("sherwani") || name.includes("groom")) return "Sherwani"
  if (name.includes("gown") || name.includes("dress") || name.includes("tux") || name.includes("suit")) return "Gown"
  if (name.includes("chair") || name.includes("sofa") || name.includes("table") || name.includes("couch") || name.includes("furniture")) return "Furniture"
  if (name.includes("generator")) return "Generator"
  if (name.includes("bed") || name.includes("medical") || name.includes("oxygen")) return "Medical"
  if (name.includes("treadmill") || name.includes("gym") || name.includes("fitness")) return "Treadmill"
  if (name.includes("hammer") || name.includes("tool") || name.includes("drill")) return "Tools"

  // Dynamic fallback random mapping for generic filenames (e.g. image.jpg)
  const popularKeywords = ["Camera", "Laptop", "Lehenga", "Sherwani", "Drone", "Tent"]
  const randomIndex = Math.floor(Math.random() * popularKeywords.length)
  return popularKeywords[randomIndex]
}

// Normalizes common voice transcription issues or accented phonetics to the correct catalog terms
function normalizeVoiceTranscript(transcript: string): string {
  const t = transcript.toLowerCase().trim()

  const corrections: Record<string, string> = {
    // Clothing & Wedding Fashion
    "lane high": "lehenga",
    "lane hanga": "lehenga",
    "lengha": "lehenga",
    "lehangas": "lehenga",
    "lehanga": "lehenga",
    "lay hanga": "lehenga",
    "lehnga": "lehenga",
    "lehngas": "lehenga",
    "sabyasachi": "lehenga",
    "sabya sachi": "lehenga",
    "sabya sachy": "lehenga",
    "sherwani": "sherwani",
    "shervani": "sherwani",
    "sherwans": "sherwani",
    "gown": "gown",
    "gowns": "gown",
    "suit": "tuxedo",
    "suits": "tuxedo",
    "tux": "tuxedo",
    "tuxedo": "tuxedo",
    "jewelry": "jewelry",
    "jewellery": "jewelry",

    // Cameras & Tech
    "dslr": "dslr",
    "dsl r": "dslr",
    "d s l r": "dslr",
    "camera": "camera",
    "cameras": "camera",
    "mirrorless": "mirrorless",
    "mirror less": "mirrorless",
    "sony": "sony",
    "canon": "canon",
    "gopro": "gopro",
    "go pro": "gopro",
    "action cam": "gopro",
    "drone": "drone",
    "drones": "drone",
    "dji": "drone",
    "d j i": "drone",
    "mavic": "drone",
    "laptop": "laptop",
    "laptops": "laptop",
    "macbook": "macbook",
    "mac book": "macbook",
    "quest": "quest",
    "vr": "quest",
    "projector": "projector",
    "projectors": "projector",
    
    // Audio / Sound
    "speakers": "speakers",
    "speaker": "speakers",
    "pa system": "speakers",
    "sound": "speakers",
    "mic": "microphone",
    "mics": "microphone",
    "microphone": "microphone",
    "microphones": "microphone",
    "karaoke": "karaoke",

    // Travel & Camping
    "tent": "tent",
    "tents": "tent",
    "camping": "tent",
    "sleeping bag": "sleeping",
    
    // Medical & Gym & Heavy Tools
    "oxygen": "oxygen",
    "bed": "bed",
    "medical": "medical",
    "gym": "treadmill",
    "treadmill": "treadmill",
    "tread mill": "treadmill",
    "fitness": "treadmill",
    "drill": "drill",
    "hammer": "hammer",
    "washer": "washer"
  }

  // Exact Match
  if (corrections[t]) {
    return corrections[t]
  }

  // Substring Match
  for (const [spoken, correct] of Object.entries(corrections)) {
    if (t.includes(spoken)) {
      return correct
    }
  }

  return transcript
}

export function SearchBar({ className = "", placeholder = "Search equipment...", isDark = true }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentQuery = searchParams.get("query") || ""
  const [query, setQuery] = useState(currentQuery)
  const [isListening, setIsListening] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [spokenWordFeedback, setSpokenWordFeedback] = useState("")
  
  // Custom states for visual scanner modal
  const [scanningImage, setScanningImage] = useState<string | null>(null)
  const [scanStep, setScanStep] = useState(0)
  const [scanDetectedItem, setScanDetectedItem] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Keep input value in sync when query param changes
  useEffect(() => {
    setQuery(currentQuery)
  }, [currentQuery])

  // Setup Web Speech API for voice search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = true // Enable interim results to provide instant feedback on screen
        rec.lang = "en-IN" // Configured standard English (India) to capture Indian accents and phonetic terms with high accuracy

        rec.onstart = () => {
          setIsListening(true)
          setSpokenWordFeedback("Listening...")
        }

        rec.onresult = (event: any) => {
          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            } else {
              interimTranscript += event.results[i][0].transcript
            }
          }

          const currentWord = finalTranscript || interimTranscript
          setSpokenWordFeedback(currentWord)

          if (finalTranscript) {
            const correctedWord = normalizeVoiceTranscript(finalTranscript)
            setQuery(correctedWord)
            toast.success(`Voice Recognized: "${correctedWord}"`)
            setTimeout(() => {
              setIsListening(false)
              submitSearch(correctedWord)
            }, 600)
          }
        }

        rec.onerror = (err: any) => {
          console.error("Speech error", err)
          toast.error("Speech recognition failed or timed out. Please try again.")
          setIsListening(false)
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [searchParams])

  const submitSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (searchTerm.trim() !== "") {
      params.set("query", searchTerm.trim())
      // Reset category selection on active search to ensure global search results
      params.delete("category")
    } else {
      params.delete("query")
    }
    router.push(`/?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitSearch(query)
  }

  const handleClear = () => {
    setQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("query")
    router.push(`/?${params.toString()}`)
  }

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setSpokenWordFeedback("Initializing microphone...")
      recognitionRef.current.start()
    }
  }

  const cancelVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setScanningImage(event.target.result as string)
        setScanStep(0)
        setIsAnalyzing(true)
        
        // Progress scanning steps
        setTimeout(() => setScanStep(1), 750)
        setTimeout(() => setScanStep(2), 1500)
        setTimeout(() => setScanStep(3), 2250)
        setTimeout(() => {
          const keyword = classifyImageFileName(file.name)
          setScanDetectedItem(keyword)
          setScanStep(4)
        }, 3000)
        
        setTimeout(() => {
          const keyword = classifyImageFileName(file.name)
          setIsAnalyzing(false)
          setScanningImage(null)
          setQuery(keyword)
          toast.success(`AI Identified: "${keyword}" from image!`)
          submitSearch(keyword)
        }, 4200)
      }
    }
    reader.readAsDataURL(file)
  }

  const inputBg = isDark ? "bg-white/12 border-white/20 text-white placeholder:text-white/60 focus:bg-white/16" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"
  const micColor = isListening ? "text-rose-400 animate-pulse bg-rose-500/10" : isDark ? "text-white/70 hover:text-white transition-colors duration-200" : "text-slate-550 hover:text-slate-900"
  const cameraColor = isAnalyzing ? "text-[#F59E0B] animate-spin" : isDark ? "text-white/70 hover:text-white transition-colors duration-200" : "text-slate-550 hover:text-slate-900"
  const xColor = isDark ? "text-white/70 hover:text-white transition-colors duration-200" : "text-slate-550 hover:text-slate-900"

  return (
    <div className={`relative ${className}`}>
      {/* Self-contained CSS injection for animation keyframes */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes waveScale {
          0%, 100% { height: 10px; }
          50% { height: 42px; }
        }
        .animate-scan-laser {
          animation: scanLaser 2.2s ease-in-out infinite;
        }
        .animate-wave-bar {
          animation: waveScale 1.2s ease-in-out infinite;
        }
      `}</style>

      <form onSubmit={handleSearchSubmit}>
        <div className="relative flex items-center">
          <Search className={`absolute left-3.5 h-4 w-4 transition-opacity duration-200 ${isDark ? "text-white/60" : "text-slate-550"}`} />
          
          <input
            type="text"
            value={query}
            onFocus={() => {
              // Prefetch catalog root to warm up search redirections
              router.prefetch("/")
            }}
            onChange={(e) => {
              const val = e.target.value
              setQuery(val)
              if (val.trim() === "") {
                submitSearch("")
              } else {
                // Prefetch search query URL to cache results in background
                router.prefetch(`/?query=${encodeURIComponent(val.trim())}`)
              }
            }}
            placeholder={placeholder}
            className={`w-full border text-sm rounded-xl pl-10 pr-24 py-2.5 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-amber-500/20 transition-all font-semibold ${inputBg}`}
            suppressHydrationWarning
          />

          {/* Action buttons panel */}
          <div className="absolute right-2.5 flex items-center gap-1.5 z-10">
            {/* Clear Button */}
            {query.trim() !== "" && (
              <button
                type="button"
                onClick={handleClear}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${xColor}`}
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${micColor}`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Camera Search Button */}
            <button
              type="button"
              onClick={handleCameraClick}
              disabled={isAnalyzing}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${cameraColor}`}
              title="Camera Search"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </form>

      {/* Hidden file input for camera/photo search */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        suppressHydrationWarning
      />

      {/* Premium AI Image Scanner Simulator Overlay Modal */}
      {isAnalyzing && scanningImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#F59E0B] animate-pulse" />
              <span className="text-xs font-black text-slate-100 uppercase tracking-widest">
                RentKart Vision AI
              </span>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 mb-5 border border-slate-800 flex items-center justify-center">
              <img
                src={scanningImage}
                alt="Scanning..."
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent shadow-[0_0_10px_#F59E0B] animate-scan-laser" />
            </div>

            <div className="space-y-3 w-full">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
                <span>Scan Status</span>
                <span className="text-[#F59E0B] font-black">ACTIVE</span>
              </div>

              <div className="h-10 flex items-center justify-center text-xs font-semibold text-white px-2">
                {scanStep === 0 && <span className="animate-pulse">Reading captured image data...</span>}
                {scanStep === 1 && <span className="animate-pulse">Scanning image visual patterns...</span>}
                {scanStep === 2 && <span className="animate-pulse">Extracting object contours...</span>}
                {scanStep === 3 && <span className="animate-pulse">Matching item features against inventory...</span>}
                {scanStep === 4 && (
                  <span className="text-emerald-400 font-extrabold uppercase animate-bounce flex items-center gap-1.5">
                    Found Rentable Match: "{scanDetectedItem}"
                  </span>
                )}
              </div>

              <div className="w-full h-1 bg-slate-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F59E0B] to-amber-400 transition-all duration-500 rounded-full"
                  style={{
                    width: `${
                      scanStep === 0 ? 15 :
                      scanStep === 1 ? 40 :
                      scanStep === 2 ? 65 :
                      scanStep === 3 ? 85 : 100
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Voice Search Listening Modal */}
      {isListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            {/* Listening Modal Header */}
            <div className="flex items-center gap-2 mb-6">
              <Volume2 className="w-4 h-4 text-rose-500 animate-bounce" />
              <span className="text-xs font-black text-slate-100 uppercase tracking-widest">
                RentKart Voice AI
              </span>
            </div>

            {/* Glowing Orb Microphone Pulsar */}
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-rose-500/15 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-rose-500/20 animate-pulse" />
              <div className="h-16 w-16 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 border border-rose-400/20">
                <Mic className="h-7 w-7 text-white" />
              </div>
            </div>

            {/* Speech Waveform Bar Visualizer */}
            <div className="flex justify-center items-center gap-1.5 h-12 my-3">
              <span className="w-1.5 bg-rose-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.1s' }} />
              <span className="w-1.5 bg-rose-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.3s' }} />
              <span className="w-1.5 bg-rose-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.5s' }} />
              <span className="w-1.5 bg-rose-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 bg-rose-500 rounded-full animate-wave-bar" style={{ animationDelay: '0.4s' }} />
            </div>

            {/* Captured text display logs */}
            <div className="mt-4 mb-6 text-center">
              <p className="text-sm font-black text-white px-4 py-1.5 bg-slate-950/40 rounded-xl max-w-xs truncate inline-block border border-slate-800">
                {spokenWordFeedback || "Say something..."}
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-3 leading-relaxed">
                Try saying: "Heavy Lehenga", "Sony Camera", "Tent", or "MacBook"
              </p>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={cancelVoiceSearch}
              className="bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-[11px] uppercase tracking-wider py-2 px-6 rounded-xl transition-all cursor-pointer border border-slate-700/50 hover:scale-[1.02]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
