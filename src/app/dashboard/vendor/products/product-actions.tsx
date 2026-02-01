'use client'

import { useState, useTransition } from "react"
import { deleteProduct } from "@/actions/product-management"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function ProductActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm("Permanently delete this product?")) {
      startTransition(async () => {
        const result = await deleteProduct(productId)
        if (result.success) {
          toast.success(result.message)
          window.location.reload()
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 bg-white/90 backdrop-blur-sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        
        <Link href={`/products/${productId}`}>
          <DropdownMenuItem className="cursor-pointer">
            <Eye className="mr-2 h-3.5 w-3.5 text-slate-500" /> View Details
          </DropdownMenuItem>
        </Link>

        <Link href={`/dashboard/vendor/products/${productId}/edit`}>
          <DropdownMenuItem className="cursor-pointer">
            <Edit className="mr-2 h-3.5 w-3.5 text-slate-500" /> Edit Product
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDelete} disabled={isPending} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
