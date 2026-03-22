"use client";
import { myClass } from "@/services/ApiServices";
import React, { useEffect, useState } from "react";
import { getLogin } from "../../../auth/login/login";
import { useParams } from "next/navigation";
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
import SpinnerEmpty from "../../../../../lib/loading";

export interface Body {
  accountType: string | undefined;
  blocked: boolean | undefined;
  confirmed: boolean | undefined;
  email: string | undefined;
  isVip: boolean | undefined;
  loyaltyPoints: number | undefined;
  phone: string | undefined;
  username: string | undefined;
  walletBalance: number | undefined;
}

export default function UserData() {
  const { id } = useParams();
  const [userData, setUserData] = useState<IUser>();
  const [userName, setUserName] = useState(userData?.username);
  const [email, setEmail] = useState(userData?.email);
  const [phone, setPhone] = useState(userData?.phone);
  const [confirmed, setConfirmed] = useState(userData?.confirmed);
  const [block, setBlock] = useState(userData?.blocked);
  const [accountType, setAccountType] = useState(userData?.accountType);
  const [wallet, setWallet] = useState(userData?.walletBalance);
  const [loyaltyPoints, setLoyaltyPoints] = useState(userData?.loyaltyPoints);
  const [vip, setVip] = useState(userData?.isVip);
  const [isLoading, setIsLoading] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    const token = await getLogin();
    if (!token) return;
    if (!id) return;
    const data = await myClass.getUser(id, token);
    setUserData(data);
    setUserName(userData?.username);
    setEmail(userData?.email);
    setPhone(userData?.phone);
    setConfirmed(userData?.confirmed);
    setBlock(userData?.blocked);
    setAccountType(userData?.accountType);
    setWallet(userData?.walletBalance);
    setLoyaltyPoints(userData?.loyaltyPoints);
    setVip(userData?.isVip);
    setIsLoading(false);
  }

  async function changeUserData() {
    const body = {
      accountType: accountType,
      blocked: block,
      confirmed: confirmed,
      email: email,
      isVip: vip,
      loyaltyPoints: loyaltyPoints,
      phone: phone,
      username: userName,
      walletBalance: wallet,
    };
    const token = await getLogin();
    if (!id) return;
    if (!token) return;
    const response = await myClass.changeUser(id, token, body);
    loadUsers();
  }

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      const token = await getLogin();
      if (!token) return;
      if (!id) return;
      const data = await myClass.getUser(id, token);
      setUserData(data);
      setUserName(userData?.username);
      setEmail(userData?.email);
      setPhone(userData?.phone);
      setConfirmed(userData?.confirmed);
      setBlock(userData?.blocked);
      setAccountType(userData?.accountType);
      setWallet(userData?.walletBalance);
      setLoyaltyPoints(userData?.loyaltyPoints);
      setVip(userData?.isVip);
      setIsLoading(false);
    }
    loadUser();
  }, [id, userData?.username]);
  return (
    <div className="">
      {isLoading ? (
        <div className="h-dvh w-full flex justify-center items-center">
          <SpinnerEmpty />
        </div>
      ) : (
        <div className="my-10">
          <h1 className="font-bold text-2xl">Edit User</h1>
          <form className="w-full max-w-sm my-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="form-name">UserName</FieldLabel>
                <Input
                  id="form-name"
                  type="text"
                  placeholder="Mostafa"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="form-email">Email</FieldLabel>
                <Input
                  id="form-email"
                  type="email"
                  placeholder="mostafa@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FieldDescription>
                  We&apos;ll never share your email with anyone.
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="form-phone">Phone</FieldLabel>
                  <Input
                    id="form-phone"
                    type="tel"
                    placeholder="+201xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-confirm">Confirmed</FieldLabel>
                  <Select
                    onValueChange={(value) => setConfirmed(value === "true")}
                    value={confirmed + ""}
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
                  <Select
                    onValueChange={(value) => setBlock(value === "true")}
                    value={block + ""}
                  >
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
                    onValueChange={(value) => setAccountType(value)}
                    value={accountType}
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
                    type="text"
                    placeholder="100"
                    value={wallet}
                    onChange={(e) => setWallet(Number(e.target.value))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="form-loyalty">Loyalty Points</FieldLabel>
                  <Input
                    id="form-loylty"
                    type="text"
                    placeholder="1000"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="form-vip">Vip</FieldLabel>
                <Select
                  onValueChange={(value) => setVip(value === "true")}
                  value={vip + ""}
                >
                  <SelectTrigger id="form-vip">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field orientation="horizontal" className="flex justify-end">
                <Button
                  onClick={(e) => {
                    changeUserData();
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
