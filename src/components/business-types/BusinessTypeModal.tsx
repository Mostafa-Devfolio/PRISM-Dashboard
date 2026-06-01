'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Image as ImageIcon, Settings, Info, UploadCloud } from 'lucide-react';
import { useCreateBusinessTypeMutation, useUpdateBusinessTypeMutation, useUploadFileMutation } from '@/store/api';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  homeTitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  layoutType: z.enum(['food', 'market', 'commerce', 'taxi', 'parcel']),
  orderMode: z.enum(['single_vendor', 'multi_vendor']),
  isActive: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Info },
  { id: 'media', label: 'Module Icon', icon: ImageIcon },
  { id: 'config', label: 'Configuration', icon: Settings },
];

export function BusinessTypeModal({ businessType, onClose }: { businessType?: any, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(
    businessType?.icon?.url ? (businessType.icon.url.startsWith('http') ? businessType.icon.url : `${process.env.NEXT_PUBLIC_API_URL || 'https://pyramid.devfolio.net/api'}`.replace('/api', '') + businessType.icon.url) : null
  );

  const [createBusinessType, { isLoading: isCreating }] = useCreateBusinessTypeMutation();
  const [updateBusinessType, { isLoading: isUpdating }] = useUpdateBusinessTypeMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const isEditing = !!businessType;
  
  // Define restrictive types based on user requirements
  const allowLayoutChange = !isEditing;
  const allowedLayouts = ['food', 'market', 'commerce'];

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: businessType?.name || '',
      slug: businessType?.slug || '',
      homeTitle: businessType?.homeTitle || '',
      description: businessType?.description || '',
      layoutType: businessType?.layoutType || 'food',
      orderMode: businessType?.orderMode || 'single_vendor',
      isActive: businessType?.isActive ?? true,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      let iconId = businessType?.icon?.id;

      if (iconFile) {
        const formData = new FormData();
        formData.append('files', iconFile);
        const uploadRes = await uploadFile(formData).unwrap();
        if (uploadRes && uploadRes.length > 0) {
          iconId = uploadRes[0].id;
        }
      }

      const payload: any = { ...data };
      if (iconId) payload.icon = iconId;

      if (isEditing) {
        // Enforce preventing layoutType change if editing taxi/parcel
        if (!allowLayoutChange) {
          delete payload.layoutType;
        }
        await updateBusinessType({ documentId: businessType.documentId || businessType.id, ...payload }).unwrap();
      } else {
        await createBusinessType(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save business type', error);
      alert(error.message || error?.data?.error?.message || 'Failed to save module. Please try again.');
    }
  };

  const isSaving = isCreating || isUpdating || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl h-full max-h-[85vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              {isEditing ? 'Edit System Module' : 'Add Business Type Module'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing ? `Modifying: ${businessType.name}` : 'Creating a new delivery/store module'}
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

          <form id="module-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Module Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Module Name <span className="text-red-500">*</span></label>
                  <input 
                    {...register('name')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg" 
                    placeholder="e.g. Restaurants"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">URL Slug <span className="text-red-500">*</span></label>
                  <input 
                    {...register('slug')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg" 
                    placeholder="e.g. restaurants"
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">App Home Title</label>
                  <input 
                    {...register('homeTitle')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg" 
                    placeholder="e.g. Hungry? Order Now"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    {...register('description')} 
                    rows={4}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg" 
                  />
                </div>
              </div>
            </div>

            <div className={activeTab === 'media' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Module Icon</h3>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-muted/5">
                {iconPreview ? (
                  <div className="relative w-32 h-32 mb-4 rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={iconPreview} alt="Module Icon" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                
                <label className="cursor-pointer bg-background border border-border hover:bg-muted px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  {iconPreview ? 'Change Icon' : 'Upload Icon'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="text-xs text-muted-foreground mt-3">PNG, JPG up to 2MB. Square ratio recommended.</p>
              </div>
            </div>

            <div className={activeTab === 'config' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">System Configuration</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Layout Type (Core Engine)</label>
                  <select 
                    {...register('layoutType')} 
                    disabled={!allowLayoutChange}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg disabled:opacity-50 disabled:bg-muted"
                  >
                    {isEditing ? (
                      // If editing, show all options so the current one renders, but keep it disabled
                      <>
                        <option value="food">Restaurants / Food Delivery</option>
                        <option value="market">Groceries / Market</option>
                        <option value="commerce">Ecommerce / Pharmacy</option>
                        <option value="taxi">Taxi / Ride Hailing</option>
                        <option value="parcel">Parcel / Courier</option>
                      </>
                    ) : (
                      // If adding new, ONLY show the standard 3 Delivery types
                      <>
                        <option value="food">Restaurants / Food Delivery (food)</option>
                        <option value="market">Groceries / Market (market)</option>
                        <option value="commerce">Ecommerce / Pharmacy (commerce)</option>
                      </>
                    )}
                  </select>
                  {!allowLayoutChange && (
                    <p className="text-xs text-amber-600 mt-1">Core layout type cannot be changed after creation.</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Order Mode</label>
                  <select 
                    {...register('orderMode')} 
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="single_vendor">Single Vendor (Direct to Store)</option>
                    <option value="multi_vendor">Multi Vendor (Aggregator)</option>
                  </select>
                </div>

                <div className="col-span-2 mt-4">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-xl bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors w-fit pr-8">
                    <input 
                      type="checkbox" 
                      {...register('isActive')} 
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">Module is Active</span>
                      <span className="text-xs text-muted-foreground">Make this module visible and available in the app.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-border hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="module-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save Module Settings' : 'Create Module'}
          </button>
        </div>

      </div>
    </div>
  );
}
