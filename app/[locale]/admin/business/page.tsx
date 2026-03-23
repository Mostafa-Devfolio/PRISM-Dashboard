"use client";
import { IBusiness } from "@/interfaces/businessType";
import { useAuth } from "@/lib/Context/authContext";
import { myClass } from "@/services/ApiServices";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { baseUrl } from "../layout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import SpinnerEmpty from "@/lib/loading";

export default function Business() {
  const { token } = useAuth();
  const [saveBusiness, setSaveBusiness] = useState<IBusiness[]>([]);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  function goTo(businessId: string) {
    router.push(`/admin/business/${businessId}`);
  }

  async function deleteBusiness(businessId: string) {
    if (token) return;
    if (!token) return;
    const data = await myClass.deleteBusiness(token, businessId);
  }

  useEffect(() => {
    async function getBusiness() {
      setIsLoading(true);
      if (!token) return;
      const data = await myClass.getBusinessType(token);
      setSaveBusiness(data);
      setIsLoading(false);
    }
    getBusiness();
  }, [token]);

  return (
    <div className="my-10">
      <div className="flex justify-between items-center">
        <h1 className="mb-5 font-bold text-2xl">Business Modules</h1>
        <button className="px-5 py-2 bg-black mr-5 hover:bg-black/80 cursor-pointer text-white rounded-lg">
          <Link href={'/admin/business/add'}>Add</Link>
        </button>
      </div>
      {isLoading ? <div className="flex justify-center items-center h-screen">
        <SpinnerEmpty />
      </div> : <div className="grid grid-cols-2 text-center gap-5 my-5">
        {saveBusiness.map((business: IBusiness) => {
          return (
            <div
              className="border p-2 rounded-md text-center relative bg-white"
              key={business.id}
            >
              {business?.icon?.url && (
                <Image
                  width={500}
                  height={500}
                  className="object-cover w-40 text-center mx-auto cursor-pointer"
                  alt={business.icon.alternativeText}
                  src={`${baseUrl}${business.icon.url}`}
                  onClick={() => goTo(business.documentId)}
                />
              )}
              <h2
                onClick={() => goTo(business.documentId)}
                className="cursor-pointer font-bold"
              >
                {business.name}
              </h2>
              <p>{business.description}</p>
              <div className="absolute top-5 right-5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block w-fit">
                      <Button
                        onClick={() => deleteBusiness(business.documentId)}
                        variant="outline"
                        disabled
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          fill="#ff0000"
                          style={{ opacity: 1 }}
                        >
                          <path d="M9.25 3a.75.75 0 0 1 .75-.75h4a.75.75 0 0 1 .75.75v.75H19a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1 0-1.5h4.25z" />
                          <path
                            fillRule="evenodd"
                            d="M6.24 7.945a.5.5 0 0 1 .497-.445h10.526a.5.5 0 0 1 .497.445l.2 1.801a44.2 44.2 0 0 1 0 9.771l-.02.177a2.6 2.6 0 0 1-2.226 2.29a26.8 26.8 0 0 1-7.428 0a2.6 2.6 0 0 1-2.227-2.29l-.02-.177a44.2 44.2 0 0 1 0-9.77zm4.51 3.455a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0zm4 0a.75.75 0 0 0-1.5 0v7a.75.75 0 0 0 1.5 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">
                      Cannot delete business types in demo mode
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
}
