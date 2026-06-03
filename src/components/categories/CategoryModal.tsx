'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Grid, Layers, Briefcase } from 'lucide-react';
import { useUpdateCategoryMutation, useCreateCategoryMutation, useGetBusinessTypesQuery, useGetCategoriesQuery } from '@/store/api';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null; // null means create new
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const { data: btData, isLoading: isLoadingBt } = useGetBusinessTypesQuery({});
  const { data: catData, isLoading: isLoadingCat } = useGetCategoriesQuery({});
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (category) {
      reset({ 
        name: category.name || '', 
        slug: category.slug || '',
        order: category.order || 0,
        isActive: category.isActive !== false,
        businessType: category.businessType?.documentId || category.businessType?.id || '',
        parent: category.parent?.documentId || category.parent?.id || ''
      });
    } else {
      reset({
        name: '', slug: '', order: 0, isActive: true, businessType: '', parent: ''
      });
    }
  }, [category, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating;
  
  const businessTypes = btData?.data || [];
  const allCategories = catData?.data || [];

  // Filter out the current category so it can't be its own parent
  const parentOptions = allCategories.filter((c: any) => c.id !== category?.id && c.documentId !== category?.documentId);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        name: data.name,
        slug: data.slug,
        order: parseInt(data.order) || 0,
        isActive: data.isActive,
      };

      if (data.businessType) payload.businessType = data.businessType;
      if (data.parent) payload.parent = data.parent;
      else payload.parent = null; // Important to detach parent if empty

      if (category) {
        await updateCategory({ documentId: category.documentId || category.id, ...payload }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      showAlert(error.message || 'Failed to save category.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Grid className="w-5 h-5 text-primary" />
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Category Name</label>
              <input 
                {...register('name')} 
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Slug / URL Path</label>
              <input 
                {...register('slug')} 
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
              <p className="text-xs text-muted-foreground mt-1">Unique identifier (e.g. fresh-produce)</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Display Order</label>
              <input 
                type="number"
                {...register('order')} 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Category is Active</span>
            </label>
          </div>

          <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Layers className="w-4 h-4" />
              Categorization
            </h3>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-muted-foreground" /> Business Type
              </label>
              <select 
                {...register('businessType')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">-- Select Business Type --</option>
                {businessTypes.map((b: any) => (
                  <option key={b.documentId || b.id} value={b.documentId || b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 flex items-center gap-1">
                <Grid className="w-3 h-3 text-muted-foreground" /> Parent Category
              </label>
              <select 
                {...register('parent')}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">-- None (Top Level Category) --</option>
                {parentOptions.map((c: any) => (
                  <option key={c.documentId || c.id} value={c.documentId || c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Select a parent to make this a subcategory.</p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
