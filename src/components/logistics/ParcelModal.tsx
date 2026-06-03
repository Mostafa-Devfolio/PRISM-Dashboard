'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, MapPin, Package, Users, Settings, DollarSign, Text } from 'lucide-react';
import { useCreateParcelMutation, useUpdateParcelMutation, useGetUsersQuery } from '@/store/api';
import { LocationMap } from '@/components/ui/LocationMap';
import { cn } from '@/lib/utils';

interface ParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: any | null;
}

const TABS = [
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'locations', label: 'Locations (Map)', icon: MapPin },
  { id: 'sender', label: 'Sender Details', icon: Text },
  { id: 'receiver', label: 'Receiver Details', icon: Package },
  { id: 'financials', label: 'Pricing & Status', icon: DollarSign },
];

export function ParcelModal({ isOpen, onClose, parcel }: ParcelModalProps) {
  const [activeTab, setActiveTab] = useState('participants');
  
  const [createParcel, { isLoading: isCreating }] = useCreateParcelMutation();
  const [updateParcel, { isLoading: isUpdating }] = useUpdateParcelMutation();
  const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery({});
  
  const [pickupLocation, setPickupLocation] = useState<{lat: number, lng: number} | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<{lat: number, lng: number} | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (parcel) {
      setPickupLocation(parcel.pickupLocation || { lat: parcel.pickupLat, lng: parcel.pickupLng } || null);
      setDropoffLocation(parcel.dropoffLocation || { lat: parcel.dropoffLat, lng: parcel.dropoffLng } || null);

      reset({ 
        user: parcel.user?.documentId || parcel.user?.id || '',
        driver: parcel.driver?.documentId || parcel.driver?.id || '',
        
        senderName: parcel.senderName || '',
        senderPhone: parcel.senderPhone || '',
        senderAddress: parcel.senderAddress || '',
        
        receiverName: parcel.receiverName || '',
        receiverPhone: parcel.receiverPhone || '',
        recipientAddress: parcel.recipientAddress || parcel.dropoffAddress || '',
        
        parcelTypeString: parcel.parcelTypeString || '',
        generalNotes: parcel.generalNotes || '',
        
        distanceKm: parcel.distanceKm || '',
        deliveryFee: parcel.deliveryFee || '',
        estimatedPrice: parcel.estimatedPrice || '',
        
        deliveryStatus: parcel.deliveryStatus || 'pending',
        paymentStatus: parcel.paymentStatus || 'pending',
        paymentMethod: parcel.paymentMethod || 'cash',
        payer: parcel.payer || 'sender',

        scheduledAt: parcel.scheduledAt ? new Date(parcel.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setPickupLocation(null);
      setDropoffLocation(null);
      reset({
        user: '', driver: '', senderName: '', senderPhone: '', senderAddress: '',
        receiverName: '', receiverPhone: '', recipientAddress: '', parcelTypeString: '', generalNotes: '',
        distanceKm: '', deliveryFee: '', estimatedPrice: '',
        deliveryStatus: 'pending', paymentStatus: 'pending', paymentMethod: 'cash', payer: 'sender',
        scheduledAt: ''
      });
    }
  }, [parcel, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating;

  let users = [];
  if (userData) users = userData;
  else if (userData?.data) users = userData.data;
  else if (userData?.users) users = userData.users;

  const onSubmit = async (data: any) => {
    try {
      if (!pickupLocation || !dropoffLocation) {
        showAlert('Please set both Pickup and Dropoff locations on the map.');
        return;
      }

      const payload: any = {
        pickupLocation,
        dropoffLocation,
        pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng,
        dropoffLat: dropoffLocation.lat,
        dropoffLng: dropoffLocation.lng,

        senderName: data.senderName,
        senderPhone: data.senderPhone,
        senderAddress: data.senderAddress,

        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        recipientAddress: data.recipientAddress,

        parcelTypeString: data.parcelTypeString,
        generalNotes: data.generalNotes,

        distanceKm: parseFloat(data.distanceKm) || 0,
        deliveryFee: parseFloat(data.deliveryFee) || 0,
        estimatedPrice: parseFloat(data.estimatedPrice) || 0,

        deliveryStatus: data.deliveryStatus,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        payer: data.payer,
      };

      if (data.user) payload.user = data.user;
      if (data.driver) payload.driver = data.driver;
      if (data.scheduledAt) payload.scheduledAt = new Date(data.scheduledAt).toISOString();

      if (parcel) {
        await updateParcel({ documentId: parcel.documentId || parcel.id, ...payload }).unwrap();
      } else {
        await createParcel(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save parcel:', error);
      showAlert(error.message || error?.data?.error?.message || 'Failed to save parcel.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Parcel Dispatcher
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {parcel ? `Editing Parcel ID: ` : 'Dispatching New Parcel'}
              {parcel && <span className="font-semibold text-foreground">{parcel.documentId || parcel.id}</span>}
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

          <form id="parcel-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'participants' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Participants & Status</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Customer (User)</label>
                  {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                    <select {...register('user')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                      <option value="">-- Unassigned --</option>
                      {users.map((u: any) => <option key={u.id} value={u.documentId || u.id}>{u.username} ({u.email})</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Assigned Driver</label>
                  {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                    <select {...register('driver')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                      <option value="">-- Searching / Unassigned --</option>
                      {users.map((u: any) => <option key={u.id} value={u.documentId || u.id}>{u.username} ({u.email})</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Delivery Status</label>
                  <select {...register('deliveryStatus')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted (Assigned)</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="delivered">Delivered Successfully</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Parcel Type Description</label>
                  <input {...register('parcelTypeString')} placeholder="e.g. Documents, Electronics, Heavy Box" className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">General Notes</label>
                  <textarea {...register('generalNotes')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="Handle with care, call upon arrival..." />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Scheduled At</label>
                  <input type="datetime-local" {...register('scheduledAt')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'locations' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Routing & Locations</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <LocationMap 
                    label="Pickup Location" 
                    position={pickupLocation} 
                    onChange={setPickupLocation} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <LocationMap 
                    label="Dropoff Location" 
                    position={dropoffLocation} 
                    onChange={setDropoffLocation} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Total Distance (Kilometers)</label>
                  <input type="number" step="any" {...register('distanceKm')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'sender' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Sender Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Sender Name</label>
                  <input {...register('senderName')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Sender Phone</label>
                  <input {...register('senderPhone')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Detailed Sender Address</label>
                  <textarea {...register('senderAddress')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'receiver' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Receiver Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Receiver Name <span className="text-red-500">*</span></label>
                  <input {...register('receiverName')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold mb-1">Receiver Phone <span className="text-red-500">*</span></label>
                  <input {...register('receiverPhone')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Detailed Dropoff Address</label>
                  <textarea {...register('recipientAddress')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'financials' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Pricing & Payment</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Estimated Price</label>
                  <input type="number" step="any" {...register('estimatedPrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-primary">Final Delivery Fee</label>
                  <input type="number" step="any" {...register('deliveryFee')} className="w-full px-3 py-2 border-2 border-primary/50 bg-primary/5 rounded-lg" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Payment Method</label>
                  <select {...register('paymentMethod')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="cash">Cash</option>
                    <option value="visa">Visa (Card)</option>
                    <option value="wallet">In-App Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Who is Paying?</label>
                  <select {...register('payer')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="sender">Sender Pays at Pickup</option>
                    <option value="receiver">Receiver Pays at Dropoff</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Payment Status</label>
                  <select {...register('paymentStatus')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="paid">Paid Successfully</option>
                    <option value="failed">Payment Failed</option>
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
            form="parcel-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {parcel ? 'Save Parcel Changes' : 'Dispatch Parcel'}
          </button>
        </div>

      </div>
    </div>
  );
}
