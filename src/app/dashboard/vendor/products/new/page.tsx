import { requireRole } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"
import { ProductWizard } from "../product-wizard"

export default async function AddVendorProductPage() {
  await requireRole(["VENDOR"])
  
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <ProductWizard categories={categories} />
  )
}
