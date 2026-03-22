'use client';
import React from 'react'
import { AuthContextProvider } from './Context/authContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function GlobalWrapper({ children }: {children: React.ReactNode}) {
    return (
      <AuthContextProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </AuthContextProvider>
    );
}
