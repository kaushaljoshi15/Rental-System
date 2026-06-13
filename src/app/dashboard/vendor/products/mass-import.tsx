'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Check, FileText, Download, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { bulkCreateProducts } from '@/actions/vendor-actions'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface MassImportProps {
  categories: Category[]
  onClose: () => void
  onImportSuccess: () => void
}

interface ParsedProduct {
  name: string
  description: string
  priceDaily: number
  totalStock: number
  categoryId: string
}

export function MassImport({ categories, onClose, onImportSuccess }: MassImportProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedItems, setParsedItems] = useState<ParsedProduct[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file.")
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length < 2) {
      setErrors(["CSV file must contain a header row and at least one product row."])
      setParsedItems([])
      return
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
    const expectedHeaders = ["name", "description", "pricedaily", "totalstock", "categoryid"]
    
    // Check if headers match
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      setErrors([`Invalid headers. Missing: ${missingHeaders.join(", ")}. Expected headers: name, description, priceDaily, totalStock, categoryId`])
      setParsedItems([])
      return
    }

    const nameIdx = headers.indexOf("name")
    const descIdx = headers.indexOf("description")
    const priceIdx = headers.indexOf("pricedaily")
    const stockIdx = headers.indexOf("totalstock")
    const catIdx = headers.indexOf("categoryid")

    const parsed: ParsedProduct[] = []
    const validationErrors: string[] = []

    const validCategoryIds = new Set(categories.map(c => c.id))

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(",").map(cell => cell.trim())
      // In case of commas inside quotes, simple split(',') is basic, but we can do simple split or handle it
      if (row.length < expectedHeaders.length) {
        validationErrors.push(`Row ${i + 1}: Incomplete row parameters. Found ${row.length} values, expected ${expectedHeaders.length}.`)
        continue
      }

      const name = row[nameIdx]
      const description = row[descIdx]
      const priceRaw = row[priceIdx]
      const stockRaw = row[stockIdx]
      const categoryId = row[catIdx]

      // Field validation
      if (!name) {
        validationErrors.push(`Row ${i + 1}: Name is required.`)
      }

      const price = parseFloat(priceRaw)
      if (isNaN(price) || price <= 0) {
        validationErrors.push(`Row ${i + 1}: Price must be a valid number > 0. Found "${priceRaw}".`)
      }

      const stock = parseInt(stockRaw, 10)
      if (isNaN(stock) || stock < 1) {
        validationErrors.push(`Row ${i + 1}: Stock count must be an integer >= 1. Found "${stockRaw}".`)
      }

      if (!validCategoryIds.has(categoryId)) {
        validationErrors.push(`Row ${i + 1}: Category ID "${categoryId}" is not valid. Valid IDs: ${categories.map(c => c.name + ' (' + c.id + ')').join(", ")}`)
      }

      if (validationErrors.length === 0) {
        parsed.push({
          name,
          description,
          priceDaily: price,
          totalStock: stock,
          categoryId
        })
      }
    }

    setErrors(validationErrors)
    setParsedItems(parsed)
    if (validationErrors.length === 0) {
      toast.success(`Parsed ${parsed.length} items successfully. Ready to import!`)
    } else {
      toast.warning(`Found ${validationErrors.length} validation errors. Fix CSV to import.`)
    }
  }

  const handleDownloadTemplate = () => {
    const headers = "name,description,priceDaily,totalStock,categoryId\n"
    const sampleRow = `Tripod Stand,Heavy duty photography tripod stand,450,5,${categories[0]?.id || "category-uuid-1"}\n`
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleRow)
    
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", "rentalkart_bulk_products_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("CSV import template downloaded.")
  }

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0 || errors.length > 0) return

    setIsImporting(true)
    const res = await bulkCreateProducts(parsedItems)
    setIsImporting(false)

    if (res.success) {
      toast.success(res.message || "Bulk import complete.")
      onImportSuccess()
    } else {
      toast.error(res.message || "Failed to complete bulk import.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <Card className="w-full max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Bulk Mass Product Import
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-slate-400 mt-0.5">
              Upload a structured CSV spreadsheet to ingest multiple listings concurrently.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-5">

          {/* Stepper instructions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-800">
            <div className="text-left space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Step 1: Download Templates</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-350">Download the structured CSV template containing default column names.</p>
            </div>
            <Button 
              onClick={handleDownloadTemplate} 
              variant="outline"
              className="border-slate-250 dark:border-slate-800 shrink-0 text-xs font-extrabold flex items-center gap-1.5 h-9 bg-white dark:bg-slate-900"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV Template
            </Button>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 transition-all duration-150 text-center relative",
              dragActive 
                ? "border-amber-500 bg-amber-500/5" 
                : "border-slate-200 dark:border-slate-850 hover:border-amber-500/50 dark:hover:border-amber-500/50"
            )}
          >
            <input 
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-2.5">
              <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-xs font-semibold text-slate-500">
                {fileName ? (
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500" /> {fileName}
                  </span>
                ) : (
                  <span>Drag and drop your product CSV, or <span className="text-amber-500 font-extrabold">browse computer</span></span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Only UTF-8 comma-separated CSV files are parsed.</p>
            </div>
          </div>

          {/* Error logs */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-red-700 dark:text-red-400 text-xs font-extrabold">
                <AlertCircle className="w-4 h-4 shrink-0" /> Validation Errors Found ({errors.length})
              </div>
              <div className="max-h-28 overflow-y-auto divide-y divide-red-100 dark:divide-red-950/20 text-[10px] font-semibold text-red-650 dark:text-red-400/80 pr-1">
                {errors.map((err, i) => (
                  <div key={i} className="py-1">{err}</div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed list preview */}
          {parsedItems.length > 0 && errors.length === 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ingestion Preview ({parsedItems.length} Products)</h4>
              <div className="max-h-36 overflow-y-auto border border-slate-100 dark:border-slate-900 rounded-xl divide-y divide-slate-100 dark:divide-slate-900 bg-slate-50/30 dark:bg-slate-950/30">
                {parsedItems.map((item, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-[11px] font-semibold">
                    <div className="space-y-0.5">
                      <p className="text-slate-900 dark:text-slate-50 font-bold">{item.name}</p>
                      <p className="text-[9px] text-slate-450 dark:text-slate-400 line-clamp-1">{item.description || "No description provided."}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-900 dark:text-slate-100 font-black">₹{item.priceDaily.toLocaleString()}/day</p>
                      <p className="text-[9px] text-slate-400 font-bold">Stock: {item.totalStock} units</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-xs font-bold h-10 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImportSubmit}
            disabled={parsedItems.length === 0 || errors.length > 0 || isImporting}
            className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] text-xs font-extrabold px-6 h-10 rounded-xl shadow-sm"
          >
            {isImporting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            Confirm & Import Listings
          </Button>
        </div>

      </Card>
    </div>
  )
}
