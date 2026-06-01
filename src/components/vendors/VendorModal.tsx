'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Store, MapPin, Briefcase, Settings, Code, UploadCloud, Image as ImageIcon, Navigation } from 'lucide-react';
import { 
  useCreateVendorMutation, 
  useUpdateVendorMutation, 
  useGetBusinessTypesQuery, 
  useGetUsersQuery,
  useUploadFileMutation 
} from '@/store/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: any | null;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: Store },
  { id: 'categorization', label: 'Ownership & Type', icon: Briefcase },
  { id: 'location', label: 'Location & Delivery', icon: MapPin },
  { id: 'commission', label: 'Commission & Settings', icon: Settings },
  { id: 'advanced', label: 'Advanced JSON Data', icon: Code },
  { id: 'images', label: 'Images', icon: ImageIcon },
];

export function VendorModal({ isOpen, onClose, vendor }: VendorModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  
  const { data: btData, isLoading: isLoadingBt } = useGetBusinessTypesQuery({});
  const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery({});
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    setLogoFile(null);
    setCoverFile(null);
    if (vendor) {
      reset({ 
        name: vendor.name || '', 
        slug: vendor.slug || '',
        description: vendor.description || '',
        rating: vendor.rating || 0,
        
        isOpen: vendor.isOpen !== false,
        isActive: vendor.isActive !== false,
        
        deliveryTime: vendor.deliveryTime || '',
        deliveryFee: vendor.deliveryFee || 0,
        
        commissionType: vendor.commissionType || 'percent',
        commissionValue: vendor.commissionValue || 0,
        saleMode: vendor.saleMode || 'retail',
        
        locationLat: vendor.locationLat || '',
        locationLng: vendor.locationLng || '',
        
        deliveryZoneType: vendor.deliveryZoneType || 'radius',
        deliveryRadiusKm: vendor.deliveryRadiusKm || 0,
        
        businessType: vendor.businessType?.documentId || vendor.businessType?.id || '',
        owner: vendor.owner?.documentId || vendor.owner?.id || '',

        deliveryPolygon: vendor.deliveryPolygon ? JSON.stringify(vendor.deliveryPolygon, null, 2) : '',
      });
    } else {
      reset({
        name: '', slug: '', description: '', rating: 0,
        isOpen: true, isActive: true,
        deliveryTime: '', deliveryFee: 0,
        commissionType: 'percent', commissionValue: 0, saleMode: 'retail',
        locationLat: '', locationLng: '', deliveryZoneType: 'radius', deliveryRadiusKm: 0,
        businessType: '', owner: '',
        deliveryPolygon: ''
      });
    }
  }, [vendor, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating || isUploading;

  const businessTypes = btData?.data || [];
  let users = [];
  if (userData) users = userData;
  else if (userData?.data) users = userData.data;
  else if (userData?.users) users = userData.users;

  const onSubmit = async (data: any) => {
    try {
      let logoId = null;
      let coverId = null;
      
      if (logoFile) {
        const formData = new FormData();
        formData.append('files', logoFile);
        const uploadRes = await uploadFile(formData).unwrap();
        logoId = uploadRes[0].id;
      }
      
      if (coverFile) {
        const formData = new FormData();
        formData.append('files', coverFile);
        const uploadRes = await uploadFile(formData).unwrap();
        coverId = uploadRes[0].id;
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
        name: data.name,
        slug: data.slug,
        description: data.description,
        rating: parseFloat(data.rating) || 0,
        
        isOpen: data.isOpen,
        isActive: data.isActive,
        
        deliveryTime: data.deliveryTime,
        deliveryFee: parseFloat(data.deliveryFee) || 0,
        
        commissionType: data.commissionType,
        commissionValue: parseFloat(data.commissionValue) || 0,
        saleMode: data.saleMode,
        
        deliveryZoneType: data.deliveryZoneType,
        deliveryRadiusKm: parseFloat(data.deliveryRadiusKm) || 0,
        
        deliveryPolygon: parseJsonSafely(data.deliveryPolygon, 'Delivery Polygon'),
      };

      if (data.locationLat) payload.locationLat = parseFloat(data.locationLat);
      if (data.locationLng) payload.locationLng = parseFloat(data.locationLng);

      if (data.businessType) payload.businessType = data.businessType;
      if (data.owner) payload.owner = data.owner;

      if (logoId) payload.logo = logoId;
      if (coverId) payload.coverImage = coverId;

      if (vendor) {
        await updateVendor({ documentId: vendor.documentId || vendor.id, ...payload }).unwrap();
        toast.success('Vendor updated successfully!');
      } else {
        await createVendor(payload).unwrap();
        toast.success('Vendor created successfully!');
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save vendor:', error);
      toast.error(error.message || error?.data?.error?.message || 'Failed to save vendor.');
    }
  };

  const onInvalid = (errors: any) => {
    toast.error('Validation failed: Please ensure all required fields are filled out.');
    console.log('Form errors:', errors);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" />
              Advanced Vendor Editor
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {vendor ? `Editing: ` : 'Creating New Vendor'}
              {vendor && <span className="font-semibold text-foreground">{vendor.name}</span>}
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

          <form id="vendor-form" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Store Name <span className="text-red-500">*</span></label>
                  <input {...register('name', { required: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Slug / URL Path <span className="text-red-500">*</span></label>
                  <input {...register('slug', { required: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Description (Supports Rich Text)</label>
                  <textarea {...register('description')} rows={5} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Manual Rating (0-5)</label>
                  <input type="number" step="0.1" max="5" {...register('rating')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'categorization' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Categorization & Ownership</h3>
              <div className="grid grid-cols-1 gap-6 max-w-xl">
                <div className="p-4 border border-border bg-muted/10 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground"/> Business Type <span className="text-red-500">*</span>
                    </label>
                    {isLoadingBt ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                      <select {...register('businessType', { required: true })} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="">-- Select Business Type --</option>
                        {businessTypes.map((b: any) => <option key={b.id} value={b.documentId || b.id}>{b.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground"/> Vendor Owner (User)
                    </label>
                    {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                      <select {...register('owner')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="">-- Select Owner --</option>
                        {users.map((u: any) => <option key={u.id} value={u.documentId || u.id}>{u.username} ({u.email})</option>)}
                      </select>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Assigns management rights to this specific user.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'location' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Location & Delivery</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><Navigation className="w-4 h-4"/> Latitude</label>
                  <input type="number" step="any" {...register('locationLat')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-2"><Navigation className="w-4 h-4"/> Longitude</label>
                  <input type="number" step="any" {...register('locationLng')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Standard Delivery Time</label>
                  <input {...register('deliveryTime')} placeholder="e.g. 30-45 mins" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Base Delivery Fee ($)</label>
                  <input type="number" step="any" {...register('deliveryFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                
                <div className="col-span-2 p-5 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-4">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400">Delivery Zone Configuration</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Zone Type</label>
                      <select {...register('deliveryZoneType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                        <option value="radius">Radius (Circle)</option>
                        <option value="polygon">Polygon (Custom Points)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Radius (Kilometers)</label>
                      <input type="number" step="any" {...register('deliveryRadiusKm')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'commission' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Commission & Settings</h3>
              
              <div className="flex flex-col gap-4 mb-8">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-muted/10 w-fit pr-6">
                  <input type="checkbox" {...register('isActive')} className="w-5 h-5 rounded text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">Active (Approved)</p>
                    <p className="text-xs text-muted-foreground">Vendor is visible on the platform.</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-border rounded-lg bg-emerald-500/10 w-fit pr-6">
                  <input type="checkbox" {...register('isOpen')} className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Currently Open</p>
                    <p className="text-xs text-muted-foreground">Vendor is accepting new orders right now.</p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Commission Type</label>
                  <select {...register('commissionType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Commission Value</label>
                  <input type="number" step="any" {...register('commissionValue')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Sale Mode</label>
                  <select {...register('saleMode')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="retail">Retail Only</option>
                    <option value="wholesale">Wholesale Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={activeTab === 'images' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Vendor Images</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold mb-2">Logo (Square)</label>
                  <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group h-48">
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    {logoFile ? (
                      <><ImageIcon className="w-10 h-10 text-primary mb-2" /><p className="text-sm font-medium">{logoFile.name}</p></>
                    ) : (
                      <><UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" /><p className="text-sm font-medium">Upload Logo</p></>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Cover Image (Landscape)</label>
                  <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group h-48">
                    <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    {coverFile ? (
                      <><ImageIcon className="w-10 h-10 text-primary mb-2" /><p className="text-sm font-medium">{coverFile.name}</p></>
                    ) : (
                      <><UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-2" /><p className="text-sm font-medium">Upload Cover</p></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'advanced' ? 'block space-y-6' : 'hidden'}>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  <strong>Warning:</strong> The `deliveryPolygon` field maps directly to the Strapi JSON mapping for Geofencing polygons. Ensure your text is a valid array of GPS coordinates.
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Delivery Polygon JSON</label>
                <textarea {...register('deliveryPolygon')} rows={15} className="w-full px-4 py-3 bg-background border border-border rounded-lg font-mono text-sm leading-relaxed" placeholder={`[\n  {\n    "lat": 30.0444,\n    "lng": 31.2357\n  }\n]`} />
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
            form="vendor-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? 'Uploading...' : vendor ? 'Save All Changes' : 'Create Vendor'}
          </button>
        </div>

      </div>
    </div>
  );
}
