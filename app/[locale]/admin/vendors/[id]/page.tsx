"use client";
import { IVendor } from "@/interfaces/vendor";
import { useAuth } from "@/lib/Context/authContext";
import SpinnerEmpty from "@/lib/loading";
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
import { IUser } from "@/interfaces/user";

export default function Vendor() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const [saveVendor, setSaveVendor] = useState<IVendor>();
  const [vendorName, setVendorName] = useState<string | undefined>(
    saveVendor?.name,
  );
  const [ownerName, setOwnerName] = useState<string | undefined>(
    saveVendor?.owner.email,
  );

  useEffect(() => {
    async function vendor() {
      if (!token) return;
      const data: IVendor = await myClass.getVendor(id, token);
      console.log(data);
      setSaveVendor(data);
      setVendorName(data.name);
      setOwnerName(data.owner.email);
    }
    vendor();
  }, [id, token]);

  return (
    <div className="">
      {isLoading ? (
        <div className="h-dvh w-full flex justify-center items-center">
          <SpinnerEmpty />
        </div>
      ) : (
        <div className="my-10">
          <h1 className="font-bold text-2xl">
            Edit <span className="text-red-600">{saveVendor?.name}</span>
          </h1>
          <form className="w-full max-w-sm my-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="form-name">Vendor Name</FieldLabel>
                <Input
                  id="form-name"
                  type="text"
                  placeholder="Bazooka"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-5">
                <Field>
                  <FieldLabel htmlFor="form-email">Email</FieldLabel>
                  <Input
                    id="form-email"
                    type="email"
                    placeholder="vendor@devfolio.net"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                  />
                  <FieldDescription>
                    We&apos;ll never share your email with anyone.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-password">Password</FieldLabel>
                  <Input
                    id="form-password"
                    type="password"
                    placeholder="*********"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                  <Input
                    id="form-phone"
                    type="tel"
                    placeholder="+201xxxxxxxxx"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-confirm">Confirmed</FieldLabel>
                  <Select
                    onValueChange={(value) => setConfirmed(value === "true")}
                  >
                    <SelectTrigger id="form-confirm">
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
                  <FieldLabel htmlFor="form-block">Block</FieldLabel>
                  <Select onValueChange={(value) => setBlock(value === "true")}>
                    <SelectTrigger id="form-block">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-type">Account Type</FieldLabel>
                  <Select
                    onValueChange={(value) =>
                      setAccountType(
                        value as
                          | "customer"
                          | "vendor"
                          | "delivery"
                          | "wholesale",
                      )
                    }
                  >
                    <SelectTrigger id="form-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="wholesale">Wholesale</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="form-wallet">Wallet</FieldLabel>
                  <Input
                    id="form-wallet"
                    type="number"
                    placeholder="100"
                    onChange={(e) => setWallet(Number(e.target.value))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-loyalty">Loyalty Points</FieldLabel>
                  <Input
                    id="form-loyalty"
                    type="number"
                    placeholder="1000"
                    onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <Field>
                  <FieldLabel htmlFor="form-role">Role</FieldLabel>
                  <Select onValueChange={(value) => setRole(Number(value))}>
                    <SelectTrigger id="form-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">User</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-vip">Vip</FieldLabel>
                  <Select onValueChange={(value) => setVip(value === "true")}>
                    <SelectTrigger id="form-vip">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field orientation="horizontal" className="flex justify-end">
                <Button
                  onClick={(e) => {
                    addUserData();
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
        </div>
      )}
    </div>
  );
}
