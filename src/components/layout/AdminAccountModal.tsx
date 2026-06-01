import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, User, Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { useUpdateUserMutation, useChangePasswordMutation, useLoginMutation } from '@/store/api';
import toast from 'react-hot-toast';

export function AdminAccountModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [login, { isLoading: isVerifying }] = useLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      password: '',
      passwordConfirmation: ''
    }
  });

  const isLoading = isUpdatingUser || isChangingPassword || isVerifying;

  const onSubmit = async (data: any) => {
    setError(null);
    
    if (!data.currentPassword) {
      setError('You must enter your current password to save any changes.');
      return;
    }

    const hasProfileChanges = data.username !== user?.username || data.email !== user?.email;
    const isChangingPwd = !!data.password || !!data.passwordConfirmation;

    if (!hasProfileChanges && !isChangingPwd) {
      onClose();
      return;
    }

    try {
      if (isChangingPwd) {
        if (data.password !== data.passwordConfirmation) {
          setError('New passwords do not match!');
          return;
        }
        await changePassword({
          currentPassword: data.currentPassword,
          password: data.password,
          passwordConfirmation: data.passwordConfirmation
        }).unwrap();
        toast.success('Password changed successfully!');
      } else if (hasProfileChanges) {
        try {
          await login({ identifier: user.email, password: data.currentPassword }).unwrap();
        } catch (err) {
          setError('Incorrect current password.');
          return;
        }
      }

      if (hasProfileChanges) {
        await updateUser({ 
          id: user?.id || user?.documentId, 
          username: data.username, 
          email: data.email 
        }).unwrap();
        toast.success('Profile details updated!');
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.data?.error?.message || 'An error occurred while saving your changes.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Edit Account
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors bg-background border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span className="leading-tight">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1">Username</label>
              <input 
                {...register('username', { required: true })} 
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input 
                type="email"
                {...register('email', { required: true })} 
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" 
              />
            </div>
            
            <div className="p-5 bg-muted/40 border border-border rounded-xl mt-4 space-y-4">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-primary" /> Security Verification
              </h4>
              
              <div>
                <label className="block text-xs font-semibold mb-1 text-red-500">Current Password (Required for any changes)</label>
                <input 
                  type="password"
                  {...register('currentPassword')} 
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-red-500/50 outline-none" 
                />
              </div>

              <div className="pt-3 border-t border-border/50">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-muted-foreground" /> Change Password (Optional)
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">New Password</label>
                    <input 
                      type="password"
                      {...register('password')} 
                      placeholder="Leave blank to keep current"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Confirm New Password</label>
                    <input 
                      type="password"
                      {...register('passwordConfirmation')} 
                      placeholder="Re-enter new password"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
