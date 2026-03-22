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

export interface IUserBody {
  accountType: "customer" | "vendor" | "delivery" | "wholesale";
  blocked: boolean;
  confirmed: boolean;
  email: string;
  password: string;
  role: number;
  isVip: boolean;
  loyaltyPoints: number;
  phone: string;
  username: string;
  walletBalance: number;
}

export default function UserData() {
  const [userData, setUserData] = useState<IUser>();
  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<number>(1);
  const [phone, setPhone] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(true);
  const [block, setBlock] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<
    "customer" | "vendor" | "delivery" | "wholesale"
  >("customer");
  const [wallet, setWallet] = useState<number>(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [vip, setVip] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  async function addUserData() {
    const body = {
      accountType: accountType,
      blocked: block,
      confirmed: confirmed,
      email: email,
      password: password,
      role: role,
      isVip: vip,
      loyaltyPoints: loyaltyPoints,
      phone: phone,
      username: userName,
      walletBalance: wallet,
    };
    const token = await getLogin();
    if (!token) return;
    const response = await myClass.addUser(token, body);
  }

  return (
    <div className="my-10">
      <h1 className="font-bold text-2xl">Add Users</h1>
      <form className="w-full max-w-sm my-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="form-name">UserName</FieldLabel>
            <Input
              id="form-name"
              type="text"
              placeholder="Mostafa"
              required
              onChange={(e) => setUserName(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field>
              <FieldLabel htmlFor="form-email">Email</FieldLabel>
              <Input
                id="form-email"
                type="email"
                placeholder="mostafa@example.com"
                onChange={(e) => setEmail(e.target.value)}
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
              <Select onValueChange={(value) => setConfirmed(value === "true")}>
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
                    value as "customer" | "vendor" | "delivery" | "wholesale",
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
  );
}
