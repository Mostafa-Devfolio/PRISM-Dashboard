'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { useUpdateRideMutation, useUpdateParcelMutation } from '@/store/api';
import dynamic from 'next/dynamic';

const LogisticsMap = dynamic(() => import('./Map'), { 
  ssr: false, 
  loading: () => <div className="w-full h-[300px] bg-muted animate-pulse rounded-xl" /> 
});

interface LogisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any | null;
  type: 'rides' | 'parcels';
}

export function LogisticsModal({ isOpen, onClose, item, type }: LogisticsModalProps) {
  const [updateRide, { isLoading: isUpdatingRide }] = useUpdateRideMutation();
  const [updateParcel, { isLoading: isUpdatingParcel }] = useUpdateParcelMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { status: '' }
  });

  useEffect(() => {
    if (item) {
      reset({ status: item.status || item.deliveryStatus || 'pending' });
    }
  }, [item, reset, isOpen]);

  if (!isOpen || !item) return null;

  const onSubmit = async (data: any) => {
    try {
      if (type === 'rides') {
        await updateRide({ documentId: item.documentId || item.id, ...data }).unwrap();
      } else {
        await updateParcel({ documentId: item.documentId || item.id, deliveryStatus: data.status }).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      showAlert('Failed to update status.');
    }
  };

  const isLoading = isUpdatingRide || isUpdatingParcel;
  const isRide = type === 'rides';

  let startLoc: any = null;
  let endLoc: any = null;

  if (item) {
    if (isRide) {
      startLoc = item.pickup;
      endLoc = item.destination;
    } else {
      startLoc = item.pickupLocation;
      endLoc = item.dropoffLocation;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-xl border border-border p-6 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            {isRide ? 'Ride Details & Tracking' : 'Parcel Details & Tracking'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
          <div className="h-[300px] md:h-[400px] w-full relative z-0">
            <LogisticsMap start={startLoc} end={endLoc} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-xl border border-border">
              <h3 className="font-semibold text-sm mb-3">Booking Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">#{item.id}</span>
                </div>
                {isRide ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passenger:</span>
                      <span className="font-medium">{item.user?.username || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium">{item.driver?.username || 'Unassigned'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sender:</span>
                      <span className="font-medium">{item.senderName || item.user?.username || 'Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receiver:</span>
                      <span className="font-medium">{item.receiverName}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total Fee:</span>
                  <span className="font-bold text-primary">${item.finalPrice || item.deliveryFee || 0}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Update Status</label>
                <select 
                  {...register('status')}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                >
                  {isRide ? (
                    <>
                      <option value="pending">Pending</option>
                      <option value="searching_driver">Searching for Driver</option>
                      <option value="accepted">Accepted</option>
                      <option value="on_way">On Way</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
