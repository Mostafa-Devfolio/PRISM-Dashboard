'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Grid, Eye, CheckCircle2, XCircle, Loader2, AlertCircle, Plus, Briefcase, ChevronRight } from 'lucide-react';
import { useGetCategoriesQuery } from '@/store/api';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, error } = useGetCategoriesQuery({ page, pageSize: 25 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const rawCategories = response?.data || [];
  const meta = response?.meta?.pagination;

  const handleEdit = (cat: any) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const columns = [
    { key: 'name', header: 'Category Name', render: (c: any) => (
      <div>
        <p className="font-bold text-foreground flex items-center gap-2">
          {c.parent && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          {c.name}
        </p>
        <p className="text-xs text-muted-foreground">/{c.slug}</p>
      </div>
    )},
    { key: 'businessType', header: 'Business Type', render: (c: any) => (
      <div className="flex items-center gap-1.5 text-sm">
        {c.businessType ? (
          <>
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <span>{c.businessType.name}</span>
          </>
        ) : (
          <span className="text-muted-foreground italic">Global</span>
        )}
      </div>
    )},
    { key: 'hierarchy', header: 'Hierarchy', render: (c: any) => (
      <span className={cn(
        "px-2 py-1 rounded-md text-xs font-medium",
        c.parent ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
      )}>
        {c.parent ? `Subcategory of ${c.parent.name}` : 'Top Level Category'}
      </span>
    )},
    { key: 'order', header: 'Order', render: (c: any) => (
      <span className="text-sm font-medium">{c.order || 0}</span>
    )},
    { key: 'status', header: 'Status', render: (c: any) => {
      const isActive = c.isActive !== false;
      return (
        <span className={cn(
          "px-2.5 py-1 rounded-md text-xs font-medium flex items-center w-fit gap-1.5",
          isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
        )}>
          {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    }},
    { key: 'actions', header: 'Actions', render: (c: any) => (
      <button onClick={() => handleEdit(c)} title="Manage Category" className="p-1.5 text-muted-foreground hover:text-primary transition-colors bg-muted rounded-md hover:bg-primary/10">
        <Eye className="w-4 h-4" />
      </button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Grid className="w-6 h-6 text-primary" />
            Categories & Subcategories
          </h1>
          <p className="text-muted-foreground">Manage the product taxonomy and hierarchy for all business types.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Loading categories...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border shadow-sm text-red-500">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p className="font-medium">Failed to load categories. Check Strapi connection.</p>
        </div>
      ) : (
        <DataTable 
          data={rawCategories} 
          columns={columns} 
          title="Category Registry" 
          description={meta ? `Showing page ${meta.page} of ${meta.pageCount} (${meta.total} total categories).` : `${rawCategories.length} total categories and subcategories.`}
          pagination={meta ? { page: meta.page, pageCount: meta.pageCount, onPageChange: setPage } : undefined}
        />
      )}

      {isModalOpen && (
        <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} category={selectedCategory} />
      )}
    </div>
  );
}
