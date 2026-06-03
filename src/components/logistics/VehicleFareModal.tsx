'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Car } from 'lucide-react';
import { useCreateVehicleTypeMutation, useUpdateVehicleTypeMutation } from '@/store/api';

interface VehicleFareModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleType: any;
}

export function VehicleFareModal({ isOpen, onClose, vehicleType }: VehicleFareModalProps) {
  const [createVehicleType, { isLoading: isCreating }] = useCreateVehicleTypeMutation();
  const [updateVehicleType, { isLoading: isUpdating }] = useUpdateVehicleTypeMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      baseFare: 0,
      pricePerKm: 0,
      pricePerMinute: 0,
      minimumFare: 0,
      capacity: 4,
      isActive: true,
      description: ''
    }
  });

  useEffect(() => {
    if (vehicleType) {
      reset({
        name: vehicleType.name || '',
        baseFare: vehicleType.baseFare || 0,
        pricePerKm: vehicleType.pricePerKm || 0,
        pricePerMinute: vehicleType.pricePerMinute || 0,
        minimumFare: vehicleType.minimumFare || 0,
        capacity: vehicleType.capacity || 4,
        isActive: vehicleType.isActive !== false,
        description: vehicleType.description || ''
      });
    } else {
      reset({
        name: '',
        baseFare: 0,
        pricePerKm: 0,
        pricePerMinute: 0,
        minimumFare: 0,
        capacity: 4,
        isActive: true,
        description: ''
      });
    }
  }, [vehicleType, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        baseFare: parseFloat(data.baseFare),
        pricePerKm: parseFloat(data.pricePerKm),
        pricePerMinute: parseFloat(data.pricePerMinute),
        minimumFare: parseFloat(data.minimumFare),
        capacity: parseInt(data.capacity, 10),
        isActive: data.isActive,
        description: data.description,
      };

      if (vehicleType && (vehicleType.id || vehicleType.documentId)) {
        await updateVehicleType({ documentId: vehicleType.documentId || vehicleType.id, ...payload }).unwrap();
      } else {
        await createVehicleType(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save vehicle type:', error);
      alert(error.message || 'Failed to save vehicle type details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            {vehicleType ? 'Edit Vehicle Fare Module' : 'Add New Vehicle Fare Module'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="vehicle-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Module Name (e.g., Taxi, Uber, Comfort)</label>
            <input {...register('name')} placeholder="e.g. UberX" className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Base Fare ($)</label>
              <input type="number" step="0.01" min="0" {...register('baseFare')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Minimum Fare ($)</label>
              <input type="number" step="0.01" min="0" {...register('minimumFare')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Price Per Km ($)</label>
              <input type="number" step="0.01" min="0" {...register('pricePerKm')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Price Per Minute ($)</label>
              <input type="number" step="0.01" min="0" {...register('pricePerMinute')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Max Capacity (Seats)</label>
              <input type="number" min="1" {...register('capacity')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Module Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description (Internal Notes)</label>
            <textarea {...register('description')} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg" />
          </div>
        </form>

        <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button type="submit" form="vehicle-form" disabled={isCreating || isUpdating} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Fare Module
          </button>
        </div>
      </div>
    </div>
  );
}
