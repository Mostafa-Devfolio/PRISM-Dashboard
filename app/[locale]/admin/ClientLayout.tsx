'use client';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

export default function ClientLayout() {
    const pathNames = usePathname();
    const t = useTranslations("PRISMDASHBOARD");
    const [isSelected, setIsSelected] = useState(-1)
    console.log(pathNames);

    useEffect(() => {
        function isReady() {
            if (pathNames === '/admin') {
                setIsSelected(0);
            } else if (pathNames === '/admin/business') {
                setIsSelected(1);
            } else if (pathNames === '/admin/vendors') {
                setIsSelected(2);
            } else if (pathNames === '/admin/users') {
                setIsSelected(3);
            }
        }
        isReady();
    },[pathNames])
  return (
    <div className="bg-amber-50 p-3 w-full">
      <h3
        className={`hover:scale-y-110 cursor-pointer w-fit ${isSelected == 0 ? "font-bold" : ""}`}
      >
        <Link href={"/admin"}>{t("dashboard")}</Link>
      </h3>
      <hr className="w-full" />
      <h3
        className={`hover:scale-y-110 cursor-pointer w-fit ${isSelected == 1 ? "font-bold" : ""}`}
      >
        <Link href={"/admin/business"}>Business Modules</Link>
      </h3>
      <hr className="w-full" />
      <h3
        className={`hover:scale-y-110 cursor-pointer w-fit ${isSelected == 2 ? "font-bold" : ""}`}
      >
        <Link href={"/admin/vendors"}>Vendors</Link>
      </h3>
      <hr className="w-full" />
      <h3
        className={`hover:scale-y-110 cursor-pointer w-fit ${isSelected == 3 ? "font-bold" : ""}`}
      >
        <Link href={"/admin/users"}>Users</Link>
      </h3>
    </div>
  );
}
