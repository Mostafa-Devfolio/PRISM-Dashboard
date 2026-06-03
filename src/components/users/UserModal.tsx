'use client';
import { showAlert, showConfirm } from '@/lib/custom-alerts';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, UploadCloud, UserCircle } from 'lucide-react';
import { useCreateUserMutation, useUpdateUserMutation, useUploadFileMutation } from '@/store/api';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  confirmed: z.boolean().default(true),
  blocked: z.boolean().default(false),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any | null;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '', email: '', password: '', confirmed: true, blocked: false,
    }
  });

  useEffect(() => {
    setSelectedFile(null);
    if (user) {
      reset({
        username: user.username, email: user.email, confirmed: user.confirmed, blocked: user.blocked, password: '',
      });
    } else {
      reset({
        username: '', email: '', password: '', confirmed: true, blocked: false,
      });
    }
  }, [user, reset, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      let avatarId = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('files', selectedFile);
        const uploadRes = await uploadFile(formData).unwrap();
        if (uploadRes && uploadRes.length > 0) {
          avatarId = uploadRes[0].id;
        }
      }

      const submitData: any = { ...data };
      if (avatarId) {
        submitData.avatar = avatarId; // Link avatar relation
      }

      if (user) {
        if (!submitData.password) delete submitData.password;
        await updateUser({ id: user.id, ...submitData }).unwrap();
      } else {
        if(!submitData.password) submitData.password = 'DefaultPassword123!';
        await createUser(submitData).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
      showAlert('Failed to save user. Check console for details.');
    }
  };

  const isLoading = isCreating || isUpdating || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 overflow-hidden flex flex-col max-h-screen">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto flex-1 pr-1">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group overflow-hidden bg-muted/10">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {selectedFile ? (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs p-2">
                  {selectedFile.name.substring(0,8)}...
                </div>
              ) : (
                <UserCircle className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Upload Profile Avatar</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Username</label>
            <input 
              {...register('username')}
              type="text" 
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input 
              {...register('email')}
              type="email" 
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Password {user && <span className="text-muted-foreground text-xs font-normal">(Leave blank to keep current)</span>}
            </label>
            <input 
              {...register('password')}
              type="password" 
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input type="checkbox" {...register('confirmed')} className="rounded border-border text-primary focus:ring-primary" />
              Confirmed
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input type="checkbox" {...register('blocked')} className="rounded border-border text-primary focus:ring-primary" />
              Blocked
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 pb-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUploading ? 'Uploading...' : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
