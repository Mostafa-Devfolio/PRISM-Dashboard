import { getTranslations } from "next-intl/server";
import Link from "next/link";
import React from "react";
import ClientLayout from "./ClientLayout";

export const baseUrl = `***REMOVED***`;

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("PRISMDASHBOARD");
  return (
    <div className=" bg-zinc-50 font-sans dark:bg-black">
      <div className="grid grid-cols-12">
        <div className="col-span-2 flex flex-col gap-3 bg-amber-500 h-screen">
          <h1 className="font-bold p-3 cursor-pointer hover:scale-y-125 transition ease-in-out duration-300 w-fit capitalize">
            <Link href={"/admin"} className="capitalize">
              {t("prism")}
            </Link>
          </h1>
          <ClientLayout />
        </div>
        <div className="col-span-10 p-2">
          <h2 className="font-bold text-2xl">Dashboard</h2>
          <div className="p-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
