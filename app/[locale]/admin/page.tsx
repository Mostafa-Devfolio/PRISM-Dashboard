"use client";
import { myClass } from "@/services/ApiServices";
import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { IAnalytics } from "@/interfaces/analytics";
import { useTranslations } from "next-intl";
import { getLogin } from "../auth/login/login";
import Link from "next/link";

export const valueFormatter = (item: { value: number }) =>
  `${item.value}${" "}EGP`;

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<IAnalytics>();
  const t = useTranslations();

  const desktopOS = [
    {
      label: "Admin Commission",
      value: analyticsData?.ecommerce.overview.adminCommission ?? 0,
    },
    {
      label: "Vendor Payouts",
      value: analyticsData?.ecommerce.overview.vendorPayouts,
    },
    {
      label: "Gross Volume",
      value: analyticsData?.ecommerce.overview.grossVolume,
    },
    {
      label: "Delivery Fees",
      value: analyticsData?.ecommerce.overview.totalDeliveryFees,
    },
  ];

  useEffect(() => {
    async function getData() {
      const token = await getLogin();
      if (!token) return;
      const data = await myClass.getAnalytics(token);
      setAnalyticsData(data);
      console.log(data);
    }
    getData();
  }, []);

  return (
    <div className="">
      <div className="">
        <h1>
          Hi <span className="text-red-600">Admin</span>, This is Prism
          Dashboard
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-5 my-5">
        <div className="border p-2 rounded-lg bg-white">
          <h3 className="p-2 font-semibold text-red-600!">● Earnings</h3>
          <PieChart
            series={[
              {
                data: desktopOS,
                highlightScope: { fade: "global", highlight: "item" },
                faded: {
                  innerRadius: 30,
                  additionalRadius: -30,
                  color: "gray",
                },
                valueFormatter,
              },
            ]}
            height={200}
            width={200}
          />
        </div>
        <div className="border p-2 rounded-lg bg-white h-65 overflow-y-scroll no-scrollbar">
          <h3 className="p-2 font-semibold text-red-600!">
            ● Top Rated Vendors
          </h3>
          <div className="flex flex-col gap-3">
            {analyticsData?.ecommerce.bestRatedVendors.map((rated: any) => {
              return (
                <div
                  className="flex justify-between p-2 border rounded-md"
                  key={rated.id}
                >
                  <h4>
                    <Link href={`/admin/vendors/${rated.documentId}`}>
                      {rated.name}
                    </Link>
                  </h4>
                  <h4 className="flex gap-2 items-center">
                    {rated.rating}{" "}
                    <svg
                      fill="#ffd500"
                      width="20px"
                      height="20px"
                      viewBox="0 0 32 32"
                      id="Outlined"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke="#ffd500"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <title></title>{" "}
                        <g id="Fill">
                          {" "}
                          <path d="M28.61,11.67H20l-2.66-8.2a1.39,1.39,0,0,0-2.64,0L12,11.67H3.39a1.39,1.39,0,0,0-.82,2.51l7,5.07L6.89,27.46a1.39,1.39,0,0,0,1.32,1.82A1.43,1.43,0,0,0,9,29l7-5.07L23,29a1.43,1.43,0,0,0,.81.27,1.39,1.39,0,0,0,1.32-1.82l-2.66-8.21,7-5.07A1.39,1.39,0,0,0,28.61,11.67Zm-7.34,6-1.17.86.44,1.38,2.09,6.41-5.45-4L16,21.46l-1.18.86-5.45,4,2.09-6.41.44-1.38-1.17-.86-5.45-4h8.19l.45-1.38L16,5.89l2.08,6.4.45,1.38h8.19Z"></path>{" "}
                        </g>{" "}
                      </g>
                    </svg>
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
