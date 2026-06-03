'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Navigation, Users, Settings, DollarSign } from 'lucide-react';
import { useCreateRideMutation, useUpdateRideMutation, useGetUsersQuery } from '@/store/api';
import { LocationMap } from '@/components/ui/LocationMap';
import { cn } from '@/lib/utils';

interface RideModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: any | null;
}

const TABS = [
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'routing', label: 'Routing (Map)', icon: Navigation },
  { id: 'financials', label: 'Financials', icon: DollarSign },
  { id: 'settings', label: 'Trip Settings', icon: Settings },
];

export function RideModal({ isOpen, onClose, ride }: RideModalProps) {
  const [activeTab, setActiveTab] = useState('participants');
  
  const [createRide, { isLoading: isCreating }] = useCreateRideMutation();
  const [updateRide, { isLoading: isUpdating }] = useUpdateRideMutation();
  const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery({});
  
  const [pickup, setPickup] = useState<{lat: number, lng: number} | null>(null);
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (ride) {
      setPickup(ride.pickup || null);
      setDestination(ride.destination || null);

      reset({ 
        user: ride.user?.documentId || ride.user?.id || '',
        driver: ride.driver?.documentId || ride.driver?.id || '',
        
        vehicleType: ride.vehicleType || 'car',
        rideType: ride.rideType || 'uberX',
        paymentMethod: ride.paymentMethod || 'cash',
        status: ride.status || 'pending',
        
        distanceKm: ride.distanceKm || '',
        recommendedPrice: ride.recommendedPrice || '',
        userOfferedPrice: ride.userOfferedPrice || '',
        finalPrice: ride.finalPrice || '',
        
        waitingTimeMinutes: ride.waitingTimeMinutes || 0,
        waitingFee: ride.waitingFee || 0,
        cancellationFeeApplied: ride.cancellationFeeApplied || 0,
        
        isEmergency: ride.isEmergency || false,
        scheduledAt: ride.scheduledAt ? new Date(ride.scheduledAt).toISOString().slice(0, 16) : '',
      });
    } else {
      setPickup(null);
      setDestination(null);
      reset({
        user: '', driver: '', vehicleType: 'car', rideType: 'uberX', paymentMethod: 'cash', status: 'pending',
        distanceKm: '', recommendedPrice: '', userOfferedPrice: '', finalPrice: '',
        waitingTimeMinutes: 0, waitingFee: 0, cancellationFeeApplied: 0,
        isEmergency: false, scheduledAt: ''
      });
    }
  }, [ride, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating;

  let users = [];
  if (userData) users = userData;
  else if (userData?.data) users = userData.data;
  else if (userData?.users) users = userData.users;

  const onSubmit = async (data: any) => {
    try {
      if (!pickup || !destination) {
        showAlert('Please set both Pickup and Destination on the map.');
        return;
      }

      const payload: any = {
        pickup,
        destination,
        vehicleType: data.vehicleType,
        rideType: data.rideType,
        paymentMethod: data.paymentMethod,
        status: data.status,
        
        distanceKm: parseFloat(data.distanceKm) || 0,
        recommendedPrice: parseFloat(data.recommendedPrice) || 0,
        userOfferedPrice: parseFloat(data.userOfferedPrice) || 0,
        finalPrice: parseFloat(data.finalPrice) || 0,
        
        waitingTimeMinutes: parseInt(data.waitingTimeMinutes) || 0,
        waitingFee: parseFloat(data.waitingFee) || 0,
        cancellationFeeApplied: parseFloat(data.cancellationFeeApplied) || 0,
        
        isEmergency: data.isEmergency,
      };

      if (data.user) payload.user = data.user;
      if (data.driver) payload.driver = data.driver;
      if (data.scheduledAt) payload.scheduledAt = new Date(data.scheduledAt).toISOString();

      if (ride) {
        await updateRide({ documentId: ride.documentId || ride.id, ...payload }).unwrap();
      } else {
        await createRide(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save ride:', error);
      showAlert(error.message || error?.data?.error?.message || 'Failed to save ride.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Navigation className="w-6 h-6 text-primary" />
              Ride Commander
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {ride ? `Editing Ride ID: ` : 'Dispatching New Ride'}
              {ride && <span className="font-semibold text-foreground">{ride.documentId || ride.id}</span>}
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

          <form id="ride-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'participants' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Participants</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Passenger (User)</label>
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
                  <label className="block text-sm font-semibold mb-1">Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="searching_driver">Searching Driver</option>
                    <option value="accepted">Accepted</option>
                    <option value="on_way">On Way to Pickup</option>
                    <option value="in_progress">In Progress (Driving)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Ride Type</label>
                  <select {...register('rideType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="uberX">Standard (uberX)</option>
                    <option value="comfort">Comfort</option>
                    <option value="indriver">InDriver Mode (Bidding)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={activeTab === 'routing' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Routing & Locations</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <LocationMap 
                    label="Pickup Location" 
                    position={pickup} 
                    onChange={setPickup} 
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <LocationMap 
                    label="Destination Location" 
                    position={destination} 
                    onChange={setDestination} 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Distance (Kilometers)</label>
                  <input type="number" step="any" {...register('distanceKm')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'financials' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Pricing & Fees</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Recommended Price</label>
                  <input type="number" step="any" {...register('recommendedPrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">User Offered Price</label>
                  <input type="number" step="any" {...register('userOfferedPrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-primary">Final Price (Paid)</label>
                  <input type="number" step="any" {...register('finalPrice')} className="w-full px-3 py-2 border-2 border-primary/50 bg-primary/5 rounded-lg" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-1">Waiting Time (Mins)</label>
                  <input type="number" {...register('waitingTimeMinutes')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Waiting Fee ($)</label>
                  <input type="number" step="any" {...register('waitingFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cancellation Fee ($)</label>
                  <input type="number" step="any" {...register('cancellationFeeApplied')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Payment Method</label>
                  <select {...register('paymentMethod')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="cash">Cash</option>
                    <option value="wallet">In-App Wallet</option>
                    <option value="online">Credit Card</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={activeTab === 'settings' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Trip Settings</h3>
              
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-red-500/30 rounded-xl bg-red-500/10 w-fit pr-8">
                <input type="checkbox" {...register('isEmergency')} className="w-5 h-5 rounded text-red-500" />
                <div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400">Emergency Ride</p>
                  <p className="text-xs text-red-600/80">Flags this trip as an urgent priority SOS dispatch.</p>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Scheduled At (Pre-Booking)</label>
                  <input type="datetime-local" {...register('scheduledAt')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Vehicle Type</label>
                  <select {...register('vehicleType')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="car">Car (Sedan/SUV)</option>
                    <option value="motorcycle">Motorcycle (Scooter/Bike)</option>
                    <option value="bus">Bus / Van</option>
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
            form="ride-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {ride ? 'Save Trip Changes' : 'Dispatch New Ride'}
          </button>
        </div>

      </div>
    </div>
  );
}
