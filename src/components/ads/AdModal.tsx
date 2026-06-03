'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { useUpdateLocalServiceMutation, useUpdateClassifiedAdMutation } from '@/store/api';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any | null;
  type: 'services' | 'classifieds';
}

export function AdModal({ isOpen, onClose, item, type }: AdModalProps) {
  const [updateService, { isLoading: isUpdatingService }] = useUpdateLocalServiceMutation();
  const [updateAd, { isLoading: isUpdatingAd }] = useUpdateClassifiedAdMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { status: 'pending' }
  });

  useEffect(() => {
    if (item) {
      reset({ status: item.status || 'pending' });
    }
  }, [item, reset, isOpen]);

  if (!isOpen || !item) return null;

  const onSubmit = async (data: any) => {
    try {
      if (type === 'services') {
        await updateService({ documentId: item.documentId || item.id, ...data }).unwrap();
      } else {
        await updateAd({ documentId: item.documentId || item.id, ...data }).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update status:', error);
      showAlert('Failed to update status.');
    }
  };

  const isLoading = isUpdatingService || isUpdatingAd;
  const isService = type === 'services';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Update {isService ? 'Service Provider' : 'Classified Ad'} Status
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select {...register('status')} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground">
              <option value="pending">Pending Review</option>
              <option value="approved">Approved & Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
