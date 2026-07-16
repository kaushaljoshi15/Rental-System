import { auth } from "@/auth"
import { requireRole } from "@/lib/middleware"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProductWizard } from "../../product-wizard"

export default async function EditVendorProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  await requireRole(["VENDOR"])
  
  const { id } = await params
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const product = await prisma.product.findUnique({
    where: { id },
  })

  if (!product || product.vendorId !== user?.id) {
    redirect("/dashboard/vendor/products")
  }

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Format initialData matching wizard requirements
  const initialData = {
    id: product.id,
    name: product.name,
    description: product.description,
    priceDaily: product.priceDaily,
    priceWeekly: product.priceWeekly,
    securityDeposit: product.securityDeposit,
    totalStock: product.totalStock,
    image: product.image,
    gallery: product.gallery,
    categoryId: product.categoryId,
    amenities: product.amenities,
    rules: product.rules
  }

  return (
    <ProductWizard categories={categories} initialData={initialData} />
  )
}
