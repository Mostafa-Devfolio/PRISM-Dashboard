'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Package } from 'lucide-react';
import { useCreateParcelTypeMutation, useUpdateParcelTypeMutation } from '@/store/api';

interface ParcelTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelType: any;
}

export function ParcelTypeModal({ isOpen, onClose, parcelType }: ParcelTypeModalProps) {
  const [createParcelType, { isLoading: isCreating }] = useCreateParcelTypeMutation();
  const [updateParcelType, { isLoading: isUpdating }] = useUpdateParcelTypeMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      basePrice: 0,
      maxWeight: 5,
      pricePerAdditionalKg: 0,
      isActive: true,
      description: ''
    }
  });

  useEffect(() => {
    if (parcelType) {
      reset({
        name: parcelType.name || '',
        basePrice: parcelType.basePrice || 0,
        maxWeight: parcelType.maxWeight || 5,
        pricePerAdditionalKg: parcelType.pricePerAdditionalKg || 0,
        isActive: parcelType.isActive !== false,
        description: parcelType.description || ''
      });
    } else {
      reset({
        name: '',
        basePrice: 0,
        maxWeight: 5,
        pricePerAdditionalKg: 0,
        isActive: true,
        description: ''
      });
    }
  }, [parcelType, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        basePrice: parseFloat(data.basePrice),
        maxWeight: parseFloat(data.maxWeight),
        pricePerAdditionalKg: parseFloat(data.pricePerAdditionalKg),
        isActive: data.isActive,
        description: data.description,
      };

      if (parcelType && (parcelType.id || parcelType.documentId)) {
        await updateParcelType({ documentId: parcelType.documentId || parcelType.id, ...payload }).unwrap();
      } else {
        await createParcelType(payload).unwrap();
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save parcel type:', error);
      alert(error.message || 'Failed to save parcel type details.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {parcelType ? 'Edit Parcel Pricing Model' : 'Add Parcel Pricing Model'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="parcel-form" onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Parcel Category Name (e.g., Document, Box, Heavy)</label>
            <input {...register('name')} placeholder="e.g. Document Delivery" className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Base Delivery Price ($)</label>
              <input type="number" step="0.01" min="0" {...register('basePrice')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Included Weight (Kg)</label>
              <input type="number" step="0.1" min="0" {...register('maxWeight')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Extra Price Per Kg ($)</label>
              <input type="number" step="0.01" min="0" {...register('pricePerAdditionalKg')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
            </div>
            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
                <span className="text-sm font-medium">Model Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description & Limitations</label>
            <textarea {...register('description')} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg" placeholder="Maximum dimensions, restricted items, etc." />
          </div>
        </form>

        <div className="p-5 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-background border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button type="submit" form="parcel-form" disabled={isCreating || isUpdating} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Pricing Model
          </button>
        </div>
      </div>
    </div>
  );
}
