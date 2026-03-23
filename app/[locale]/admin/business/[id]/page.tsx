"use client";
import { IBusiness } from "@/interfaces/businessType";
import { useAuth } from "@/lib/Context/authContext";
import { myClass } from "@/services/ApiServices";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SpinnerEmpty from "../../../../../lib/loading";
import Image from "next/image";
import { baseUrl } from "../../layout";

export interface IBody {
  name: string | undefined;
  slug: string | undefined;
  layoutType: string | undefined;
  orderMode: string | undefined;
  homeTitle: string | undefined;
  description: string | undefined;
  isActive: boolean | undefined;
  icon: number | undefined;
}

export default function Business() {
  const { token } = useAuth();
  const { id } = useParams();
  const [saveBusiness, setSaveBusiness] = useState<IBusiness>();
  const [businessName, setbusinessName] = useState(saveBusiness?.name);
  const [businessDescribtion, setbusinessDescribtion] = useState(
    saveBusiness?.description,
  );
  const [layoutType, setLayoutType] = useState(saveBusiness?.layoutType);
  const [orderMode, setOrderMode] = useState(saveBusiness?.orderMode);
  const [active, setActive] = useState(saveBusiness?.isActive);
  const [saveIcon, setSaveIcon] = useState(saveBusiness?.icon?.url);
  const [saveIconId, setSaveIconId] = useState(saveBusiness?.icon?.id);
  const [saveIconAlt, setSaveIconAlt] = useState(
    saveBusiness?.icon.alternativeText,
  );
  const [slug, setSlug] = useState(saveBusiness?.slug);
  const [isLoading, setIsLoading] = useState(false);

  async function uploadPhoto(image: any) {
    if (!token) return;
    const data = await myClass.uploadImage(token, image);
    setSaveIcon(data[0].url);
    setSaveIconId(data[0].id);
  }

  async function getBussinesses() {
    if (!token || !id) return;
    const data: IBusiness = await myClass.getBusiness(token, id);
    console.log(data);
    setSaveBusiness(data);
    setbusinessName(data.name);
    setbusinessDescribtion(data.description);
    setLayoutType(data.layoutType);
    setOrderMode(data.orderMode);
    setActive(data.isActive);
    setSaveIcon(data.icon?.url);
    setSaveIconAlt(data.icon?.alternativeText);
    setSlug(data.slug);
  }

  async function updateBus() {
    setIsLoading(true);
    const body = {
      name: businessName,
      slug: slug,
      layoutType: layoutType,
      orderMode: orderMode,
      homeTitle: businessName,
      description: businessDescribtion,
      isActive: active,
      icon: saveIconId,
    };
    if (!token) return;
    if (!saveBusiness?.documentId) return;
    const data = await myClass.updateBusiness(
      token,
      saveBusiness?.documentId,
      body,
    );
    getBussinesses();
    setIsLoading(false);
  }

  useEffect(() => {
    async function getBussiness() {
      setIsLoading(true);
      if (!token || !id) return;
      const data: IBusiness = await myClass.getBusiness(token, id);
      console.log(data);
      setSaveBusiness(data);
      setbusinessName(data.name);
      setbusinessDescribtion(data.description);
      setLayoutType(data.layoutType);
      setOrderMode(data.orderMode);
      setActive(data.isActive);
      setSaveIcon(data.icon?.url);
      setSaveIconAlt(data.icon?.alternativeText);
      setSlug(data.slug);
      setIsLoading(false);
    }
    getBussiness();
  }, [id, token, saveBusiness?.name, saveBusiness?.icon?.url]);

  return (
    <div className="my-10">
      <h1 className="font-bold text-2xl">Business</h1>
          {isLoading ? <div className="">
              <SpinnerEmpty />
      </div> : <div className="w-full">
        <form className="w-full max-w-sm my-10">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-20">
              <Field>
                <FieldLabel htmlFor="form-businessname">
                  Business Name
                </FieldLabel>
                <Input
                  id="form-businessname"
                  type="text"
                  placeholder="(ex: Restaurants, groceries...)"
                  required
                  value={businessName}
                  onChange={(e) => setbusinessName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="form-describtion">
                  Business Describtion
                </FieldLabel>
                <Input
                  id="form-describtion"
                  type="text"
                  placeholder="Deliver everything you want..."
                  value={businessDescribtion}
                  onChange={(e) => setbusinessDescribtion(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-slug">Business Slug</FieldLabel>
                <Input
                  id="form-slug"
                  type="tel"
                  placeholder="resturant-1"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="form-confirm">Business Type</FieldLabel>
                <Select
                  onValueChange={(value) => setLayoutType(value)}
                  value={layoutType}
                >
                  <SelectTrigger id="form-confirm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Restaurants</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="commerce">E-Commerce</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-block">Order Mode</FieldLabel>
                <Select
                  onValueChange={(value) => setOrderMode(value)}
                  value={orderMode}
                >
                  <SelectTrigger id="form-block">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_vendor">Single Vendor</SelectItem>
                    <SelectItem value="multi_vendor">Multi Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="form-type">Active</FieldLabel>
                <Select
                  onValueChange={(value) => setActive(value === "true")}
                  value={active + ""}
                >
                  <SelectTrigger id="form-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="picture">Icon</FieldLabel>
                {saveBusiness?.icon.url && (
                  <Image
                    width={300}
                    height={300}
                    className="w-10"
                    alt={saveBusiness?.icon.alternativeText}
                    src={`${baseUrl}${saveIcon}`}
                  />
                )}
                <Input
                  id="picture"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0])
                      uploadPhoto(e.target.files[0]);
                  }}
                  type="file"
                />
                <FieldDescription>Select a picture to upload.</FieldDescription>
              </Field>
              {/* <Field>
                <FieldLabel htmlFor="form-icontext">
                  Alternative Icon Text
                </FieldLabel>
                <Input
                  id="form-icontext"
                  type="text"
                  placeholder="(ex: restaurants...)"
                  value={saveIconAlt}
                  onChange={(e) => setSaveIconAlt(e.target.value)}
                />
              </Field> */}
            </div>
            <Field orientation="horizontal" className="flex justify-end">
              <Button
                onClick={(e) => {
                  updateBus();
                  e.preventDefault();
                }}
                type="submit"
                className="cursor-pointer hover:bg-black/80"
              >
                Submit
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>}
    </div>
  );
}
