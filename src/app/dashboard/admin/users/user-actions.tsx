'use client'

import { useState, useTransition } from "react"
import { deleteUser } from "@/actions/user-management"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Copy, UserCog, Mail } from "lucide-react"
import { toast } from "sonner"

interface UserActionsProps {
  userId: string
  email: string
  name: string
}

export function UserActionsMenu({ userId, email, name }: UserActionsProps) {
  const [isPending, startTransition] = useTransition()

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
    toast.success("Email copied to clipboard")
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteUser(userId)
        if (result.success) {
          toast.success(result.message)
        } else {
          toast.error(result.message)
        }
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 data-[state=open]:bg-slate-100 transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px] bg-white border-slate-200">
        <DropdownMenuLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Actions
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={handleCopyEmail} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
          <Copy className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Copy Email
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
          <UserCog className="mr-2 h-3.5 w-3.5 text-slate-400" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => window.location.href = `mailto:${email}`} className="cursor-pointer text-slate-700 focus:bg-slate-50 focus:text-slate-900">
          <Mail className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Send Email
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          disabled={isPending}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          {isPending ? "Deleting..." : "Delete User"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}