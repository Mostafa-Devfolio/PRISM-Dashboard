'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Package, Tag, Layers, Settings2, Code, UploadCloud, Image as ImageIcon, Briefcase, Store } from 'lucide-react';
import { 
  useUpdateProductMutation, 
  useCreateProductMutation, 
  useGetBusinessTypesQuery, 
  useGetCategoriesQuery, 
  useGetVendorsQuery,
  useUploadFileMutation 
} from '@/store/api';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Package },
  { id: 'pricing', label: 'Pricing & Stock', icon: Tag },
  { id: 'relations', label: 'Categorization', icon: Layers },
  { id: 'sales', label: 'Settings & Sales', icon: Settings2 },
  { id: 'images', label: 'Product Image', icon: ImageIcon },
  { id: 'json', label: 'Advanced JSON Attributes', icon: Code },
];

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  
  const { data: btData, isLoading: isLoadingBt } = useGetBusinessTypesQuery({});
  const { data: catData, isLoading: isLoadingCat } = useGetCategoriesQuery({});
  const { data: vendorData, isLoading: isLoadingVendors } = useGetVendorsQuery({});
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm();

  const watchBusinessType = watch('businessType');
  const watchParentCategory = watch('parentCategory');

  useEffect(() => {
    setSelectedFile(null);
    if (product) {
      // Determine parent vs subcategory based on Strapi response structure
      // Strapi returns populated relations. If category has a parent, it's a subcategory.
      const cat = product.category;
      const parentId = cat?.parent ? (cat.parent.documentId || cat.parent.id) : (cat?.documentId || cat?.id || '');
      const subId = cat?.parent ? (cat.documentId || cat.id) : '';

      reset({ 
        title: product.title || '', 
        slug: product.slug || '',
        description: product.description || '',
        sku: product.sku || '',
        basePrice: product.basePrice || 0,
        baseSalePrice: product.baseSalePrice || '',
        stock: product.stock || 0,
        
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        isFlashSale: product.isFlashSale || false,
        
        saleStartDate: product.saleStartDate ? new Date(product.saleStartDate).toISOString().slice(0, 16) : '',
        saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().slice(0, 16) : '',
        
        businessType: product.businessType?.documentId || product.businessType?.id || '',
        vendor: product.vendor?.documentId || product.vendor?.id || '',
        parentCategory: parentId,
        subCategory: subId,

        attributes: product.attributes ? JSON.stringify(product.attributes, null, 2) : '',
      });
    } else {
      reset({
        title: '', slug: '', description: '', sku: '',
        basePrice: 0, baseSalePrice: '', stock: 0,
        isFeatured: false, isActive: true, isFlashSale: false,
        saleStartDate: '', saleEndDate: '',
        businessType: '', vendor: '', parentCategory: '', subCategory: '',
        attributes: ''
      });
    }
  }, [product, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating || isUploading;

  const businessTypes = btData?.data || [];
  const allCategories = catData?.data || [];
  const vendors = vendorData?.data || [];

  // Filtering Logic
  const filteredVendors = watchBusinessType 
    ? vendors.filter((v: any) => (v.businessType?.documentId || v.businessType?.id)?.toString() === watchBusinessType.toString())
    : vendors;

  const topCategories = allCategories.filter((c: any) => !c.parent);
  const filteredTopCategories = watchBusinessType
    ? topCategories.filter((c: any) => (c.businessType?.documentId || c.businessType?.id)?.toString() === watchBusinessType.toString())
    : topCategories;

  const subCategories = allCategories.filter((c: any) => c.parent);
  const filteredSubCategories = watchParentCategory
    ? subCategories.filter((c: any) => (c.parent?.documentId || c.parent?.id)?.toString() === watchParentCategory.toString())
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      let imageId = null;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('files', selectedFile);
        const uploadRes = await uploadFile(formData).unwrap();
        imageId = uploadRes[0].id;
      }

      const parseJsonSafely = (str: string, fieldName: string) => {
        if (!str || str.trim() === '') return null;
        try {
          return JSON.parse(str);
        } catch (e) {
          throw new Error(`Invalid JSON format in ${fieldName}`);
        }
      };

      const payload: any = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        basePrice: parseFloat(data.basePrice) || 0,
        stock: parseInt(data.stock) || 0,
        
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        isFlashSale: data.isFlashSale,
        
        attributes: parseJsonSafely(data.attributes, 'Attributes'),
      };

      if (data.baseSalePrice) payload.baseSalePrice = parseFloat(data.baseSalePrice);
      else payload.baseSalePrice = null;

      if (data.saleStartDate) payload.saleStartDate = new Date(data.saleStartDate).toISOString();
      if (data.saleEndDate) payload.saleEndDate = new Date(data.saleEndDate).toISOString();

      if (data.businessType) payload.businessType = data.businessType;
      if (data.vendor) payload.vendor = data.vendor;
      
      const finalCategory = data.subCategory || data.parentCategory;
      if (finalCategory) payload.category = finalCategory;

      if (imageId) payload.images = imageId;

      if (product) {
        await updateProduct({ documentId: product.documentId || product.id, ...payload }).unwrap();
      } else {
        await createProduct(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      showAlert(error.message || error?.data?.error?.message || 'Failed to save product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Advanced Product Editor
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {product ? `Editing: ` : 'Creating New Product'}
              {product && <span className="font-semibold text-foreground">{product.title}</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors bg-background border border-border shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-border bg-muted/10 shrink-0 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === t.id 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Product Title <span className="text-red-500">*</span></label>
                  <input {...register('title')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Slug / URL Path <span className="text-red-500">*</span></label>
                  <input {...register('slug')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">SKU (Stock Keeping Unit)</label>
                  <input {...register('sku')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Description (Supports Rich Text in Strapi)</label>
                  <textarea {...register('description')} rows={5} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'pricing' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Pricing & Inventory</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Base Price ($) <span className="text-red-500">*</span></label>
                  <input type="number" step="any" required {...register('basePrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Base Sale Price ($) - Optional</label>
                  <input type="number" step="any" {...register('baseSalePrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="e.g. 19.99" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                  <input type="number" required {...register('stock')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'relations' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Categorization & Ownership</h3>
              <div className="grid grid-cols-1 gap-6 max-w-xl">
                <div className="p-4 border border-border bg-muted/10 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground"/> Business Type <span className="text-red-500">*</span>
                    </label>
                    {isLoadingBt ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                      <select 
                        {...register('businessType')} 
                        required 
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                        onChange={(e) => {
                          register('businessType').onChange(e);
                          setValue('vendor', '');
                          setValue('parentCategory', '');
                          setValue('subCategory', '');
                        }}
                      >
                        <option value="">-- Select Business Type --</option>
                        {businessTypes.map((b: any) => <option key={b.id} value={b.documentId || b.id}>{b.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground"/> Vendor / Seller <span className="text-red-500">*</span>
                    </label>
                    {isLoadingVendors ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                      <select {...register('vendor')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg disabled:opacity-50" disabled={!watchBusinessType}>
                        <option value="">-- Select Vendor --</option>
                        {filteredVendors.map((v: any) => <option key={v.id} value={v.documentId || v.id}>{v.storeName || v.id}</option>)}
                      </select>
                    )}
                    {!watchBusinessType && <p className="text-xs text-muted-foreground mt-1">Select a Business Type first to see vendors.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground"/> Main Category
                    </label>
                    {isLoadingCat ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                      <select 
                        {...register('parentCategory')} 
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg disabled:opacity-50"
                        disabled={!watchBusinessType}
                        onChange={(e) => {
                          register('parentCategory').onChange(e);
                          setValue('subCategory', '');
                        }}
                      >
                        <option value="">-- Select Main Category --</option>
                        {filteredTopCategories.map((c: any) => <option key={c.id} value={c.documentId || c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                  {filteredSubCategories.length > 0 && (
                    <div className="pl-6 border-l-2 border-primary/20">
                      <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground"/> Subcategory
                      </label>
                      <select {...register('subCategory')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="">-- Select Subcategory --</option>
                        {filteredSubCategories.map((c: any) => <option key={c.id} value={c.documentId || c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={activeTab === 'sales' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Settings & Sales Offers</h3>
              
              <div className="flex flex-col gap-4 mb-8">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-muted/10 w-fit pr-6">
                  <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Active (Visible)</p>
                    <p className="text-xs text-muted-foreground">Product is available to customers.</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-muted/10 w-fit pr-6">
                  <input type="checkbox" {...register('isFeatured')} className="w-5 h-5 rounded text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Featured Product</p>
                    <p className="text-xs text-muted-foreground">Highlight this on the home page.</p>
                  </div>
                </label>
              </div>

              <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-4">
                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <input type="checkbox" {...register('isFlashSale')} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-500">Enable Flash Sale</span>
                </label>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Sale Start Date</label>
                    <input type="datetime-local" {...register('saleStartDate')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Sale End Date</label>
                    <input type="datetime-local" {...register('saleEndDate')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'images' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Product Image</h3>
              <div className="relative border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <>
                    <ImageIcon className="w-12 h-12 text-primary mb-3" />
                    <p className="text-base font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                    <p className="text-base font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className={activeTab === 'json' ? 'block space-y-6' : 'hidden'}>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  <strong>Warning:</strong> This field maps directly to the Strapi JSON `attributes` array/object. Ensure your text is perfectly formatted JSON.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Raw JSON Attributes</label>
                <textarea {...register('attributes')} rows={15} className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm leading-relaxed" placeholder={`{\n  "color": "red",\n  "size": "XL"\n}`} />
              </div>
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-border hover:bg-muted rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="product-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? 'Uploading Image...' : product ? 'Save All Changes' : 'Create Product'}
          </button>
        </div>

      </div>
    </div>
  );
}
