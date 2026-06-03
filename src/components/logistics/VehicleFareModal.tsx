'use client';
import React, { useEffect } from 'react';
import { X, DollarSign, Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdatePricingConfigMutation } from '@/store/api';

interface VehicleFareModalProps {
  isOpen: boolean;
  onClose: () => void;
  pricingConfig?: any;
}

export function VehicleFareModal({ isOpen, onClose, pricingConfig }: VehicleFareModalProps) {
  const { register, handleSubmit, reset } = useForm();
  const [updatePricingConfig, { isLoading: isUpdating }] = useUpdatePricingConfigMutation();

  useEffect(() => {
    if (pricingConfig) {
      reset({
        carBaseFee: pricingConfig.carBaseFee || 0,
        carPerKmFee: pricingConfig.carPerKmFee || 0,
        motorcycleBaseFee: pricingConfig.motorcycleBaseFee || 0,
        busBaseFee: pricingConfig.busBaseFee || 0,
        comfortSurcharge: pricingConfig.comfortSurcharge || 0,
        freeWaitingTimeMinutes: pricingConfig.freeWaitingTimeMinutes || 0,
        waitingFeePerMinute: pricingConfig.waitingFeePerMinute || 0,
        surgeMultiplier: pricingConfig.surgeMultiplier || 1.0,
        platformCommissionPercent: pricingConfig.platformCommissionPercent || 15
      });
    }
  }, [pricingConfig, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        carBaseFee: parseFloat(data.carBaseFee),
        carPerKmFee: parseFloat(data.carPerKmFee),
        motorcycleBaseFee: parseFloat(data.motorcycleBaseFee),
        busBaseFee: parseFloat(data.busBaseFee),
        comfortSurcharge: parseFloat(data.comfortSurcharge),
        freeWaitingTimeMinutes: parseInt(data.freeWaitingTimeMinutes, 10),
        waitingFeePerMinute: parseFloat(data.waitingFeePerMinute),
        surgeMultiplier: parseFloat(data.surgeMultiplier),
        platformCommissionPercent: parseFloat(data.platformCommissionPercent)
      };

      await updatePricingConfig(payload).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to update pricing config:', err);
      alert('Failed to update pricing config');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Edit Global Pricing Configuration
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="pricing-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold border-b border-border pb-2">Ride Base Fares & Per Km</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Car Base Fee ($)</label>
                  <input type="number" step="0.01" {...register('carBaseFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Car Per Km ($)</label>
                  <input type="number" step="0.01" {...register('carPerKmFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Motorcycle Base Fee ($)</label>
                  <input type="number" step="0.01" {...register('motorcycleBaseFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Bus Base Fee ($)</label>
                  <input type="number" step="0.01" {...register('busBaseFee')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Comfort Surcharge ($)</label>
                  <input type="number" step="0.01" {...register('comfortSurcharge')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-semibold border-b border-border pb-2">Fees & Platform Rules</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Free Waiting Time (mins)</label>
                  <input type="number" {...register('freeWaitingTimeMinutes')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Waiting Fee Per Min ($)</label>
                  <input type="number" step="0.01" {...register('waitingFeePerMinute')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Surge Multiplier</label>
                  <input type="number" step="0.1" {...register('surgeMultiplier')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Platform Commission (%)</label>
                  <input type="number" step="0.1" {...register('platformCommissionPercent')} className="w-full px-3 py-2 bg-background border border-border rounded-lg" required />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/30">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
            Cancel
          </button>
          <button type="submit" form="pricing-form" disabled={isUpdating} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
