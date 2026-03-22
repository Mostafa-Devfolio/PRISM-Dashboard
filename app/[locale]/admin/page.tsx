"use client";
import { myClass } from "@/services/ApiServices";
import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { IAnalytics } from "@/interfaces/analytics";
import { useTranslations } from "next-intl";
import { getLogin } from "../auth/login/login";

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
          <h3 className="p-2 font-semibold !text-red-600">● Earnings</h3>
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
      </div>
    </div>
  );
}
