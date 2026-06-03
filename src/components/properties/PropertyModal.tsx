'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Building, UserCheck, ShieldAlert, MapPin, Settings2, Code, FileText, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { useUpdatePropertyMutation, useCreatePropertyMutation, useGetUsersQuery, useGetRoomsQuery, useDeleteRoomMutation } from '@/store/api';
import { cn } from '@/lib/utils';
import { RoomModal } from './RoomModal';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
}

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: FileText },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'settings', label: 'Settings & Offers', icon: Settings2 },
  { id: 'rooms', label: 'Rooms & Pricing', icon: Layers },
  { id: 'json', label: 'Advanced (JSON Data)', icon: Code },
  { id: 'ownership', label: 'Ownership & Visibility', icon: ShieldAlert },
];

export function PropertyModal({ isOpen, onClose, property }: PropertyModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation();
  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({});
  
  const propertyId = property?.documentId || property?.id;
  const { data: roomsRes, isLoading: isLoadingRooms } = useGetRoomsQuery({ propertyId }, { skip: !propertyId });
  const [deleteRoom] = useDeleteRoomMutation();
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const rooms = roomsRes?.data || [];
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (property) {
      reset({ 
        name: property.name || '', 
        propertyType: property.propertyType || 'hotel',
        description: property.description || '',
        starRating: property.starRating || 1,
        isFeatured: property.isFeatured || false,
        country: property.country || '',
        city: property.city || '',
        address: property.address || '',
        latitude: property.latitude || '',
        longitude: property.longitude || '',
        paymentRequirement: property.paymentRequirement || 'pay_at_checkin',
        offersAirportShuttle: property.offersAirportShuttle || false,
        offersCarRental: property.offersCarRental || false,
        offersAirportTaxi: property.offersAirportTaxi || false,
        earlyBookerDiscountPercent: property.earlyBookerDiscountPercent || 0,
        geniusDiscountPercent: property.geniusDiscountPercent || 0,
        importantInformation: property.importantInformation || '',
        
        // JSON Fields (convert object to string for editing)
        amenities: property.amenities ? JSON.stringify(property.amenities, null, 2) : '',
        availableAddons: property.availableAddons ? JSON.stringify(property.availableAddons, null, 2) : '',
        topFacilities: property.topFacilities ? JSON.stringify(property.topFacilities, null, 2) : '',
        languagesSpoken: property.languagesSpoken ? JSON.stringify(property.languagesSpoken, null, 2) : '',
        houseRules: property.houseRules ? JSON.stringify(property.houseRules, null, 2) : '',
        facilitiesCategories: property.facilitiesCategories ? JSON.stringify(property.facilitiesCategories, null, 2) : '',
        surroundings: property.surroundings ? JSON.stringify(property.surroundings, null, 2) : '',
        sustainability: property.sustainability ? JSON.stringify(property.sustainability, null, 2) : '',
        highlights: property.highlights ? JSON.stringify(property.highlights, null, 2) : '',
        faqs: property.faqs ? JSON.stringify(property.faqs, null, 2) : '',

        ownerId: property.owner?.documentId || property.owner?.id?.toString() || '',
        visibility: property.publishedAt !== null ? 'published' : 'draft'
      });
    } else {
      reset({
        name: '', propertyType: 'hotel', description: '', starRating: 1, isFeatured: false,
        country: '', city: '', address: '', latitude: '', longitude: '',
        paymentRequirement: 'pay_at_checkin', offersAirportShuttle: false, offersCarRental: false, offersAirportTaxi: false,
        earlyBookerDiscountPercent: 0, geniusDiscountPercent: 0, importantInformation: '',
        amenities: '', availableAddons: '', topFacilities: '', languagesSpoken: '', houseRules: '', facilitiesCategories: '', surroundings: '', sustainability: '', highlights: '', faqs: '',
        ownerId: '', visibility: 'published'
      });
    }
  }, [property, reset, isOpen]);

  if (!isOpen) return null;

  const usersArray = usersData?.data || [];
  const vendorUsers = usersArray.filter((u: any) => {
    const roleName = u.role?.name?.toLowerCase() || '';
    return roleName.includes('vendor') || roleName.includes('owner') || roleName.includes('admin');
  });
  const selectableUsers = vendorUsers.length > 0 ? vendorUsers : usersArray;

  const onSubmit = async (data: any) => {
    try {
      const parseJsonSafely = (str: string, fieldName: string) => {
        if (!str || str.trim() === '') return null;
        try {
          return JSON.parse(str);
        } catch (e) {
          throw new Error(`Invalid JSON format in ${fieldName}`);
        }
      };

      const isPublished = data.visibility === 'published';
      
      const payload: any = {
        name: data.name,
        propertyType: data.propertyType,
        description: data.description,
        starRating: parseInt(data.starRating) || 1,
        isFeatured: data.isFeatured,
        country: data.country,
        city: data.city,
        address: data.address,
        latitude: parseFloat(data.latitude) || null,
        longitude: parseFloat(data.longitude) || null,
        paymentRequirement: data.paymentRequirement,
        offersAirportShuttle: data.offersAirportShuttle,
        offersCarRental: data.offersCarRental,
        offersAirportTaxi: data.offersAirportTaxi,
        earlyBookerDiscountPercent: parseInt(data.earlyBookerDiscountPercent) || 0,
        geniusDiscountPercent: parseInt(data.geniusDiscountPercent) || 0,
        importantInformation: data.importantInformation,
        
        amenities: parseJsonSafely(data.amenities, 'Amenities'),
        availableAddons: parseJsonSafely(data.availableAddons, 'Available Addons'),
        topFacilities: parseJsonSafely(data.topFacilities, 'Top Facilities'),
        languagesSpoken: parseJsonSafely(data.languagesSpoken, 'Languages Spoken'),
        houseRules: parseJsonSafely(data.houseRules, 'House Rules'),
        facilitiesCategories: parseJsonSafely(data.facilitiesCategories, 'Facilities Categories'),
        surroundings: parseJsonSafely(data.surroundings, 'Surroundings'),
        sustainability: parseJsonSafely(data.sustainability, 'Sustainability'),
        highlights: parseJsonSafely(data.highlights, 'Highlights'),
        faqs: parseJsonSafely(data.faqs, 'FAQs'),

        publishedAt: isPublished ? new Date().toISOString() : null,
      };

      if (data.ownerId) {
        payload.owner = data.ownerId;
      }

      if (propertyId) {
        await updateProperty({ documentId: propertyId, ...payload }).unwrap();
      } else {
        await createProperty(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save property:', error);
      alert(error.message || 'Failed to save property.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-6xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" />
              {propertyId ? 'Advanced Property Editor' : 'Create New Property'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{propertyId ? `Editing: ` : 'Creating new listing on the platform'}<span className="font-semibold text-foreground">{property?.name}</span></p>
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

          <form id="property-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Property Name</label>
                  <input {...register('name')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Property Type</label>
                  <select {...register('propertyType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg capitalize">
                    <option value="hotel">Hotel</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="resort">Resort</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Star Rating (1-5)</label>
                  <input type="number" min="1" max="5" {...register('starRating')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Important Information (The Fine Print)</label>
                  <textarea {...register('importantInformation')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="Rules, check-in instructions, etc." />
                </div>
              </div>
            </div>

            <div className={activeTab === 'location' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Location & Coordinates</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Country</label>
                  <input {...register('country')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">City</label>
                  <input {...register('city')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Full Address</label>
                  <input {...register('address')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Latitude</label>
                  <input type="number" step="any" {...register('latitude')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Longitude</label>
                  <input type="number" step="any" {...register('longitude')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'settings' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Settings & Offers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Payment Requirement</label>
                  <select {...register('paymentRequirement')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="pay_at_checkin">Pay at Check-in</option>
                    <option value="prepay_online">Prepay Online</option>
                  </select>
                </div>
                <div className="flex flex-col justify-center gap-3 mt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isFeatured')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                    <span className="text-sm font-medium">Featured Property</span>
                  </label>
                </div>
                
                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Transport Services</h4>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('offersAirportShuttle')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Airport Shuttle</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('offersAirportTaxi')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Airport Taxi</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('offersCarRental')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Car Rental</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 mt-4">Discounts</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Early Booker Discount (%)</label>
                      <input type="number" min="0" max="100" {...register('earlyBookerDiscountPercent')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Genius Discount (%)</label>
                      <input type="number" min="0" max="100" {...register('geniusDiscountPercent')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={activeTab === 'rooms' ? 'block space-y-6' : 'hidden'}>
              <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
                <h3 className="text-lg font-bold">Rooms & Pricing Configuration</h3>
                <button 
                  type="button"
                  onClick={() => {
                    if (!propertyId) {
                      alert('Please save the property first before adding rooms.');
                      return;
                    }
                    setSelectedRoom(null);
                    setIsRoomModalOpen(true);
                  }}
                  className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Room / Option
                </button>
              </div>

              {!propertyId ? (
                <div className="p-8 text-center bg-muted/20 border border-border rounded-xl">
                  <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h4 className="font-medium text-foreground">Save Property First</h4>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">You need to create and save the basic property details before you can attach rooms and pricing configurations to it.</p>
                </div>
              ) : isLoadingRooms ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading rooms...</p>
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center bg-muted/20 border border-border rounded-xl">
                  <h4 className="font-medium text-foreground">No Rooms Found</h4>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">Add your first room, apartment variation, or pricing option.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room: any) => (
                    <div key={room.id} className="flex items-center justify-between p-4 border border-border bg-card rounded-lg hover:border-primary/50 transition-colors">
                      <div>
                        <h4 className="font-bold text-foreground">{room.name || room.roomType}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>Capacity: {room.capacity} adults</span>
                          <span>Base Price: ${room.basePrice}/night</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => { setSelectedRoom(room); setIsRoomModalOpen(true); }} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={async () => {
                          if (confirm('Delete this room?')) {
                            try { await deleteRoom(room.documentId || room.id).unwrap(); }
                            catch (e: any) { alert('Failed to delete room'); }
                          }
                        }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={activeTab === 'json' ? 'block space-y-6' : 'hidden'}>
              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                  <strong>Warning:</strong> These fields map directly to Strapi JSON arrays and objects. Ensure your text is perfectly formatted JSON before saving, or the update will fail.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Top Facilities</label>
                  <textarea {...register('topFacilities')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Amenities</label>
                  <textarea {...register('amenities')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">House Rules</label>
                  <textarea {...register('houseRules')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">FAQs</label>
                  <textarea {...register('faqs')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Surroundings</label>
                  <textarea {...register('surroundings')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Available Addons</label>
                  <textarea {...register('availableAddons')} rows={4} className="w-full px-3 py-2 bg-background border border-border rounded-lg font-mono text-xs" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'ownership' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Security & Assignment</h3>
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 border border-blue-500/20 bg-blue-500/5 rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <UserCheck className="w-5 h-5" />
                    Ownership Transfer
                  </h3>
                  <p className="text-xs text-muted-foreground">Transfer full management rights for this property.</p>
                  
                  {isLoadingUsers ? (
                    <div className="text-sm flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin"/> Loading owners...</div>
                  ) : (
                    <select {...register('ownerId')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                      <option value="">-- No Owner Assigned --</option>
                      {selectableUsers.map((u: any) => (
                        <option key={u.documentId || u.id} value={u.documentId || u.id}>
                          {u.username} ({u.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                    Visibility Control (Block)
                  </h3>
                  <p className="text-xs text-muted-foreground">Unpublish this property to hide it globally.</p>
                  
                  <select {...register('visibility')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="published">Published (Live & Visible)</option>
                    <option value="draft">Draft (Blocked & Hidden)</option>
                  </select>
                </div>
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
            form="property-form"
            disabled={isUpdating || isCreating}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {(isUpdating || isCreating) && <Loader2 className="w-4 h-4 animate-spin" />}
            {propertyId ? 'Save All Changes' : 'Create Property'}
          </button>
        </div>

      </div>
      
      {isRoomModalOpen && (
        <RoomModal 
          isOpen={isRoomModalOpen} 
          onClose={() => setIsRoomModalOpen(false)} 
          room={selectedRoom} 
          propertyId={propertyId} 
        />
      )}
    </div>
  );
}
