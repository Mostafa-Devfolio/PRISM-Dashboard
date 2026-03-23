'use client';
import SpinnerEmpty from '@/lib/loading';
import Link from 'next/link';
import React, { useState } from 'react'

export default function VendorsPage() {

    const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="my-10 w-full">
      <div className="flex justify-between">
        <h1 className="mb-5 font-bold text-2xl">Vendors</h1>
        <button className="px-5 py-2 bg-black mr-5 hover:bg-black/80 cursor-pointer text-white rounded-lg">
          <Link href={"/admin/users/add"}>Add</Link>
        </button>
      </div>
      {isLoading ? (
        <div className="">
          <SpinnerEmpty />
        </div>
      ) : (
        <div className=""></div>
      )}
    </div>
  );
}
