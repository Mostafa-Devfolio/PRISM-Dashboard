'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useCreateBusTripMutation, useUpdateBusTripMutation } from '@/store/api';

const busTripSchema = z.object({
  route: z.string().min(2, 'Route is required'),
  departureTime: z.string().min(1, 'Departure time is required'),
  busNumber: z.string().min(1, 'Bus number is required'),
  totalSeats: z.coerce.number().min(10, 'Must have at least 10 seats'),
  availableSeats: z.coerce.number().min(0, 'Cannot be negative'),
  status: z.enum(['Scheduled', 'Boarding', 'In Transit', 'Completed', 'Cancelled']).default('Scheduled'),
});

type BusTripFormData = z.infer<typeof busTripSchema>;

interface BusTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any | null;
}

export function BusTripModal({ isOpen, onClose, trip }: BusTripModalProps) {
  const [createTrip, { isLoading: isCreating }] = useCreateBusTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateBusTripMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(busTripSchema),
    defaultValues: {
      route: '', departureTime: '', busNumber: '', totalSeats: 50, availableSeats: 50, status: 'Scheduled'
    }
  });

  useEffect(() => {
    if (trip) {
      reset({
        route: trip.route,
        departureTime: trip.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : '',
        busNumber: trip.busNumber,
        totalSeats: trip.totalSeats,
        availableSeats: trip.availableSeats,
        status: trip.status || 'Scheduled',
      });
    } else {
      reset({
        route: '', departureTime: '', busNumber: '', totalSeats: 50, availableSeats: 50, status: 'Scheduled'
      });
    }
  }, [trip, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: BusTripFormData) => {
    try {
      if (trip) {
        await updateTrip({ documentId: trip.documentId || trip.id, ...data }).unwrap();
      } else {
        await createTrip(data).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save trip:', error);
      showAlert('Failed to save trip.');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {trip ? 'Edit Bus Trip' : 'Schedule New Trip'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Route (e.g. Cairo - Alex)</label>
            <input {...register('route')} type="text" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground" />
            {errors.route && <p className="text-red-500 text-xs mt-1">{errors.route.message as string}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bus Number</label>
              <input {...register('busNumber')} type="text" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground" />
              {errors.busNumber && <p className="text-red-500 text-xs mt-1">{errors.busNumber.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Departure Time</label>
              <input {...register('departureTime')} type="datetime-local" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground" />
              {errors.departureTime && <p className="text-red-500 text-xs mt-1">{errors.departureTime.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Total Seats</label>
              <input {...register('totalSeats')} type="number" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Available Seats</label>
              <input {...register('availableSeats')} type="number" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select {...register('status')} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground">
              <option value="Scheduled">Scheduled</option>
              <option value="Boarding">Boarding</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg transition-colors flex items-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} {trip ? 'Save Changes' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
