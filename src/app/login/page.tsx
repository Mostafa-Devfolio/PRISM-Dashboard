'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLoginMutation } from '@/store/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg('');
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, jwt: result.jwt }));
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err?.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-8 transition-all relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Pyramids<span className="text-primary">Admin</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">Sign in to manage your empire</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-600 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email or Username</label>
              <input
                {...register('identifier')}
                type="text"
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="admin@pyramids.com"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-500">{errors.identifier.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message as string}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
            <div className="mt-8 pt-6 border-t border-border/50 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Demo Access
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('identifier', 'admin@devfolio.net');
                  setValue('password', 'Admin2026@');
                }}
                className="w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              >
                <span className="text-sm font-bold text-primary flex items-center gap-2">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Click Here to Auto-Fill Credentials
                </span>
                <span className="text-xs font-medium text-foreground mt-2 opacity-80 bg-background px-2 py-1 rounded-md border border-border/50">
                  admin@devfolio.net / Admin2026@
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
