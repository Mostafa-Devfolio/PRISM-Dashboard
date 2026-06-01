'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Loader2, Calendar, User, Home, DollarSign, Plug, Settings, FileText, Plus, Trash2 } from 'lucide-react';
import { 
  useCreateBookingMutation, 
  useUpdateBookingMutation, 
  useGetUsersQuery,
  useGetPropertiesQuery
} from '@/store/api';
import { cn } from '@/lib/utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any | null;
}

const TABS = [
  { id: 'guest', label: 'Guest Details', icon: User },
  { id: 'reservation', label: 'Reservation Data', icon: Home },
  { id: 'rooms', label: 'Booked Rooms', icon: Calendar },
  { id: 'addons', label: 'Add-ons & Extras', icon: Plug },
  { id: 'financials', label: 'Financials & Status', icon: DollarSign },
  { id: 'settings', label: 'Sync & Settings', icon: Settings },
];

export function BookingModal({ isOpen, onClose, booking }: BookingModalProps) {
  const [activeTab, setActiveTab] = useState('guest');
  
  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery({});
  const { data: propertyData, isLoading: isLoadingProperties } = useGetPropertiesQuery({});
  
  const { register, control, handleSubmit, reset } = useForm<any>({
    defaultValues: {
      bookedRooms: [],
      selectedAddons: [],
      guest: '', guestFirstName: '', guestLastName: '', guestEmail: '', guestPhone: '', isKycVerified: false,
      property: '', checkInDate: '', checkOutDate: '',
      totalAmount: '', paymentMethod: 'online', cancellationPolicyApplied: '', status: 'pending',
      specialRequests: '', externalSource: '', externalId: '',
      bookingFor: 'main_guest', travelForWork: false, arrivalTime: '',
      airportShuttleRequested: false, rentalCarRequested: false, airportTaxiRequested: false, paperlessConfirmation: true
    }
  });

  const { fields: roomFields, append: appendRoom, remove: removeRoom } = useFieldArray({
    control,
    name: "bookedRooms"
  });

  const { fields: addonFields, append: appendAddon, remove: removeAddon } = useFieldArray({
    control,
    name: "selectedAddons"
  });

  useEffect(() => {
    if (booking) {
      reset({ 
        guest: booking.guest?.documentId || booking.guest?.id || '',
        guestFirstName: booking.guestFirstName || '',
        guestLastName: booking.guestLastName || '',
        guestEmail: booking.guestEmail || '',
        guestPhone: booking.guestPhone || '',
        isKycVerified: booking.isKycVerified || false,
        
        property: booking.property?.documentId || booking.property?.id || '',
        checkInDate: booking.checkInDate || '',
        checkOutDate: booking.checkOutDate || '',
        
        bookedRooms: booking.bookedRooms || [],
        selectedAddons: booking.selectedAddons || [],
        
        totalAmount: booking.totalAmount || '',
        paymentMethod: booking.paymentMethod || 'online',
        cancellationPolicyApplied: booking.cancellationPolicyApplied || '',
        status: booking.status || 'pending',
        
        specialRequests: booking.specialRequests || '',
        externalSource: booking.externalSource || '',
        externalId: booking.externalId || '',
        
        bookingFor: booking.bookingFor || 'main_guest',
        travelForWork: booking.travelForWork || false,
        arrivalTime: booking.arrivalTime || '',
        
        airportShuttleRequested: booking.airportShuttleRequested || false,
        rentalCarRequested: booking.rentalCarRequested || false,
        airportTaxiRequested: booking.airportTaxiRequested || false,
        paperlessConfirmation: booking.paperlessConfirmation !== false,
      });
    } else {
      reset({
        bookedRooms: [], selectedAddons: [],
        guest: '', guestFirstName: '', guestLastName: '', guestEmail: '', guestPhone: '', isKycVerified: false,
        property: '', checkInDate: '', checkOutDate: '',
        totalAmount: '', paymentMethod: 'online', cancellationPolicyApplied: '', status: 'pending',
        specialRequests: '', externalSource: '', externalId: '',
        bookingFor: 'main_guest', travelForWork: false, arrivalTime: '',
        airportShuttleRequested: false, rentalCarRequested: false, airportTaxiRequested: false, paperlessConfirmation: true
      });
    }
  }, [booking, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating;

  let users = userData?.data || [];
  let properties = propertyData?.data || [];

  const onSubmit = async (data: any) => {
    try {
      if (!data.checkInDate || !data.checkOutDate) {
        alert('Check-in and Check-out dates are required.');
        return;
      }
      if (!data.totalAmount) {
        alert('Total Amount is required.');
        return;
      }

      const payload: any = {
        guestFirstName: data.guestFirstName,
        guestLastName: data.guestLastName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        isKycVerified: data.isKycVerified,
        
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        
        bookedRooms: data.bookedRooms.map((r: any) => ({
          ...r,
          quantity: parseInt(r.quantity) || 1,
          pricePerNight: parseFloat(r.pricePerNight) || 0,
          guests: parseInt(r.guests) || 1,
        })),
        selectedAddons: data.selectedAddons.map((a: any) => ({
          ...a,
          price: parseFloat(a.price) || 0,
        })),
        
        totalAmount: parseFloat(data.totalAmount),
        paymentMethod: data.paymentMethod,
        cancellationPolicyApplied: data.cancellationPolicyApplied,
        status: data.status,
        
        specialRequests: data.specialRequests,
        externalSource: data.externalSource,
        externalId: data.externalId,
        
        bookingFor: data.bookingFor,
        travelForWork: data.travelForWork,
        arrivalTime: data.arrivalTime,
        
        airportShuttleRequested: data.airportShuttleRequested,
        rentalCarRequested: data.rentalCarRequested,
        airportTaxiRequested: data.airportTaxiRequested,
        paperlessConfirmation: data.paperlessConfirmation,
      };

      if (data.guest) payload.guest = data.guest;
      if (data.property) payload.property = data.property;

      if (booking) {
        await updateBooking({ documentId: booking.documentId || booking.id, ...payload }).unwrap();
      } else {
        await createBooking(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save booking:', error);
      alert(error.message || error?.data?.error?.message || 'Failed to save booking.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-5xl h-full max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Advanced Booking Editor
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {booking ? `Editing Booking ID: ` : 'Creating Manual Booking'}
              {booking && <span className="font-semibold text-foreground">{booking.documentId || booking.id}</span>}
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

          <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 relative">
            
            <div className={activeTab === 'guest' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Guest Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Linked App User (Optional)</label>
                  {isLoadingUsers ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                    <select {...register('guest')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                      <option value="">-- No linked account --</option>
                      {users.map((u: any) => <option key={u.id} value={u.documentId || u.id}>{u.username} ({u.email})</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">First Name</label>
                  <input {...register('guestFirstName')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Last Name</label>
                  <input {...register('guestLastName')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" {...register('guestEmail')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone Number</label>
                  <input {...register('guestPhone')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div className="col-span-2 mt-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl bg-emerald-500/10 w-fit pr-8">
                    <input type="checkbox" {...register('isKycVerified')} className="w-5 h-5 rounded text-emerald-500" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">KYC Verified</p>
                      <p className="text-xs text-muted-foreground">Guest identity documents have been approved.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className={activeTab === 'reservation' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Reservation Data</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1">Property</label>
                  {isLoadingProperties ? <Loader2 className="w-4 h-4 animate-spin"/> : (
                    <select {...register('property')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                      <option value="">-- Unassigned Property --</option>
                      {properties.map((p: any) => <option key={p.id} value={p.documentId || p.id}>{p.name || p.title}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Check-in Date <span className="text-red-500">*</span></label>
                  <input type="date" {...register('checkInDate')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Check-out Date <span className="text-red-500">*</span></label>
                  <input type="date" {...register('checkOutDate')} required className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Estimated Arrival Time</label>
                  <input type="time" {...register('arrivalTime')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Booking For</label>
                  <select {...register('bookingFor')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="main_guest">Main Guest</option>
                    <option value="someone_else">Someone Else</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input type="checkbox" {...register('travelForWork')} className="w-4 h-4 rounded text-primary" />
                    <span className="text-sm font-medium">Guest is traveling for work</span>
                  </label>
                </div>
              </div>
            </div>

            <div className={activeTab === 'rooms' ? 'block space-y-6' : 'hidden'}>
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <h3 className="text-lg font-bold">Booked Rooms Array</h3>
                <button 
                  type="button" 
                  onClick={() => appendRoom({ roomTypeId: '', quantity: 1, pricePerNight: 0, guests: 1 })}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Room
                </button>
              </div>
              
              {roomFields.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  No rooms added yet. Click "Add Room" to assign a room to this booking.
                </div>
              )}

              <div className="space-y-4">
                {roomFields.map((item, index) => (
                  <div key={item.id} className="p-4 border border-border bg-muted/10 rounded-xl relative group">
                    <button 
                      type="button" 
                      onClick={() => removeRoom(index)}
                      className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-sm font-bold mb-3">Room #{index + 1}</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-xs font-semibold mb-1">Room Type ID / Name</label>
                        <input {...register(`bookedRooms.${index}.roomTypeId`)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-xs font-semibold mb-1">Quantity</label>
                        <input type="number" {...register(`bookedRooms.${index}.quantity`)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-xs font-semibold mb-1">Price/Night</label>
                        <input type="number" step="any" {...register(`bookedRooms.${index}.pricePerNight`)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <label className="block text-xs font-semibold mb-1">Guests</label>
                        <input type="number" {...register(`bookedRooms.${index}.guests`)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={activeTab === 'addons' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Add-ons & Requests</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                  <input type="checkbox" {...register('airportShuttleRequested')} className="w-5 h-5 rounded text-primary" />
                  <span className="text-sm font-semibold">Airport Shuttle</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                  <input type="checkbox" {...register('airportTaxiRequested')} className="w-5 h-5 rounded text-primary" />
                  <span className="text-sm font-semibold">Airport Taxi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-border rounded-xl bg-muted/5 hover:bg-muted/10 transition-colors">
                  <input type="checkbox" {...register('rentalCarRequested')} className="w-5 h-5 rounded text-primary" />
                  <span className="text-sm font-semibold">Rental Car</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Special Requests</label>
                <textarea {...register('specialRequests')} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="Late check-in, extra bed..." />
              </div>

              <div className="flex justify-between items-center border-b border-border pb-2 mt-8 mb-4">
                <h3 className="text-lg font-bold">Selected Add-ons</h3>
                <button 
                  type="button" 
                  onClick={() => appendAddon({ name: '', price: 0 })}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {addonFields.map((item, index) => (
                  <div key={item.id} className="flex items-end gap-4 p-4 border border-border bg-muted/5 rounded-xl relative">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold mb-1">Add-on Name</label>
                      <input {...register(`selectedAddons.${index}.name`)} placeholder="e.g. Breakfast, Spa" className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    </div>
                    <div className="w-32">
                      <label className="block text-xs font-semibold mb-1">Price ($)</label>
                      <input type="number" step="any" {...register(`selectedAddons.${index}.price`)} className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-md" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeAddon(index)}
                      className="p-2 mb-0.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={activeTab === 'financials' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Financials & Status</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-primary">Total Amount Paid/Due <span className="text-red-500">*</span></label>
                  <input type="number" step="any" required {...register('totalAmount')} className="w-full px-3 py-2 border-2 border-primary/50 bg-primary/5 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Payment Method</label>
                  <select {...register('paymentMethod')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="online">Online / Card</option>
                    <option value="cash">Cash at Property</option>
                    <option value="wallet">In-App Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Reservation Status</label>
                  <select {...register('status')} className="w-full px-3 py-2 bg-background border border-border rounded-lg">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Cancellation Policy Applied</label>
                  <input {...register('cancellationPolicyApplied')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="e.g. Non-refundable, Free cancellation" />
                </div>
              </div>
            </div>

            <div className={activeTab === 'settings' ? 'block space-y-6' : 'hidden'}>
              <h3 className="text-lg font-bold border-b border-border pb-2 mb-4">Sync & Settings</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold mb-1">External Source (e.g. iCal / Airbnb)</label>
                  <input {...register('externalSource')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">External Sync UID</label>
                  <input {...register('externalId')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('paperlessConfirmation')} className="w-5 h-5 rounded text-primary" />
                <div>
                  <p className="text-sm font-bold">Paperless Confirmation</p>
                  <p className="text-xs text-muted-foreground">Do not print paper receipts.</p>
                </div>
              </label>
            </div>

          </form>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-border hover:bg-muted rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            type="submit" 
            form="booking-form"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {booking ? 'Save Booking Changes' : 'Create Reservation'}
          </button>
        </div>

      </div>
    </div>
  );
}
