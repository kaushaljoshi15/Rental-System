import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex-1 min-h-[60vh] w-full flex flex-col items-center justify-center p-8 text-center select-none bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-200">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-3xl border border-dashed border-slate-350 dark:border-slate-800 animate-[spin_20s_linear_infinite]" />
        <div className="h-12 w-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-md">
          <Loader2 className="h-5 w-5 animate-spin text-[#F59E0B]" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-black text-slate-850 dark:text-slate-200 uppercase tracking-wider">Processing Request</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold max-w-xs leading-relaxed">
          Retrieving inventory assets and updating view state...
        </p>
      </div>
    </div>
  )
}
