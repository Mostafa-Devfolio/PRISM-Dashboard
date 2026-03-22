'use client';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import React from 'react'

export default function Locked() {
  const locale = useLocale();
  
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1>Please Login as an admin so that you can access the dashboard</h1>
      <button className="p-2 bg-black rounded-md text-white hover:bg-black/80">
        <Link href={`/${locale}/auth/login`}>Login here</Link>
      </button>
    </div>
  );
}
