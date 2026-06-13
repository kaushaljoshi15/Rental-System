'use client'

import React, { useState, useEffect } from 'react'
import { useVendor } from '@/components/vendor-context'
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Filter, 
  Reply,
  User,
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string
  product: {
    id: string
    name: string
  }
  user: {
    name: string
    email: string
  }
}

interface Product {
  id: string
  name: string
}

interface ReviewsClientProps {
  products: Product[]
  reviews: Review[]
}

export function ReviewsClient({ products, reviews }: ReviewsClientProps) {
  const { t, language } = useVendor()

  // Filter States
  const [filterRating, setFilterRating] = useState<string>('ALL')
  const [filterProduct, setFilterProduct] = useState<string>('ALL')

  // Inline Reply states
  const [replies, setReplies] = useState<Record<string, string>>({})
  const [replyInput, setReplyInput] = useState<Record<string, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)

  // Load saved replies on mount
  useEffect(() => {
    const savedReplies = localStorage.getItem('vendor_review_replies')
    if (savedReplies) {
      try {
        setReplies(JSON.parse(savedReplies))
      } catch (e) {
        console.log("Failed to load replies", e)
      }
    }
  }, [])

  // Calculate Average Rating stats
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 4.8

  const countByStars = (stars: number) => {
    return reviews.filter(r => r.rating === stars).length
  }

  // Filter Reviews logic
  const filteredReviews = reviews.filter(r => {
    const matchesRating = filterRating === 'ALL' || r.rating.toString() === filterRating
    const matchesProduct = filterProduct === 'ALL' || r.product.id === filterProduct
    return matchesRating && matchesProduct
  })

  // Submit reply action
  const handleSubmitReply = (reviewId: string) => {
    const text = replyInput[reviewId]
    if (!text || !text.trim()) {
      toast.error("Reply text cannot be empty.")
      return
    }

    const updatedReplies = {
      ...replies,
      [reviewId]: text.trim()
    }

    setReplies(updatedReplies)
    localStorage.setItem('vendor_review_replies', JSON.stringify(updatedReplies))
    setActiveReplyId(null)
    toast.success("Reply submitted successfully.")
  }

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={cn("w-3.5 h-3.5", i < count ? "fill-current" : "text-slate-200 dark:text-slate-800")} 
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
      
      {/* Left Feedback List & Filter settings (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Header toolbar */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('reviews')} & Ratings</h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs font-medium mt-1">
            Read product ratings and reply to renter comments.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full">
            
            {/* Star selector */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Product Selector */}
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="h-10 px-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 text-xs font-extrabold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500/50 flex-1 sm:flex-none"
            >
              <option value="ALL">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

          </div>
        </div>

        {/* Reviews Cards List */}
        {filteredReviews.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-16 text-center space-y-4">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">No reviews matches filters</h3>
              <p className="text-xs text-slate-550 dark:text-slate-405 mt-1">Renters reviews matching this criteria will show here.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => {
              const hasReply = !!replies[rev.id]

              return (
                <Card key={rev.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-5 space-y-4">
                    
                    {/* Header: Customer + Star ratings */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-xs border border-slate-250 shrink-0">
                          {rev.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-slate-50">{rev.user.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{rev.createdAt} • Product: <span className="text-amber-500 font-bold">{rev.product.name}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(rev.rating)}
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-extrabold uppercase">
                            <ShieldCheck className="w-3 h-3" /> Verified renter
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Renter comment */}
                    <p className="text-xs text-slate-650 dark:text-slate-400 font-medium leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Replies section */}
                    {hasReply && (
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800/50 space-y-1">
                        <p className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">Your Response</p>
                        <p className="text-xs text-slate-700 dark:text-slate-350 font-semibold leading-relaxed">
                          {replies[rev.id]}
                        </p>
                      </div>
                    )}

                    {/* Inline Reply triggers */}
                    {!hasReply && activeReplyId !== rev.id && (
                      <Button
                        onClick={() => setActiveReplyId(rev.id)}
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700 font-extrabold text-[10px] p-0 h-auto hover:bg-transparent"
                      >
                        <Reply className="w-3.5 h-3.5 mr-1" /> Reply to Comment
                      </Button>
                    )}

                    {activeReplyId === rev.id && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-900 animate-in slide-in-from-top-2 duration-150">
                        <textarea
                          value={replyInput[rev.id] || ''}
                          onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                          placeholder="Type your reply to this customer..."
                          className="w-full min-h-[60px] p-3.5 rounded-xl border-none bg-slate-50 dark:bg-slate-900 text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button 
                            onClick={() => setActiveReplyId(null)}
                            variant="ghost" 
                            className="text-[10px] font-extrabold h-8 rounded-lg"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleSubmitReply(rev.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-[#0F172A] text-[10px] font-extrabold h-8 rounded-lg shadow-sm"
                          >
                            Submit Response
                          </Button>
                        </div>
                      </div>
                    )}

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

      </div>

      {/* Right Payout stats sidebar (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-950 dark:text-white">Ratings Summary</h3>
        
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-5 rounded-xl shadow-sm space-y-6">
          
          <div className="text-center py-4 space-y-1">
            <h4 className="text-4xl font-black text-slate-900 dark:text-white">{avgRating}</h4>
            <div className="flex justify-center py-1.5">{renderStars(Math.round(avgRating))}</div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Average Seller Score</p>
          </div>

          {/* Ratings breakdown */}
          <div className="space-y-2.5 text-xs text-slate-550 dark:text-slate-400 font-extrabold">
            {([5, 4, 3, 2, 1] as const).map((stars) => {
              const count = countByStars(stars)
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="w-12 text-right">{stars} Star</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-6 text-right font-black text-slate-700 dark:text-slate-300">{count}</span>
                </div>
              )
            })}
          </div>

        </Card>
      </div>

    </div>
  )
}
