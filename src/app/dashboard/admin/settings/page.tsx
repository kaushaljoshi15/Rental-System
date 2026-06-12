import { requireRole } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Settings, FolderPlus, Trash2, Tag, Info } from "lucide-react";
import { createCategory, deleteCategory } from "@/actions/admin";
import { revalidatePath } from "next/cache";

export default async function SettingsPage() {
  await requireRole(["ADMIN"]);

  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" }
  });

  // Server Action wrappers inside the Server Component
  async function handleCreateCategory(formData: FormData) {
    "use server";
    const res = await createCategory(formData);
    if (res.error) {
      // Typically we'd use toast in a client component, here we just revalidate or redirect
      // Since it's server-side, revalidation updates the UI.
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    "use server";
    await deleteCategory(categoryId);
    revalidatePath("/dashboard/admin/settings");
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar role="ADMIN" />
      <div className="flex-1 ml-64">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 shadow-sm backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-none">Global Configurations</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Configure categories, rules, and variables</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Form: Add Category (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <div className="h-1.5 bg-indigo-600 w-full" />
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FolderPlus className="w-4 h-4 text-indigo-600" />
                    New Venue Category
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Create new types of rentable halls, banquet spaces, or lawn categories.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={handleCreateCategory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Category Name</label>
                      <Input 
                        name="name" 
                        placeholder="e.g. Banquet Halls, Marriage Lawns" 
                        required 
                        className="bg-white border-slate-200 text-sm focus-visible:ring-indigo-500 h-10 rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Description</label>
                      <textarea 
                        name="description" 
                        placeholder="Detail the target purpose or layout capacity range..."
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">Icon / Cover Image URL</label>
                      <Input 
                        name="image" 
                        placeholder="https://images.unsplash.com/... or leave blank" 
                        className="bg-white border-slate-200 text-sm focus-visible:ring-indigo-500 h-10 rounded-lg"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 rounded-lg shadow-sm">
                      Create Category
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Commission Rule Box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" /> System Note
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Categories must have unique names. Deleting a category is only allowed if there are no existing halls or products listed under it.
                </p>
              </div>
            </div>

            {/* Right List: Categories Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Active Category Catalog ({categories.length})</h3>
              
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {categories.length === 0 ? (
                    <div className="p-16 text-center space-y-2">
                      <Tag className="w-8 h-8 text-slate-400 mx-auto opacity-50" />
                      <p className="text-sm font-bold text-slate-800">No categories found</p>
                      <p className="text-xs text-slate-500">Create a category to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <div key={cat.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-50 border border-indigo-100 overflow-hidden flex items-center justify-center shadow-sm">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                              ) : (
                                <Tag className="w-4 h-4 text-indigo-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-extrabold text-slate-900">{cat.name}</p>
                              <p className="text-xs text-slate-400 font-semibold line-clamp-1 mt-0.5 max-w-[280px]">
                                {cat.description || "No description provided."}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold text-[10px]">
                              {cat._count.products} Product{cat._count.products !== 1 ? 's' : ''}
                            </Badge>
                            
                            <form action={handleDeleteCategory.bind(null, cat.id)}>
                              <Button 
                                type="submit" 
                                variant="ghost" 
                                size="sm" 
                                disabled={cat._count.products > 0}
                                className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                title={cat._count.products > 0 ? "Cannot delete category containing active products" : "Delete category"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
