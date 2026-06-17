'use client'

import { useState, useTransition } from "react"
import { approveVendor, rejectVendor } from "@/actions/admin"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Check, X, Eye, ShieldAlert, Landmark, Signature, FileText, User, Phone, MapPin, Store } from "lucide-react"

interface VendorApprovalActionsProps {
  vendor: {
    id: string
    name: string
    email: string
    companyName: string | null
    gstin: string | null
    address: string | null
    phoneNumber: string | null
    aadhaarNumber: string | null
    panNumber: string | null
    kycDocUrl: string | null
    signature: string | null
    bankDetails: string | null
  }
}

export function VendorApprovalActions({ vendor }: VendorApprovalActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveVendor(vendor.id)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleReject = () => {
    if (confirm(`Are you sure you want to reject the onboarding credentials for "${vendor.companyName || vendor.name}"?`)) {
      startTransition(async () => {
        const result = await rejectVendor(vendor.id)
        if (result.success) {
          toast.success(result.message)
          setIsOpen(false)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  return (
    <>
      <div className="flex gap-2 shrink-0">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="outline"
          className="text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-extrabold text-xs h-8 px-3 rounded-lg flex items-center gap-1 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" /> Review Onboarding
        </Button>
      </div>

      {/* KYC / Onboarding Review Details Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-900 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest px-2 py-0.5 bg-amber-50 rounded-full dark:bg-amber-950/20">
                  Seller Portal Onboarding
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Review Business Verification Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify documentation and GSTIN registry for {vendor.name}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Document Details Grid */}
            <div className="space-y-6">
              
              {/* Section: Business Info */}
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-100 dark:border-slate-900/60">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-3">
                  <Store className="w-3.5 h-3.5 text-indigo-500" /> Business Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-450 font-bold block">Company / Store Name</span>
                    <strong className="text-slate-850 dark:text-slate-200 text-sm mt-0.5 block">{vendor.companyName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-455 font-bold block">GSTIN Number (Tax ID)</span>
                    <strong className="text-slate-850 dark:text-slate-200 text-sm uppercase tracking-wide mt-0.5 block">{vendor.gstin || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-450 font-bold block">Authorized Representative</span>
                    <strong className="text-slate-850 dark:text-slate-200 mt-0.5 block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {vendor.name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-450 font-bold block">Primary Phone</span>
                    <strong className="text-slate-850 dark:text-slate-200 mt-0.5 block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {vendor.phoneNumber || "N/A"}
                    </strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-450 font-bold block">Registered Pickup / Warehouse Address</span>
                    <strong className="text-slate-800 dark:text-slate-250 font-medium mt-1 block flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> {vendor.address || "N/A"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Section: KYC Proofs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-3">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" /> Government Identity
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-450 font-bold">Aadhaar Card Number</span>
                      <strong className="text-slate-850 dark:text-slate-200 tracking-wider mt-0.5 block">{vendor.aadhaarNumber || "Not Provided"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-450 font-bold">PAN Card Number</span>
                      <strong className="text-slate-850 dark:text-slate-200 uppercase tracking-widest mt-0.5 block">{vendor.panNumber || "Not Provided"}</strong>
                    </div>
                    {vendor.kycDocUrl && (
                      <div className="pt-1">
                        <a 
                          href={vendor.kycDocUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] text-indigo-600 hover:text-indigo-700 dark:text-amber-400 font-extrabold uppercase tracking-wider underline flex items-center gap-1"
                        >
                          View Uploaded KYC Document Proof ↗
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Bank Settlements */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-3">
                    <Landmark className="w-3.5 h-3.5 text-blue-500" /> Bank Payout Account
                  </h4>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-450 font-bold block">Settlement Details</span>
                      <strong className="text-slate-850 dark:text-slate-200 font-semibold mt-1 block bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900">
                        {vendor.bankDetails || "No bank settlement accounts configured"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: e-Signature Verification */}
              <div className="border border-slate-250 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-2">
                  <Signature className="w-3.5 h-3.5 text-amber-500" /> Authorized e-Signature
                </h4>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-900 text-center font-serif text-sm italic text-slate-700 dark:text-slate-350 select-none">
                  {vendor.signature ? (
                    <div className="space-y-1">
                      <span className="text-lg font-bold tracking-wide">{vendor.signature}</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-sans block not-italic uppercase tracking-widest mt-1">
                        Digitally signed & locked for automated invoicing
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-sans not-italic">No digital signature uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex gap-3 justify-end pt-5 border-t border-slate-100 dark:border-slate-900 mt-6">
              <Button 
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl h-10 shadow-sm"
              >
                Close Review
              </Button>
              <Button 
                onClick={handleReject}
                disabled={isPending}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs h-10 px-4 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> Reject Credentials
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Approve Vendor
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
