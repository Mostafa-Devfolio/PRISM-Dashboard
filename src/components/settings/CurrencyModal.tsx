'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Coins } from 'lucide-react';
import { useCreateCurrencyMutation, useUpdateCurrencyMutation } from '@/store/api';
import toast from 'react-hot-toast';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: any | null;
}

export function CurrencyModal({ isOpen, onClose, currency }: CurrencyModalProps) {
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation();
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation();
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (currency) {
      reset({ 
        name: currency.name || '', 
        code: currency.code || '',
        symbol: currency.symbol || '',
        symbolPosition: currency.symbolPosition || 'before',
        decimalPlaces: currency.decimalPlaces || 2,
        isDefault: currency.isDefault || false,
        isActive: currency.isActive !== false,
      });
    } else {
      reset({
        name: '', code: '', symbol: '', symbolPosition: 'before', decimalPlaces: 2, isDefault: false, isActive: true
      });
    }
  }, [currency, reset, isOpen]);

  if (!isOpen) return null;

  const isSaving = isCreating || isUpdating;

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        decimalPlaces: parseInt(data.decimalPlaces) || 0,
      };

      if (currency) {
        await updateCurrency({ documentId: currency.documentId || currency.id, ...payload }).unwrap();
        toast.success('Currency updated successfully!');
      } else {
        await createCurrency(payload).unwrap();
        toast.success('Currency created successfully!');
      }
      onClose();
    } catch (error: any) {
      console.error('Failed to save currency:', error);
      toast.error(error.data?.error?.message || 'Failed to save currency.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            {currency ? 'Edit Currency' : 'Create Currency'}
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Currency Name</label>
            <input 
              {...register('name')} 
              required
              placeholder="e.g. US Dollar"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Currency Code</label>
              <input 
                {...register('code')} 
                required
                placeholder="e.g. USD"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Symbol</label>
              <input 
                {...register('symbol')} 
                required
                placeholder="e.g. $"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Symbol Position</label>
              <select 
                {...register('symbolPosition')} 
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="before">Before ($10)</option>
                <option value="after">After (10$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Decimal Places</label>
              <input 
                type="number"
                {...register('decimalPlaces')} 
                min="0"
                max="4"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isDefault')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Set as Default Currency</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-primary focus:ring-primary" />
              <span className="text-sm font-medium">Currency is Active</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {currency ? 'Save Changes' : 'Create Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
