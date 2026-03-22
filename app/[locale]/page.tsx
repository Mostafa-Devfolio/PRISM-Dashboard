"use client";
import { ILogin } from "@/interfaces/login";
import { myClass } from "@/services/ApiServices";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { saveLogin } from "./auth/login/login";

export default function Login() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    // resolver: zodResolver(schema)
  });

  const [isAdmin, setIsAdmin] = useState<ILogin>();
  const [pressedLogin, setPressedLogin] = useState(false);
  const router = useRouter();

  async function logIn(myData: any) {
    console.log(myData);
    const data: ILogin = await myClass.login(myData);
    console.log(data);
    const save = await saveLogin(data.jwt);
    setIsAdmin(data);
    setPressedLogin(true);
    setTimeout(() => {
      if (isAdmin?.jwt) {
        router.push("/admin");
      }
    }, 3000);
  }
  return (
    <div className="flex bg-amber-100 flex-col items-center justify-center gap-4 h-dvh">
      <form
        onSubmit={handleSubmit(logIn)}
        className="flex flex-col items-center justify-center gap-4"
      >
        <h2 className="font-bold">Admin Login</h2>
        <input
          type="email"
          {...register("email")}
          className="p-2 bg-white border-gray-100 border rounded"
          placeholder="Enter your email address"
        />
        <input
          type="password"
          {...register("password")}
          className="p-2 bg-white border border-gray-100 rounded"
          placeholder="Enter your password"
        />
        <button
          type="submit"
          className="py-2 px-6 bg-blue-600 hover:bg-blue-800 rounded-md text-white"
        >
          Login
        </button>
      </form>
      {pressedLogin && (
        <>
          {isAdmin?.status == 400 || isAdmin?.user.accountType != "admin" ? (
            <div className="bg-red-500 p-2 rounded-md text-white">
              <h3>You don&apos;t have permission to access this dashboard!</h3>
            </div>
          ) : (
            <div className="bg-green-500 p-2 rounded-md text-white">
              <h3>You have successfully logged in!</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
}
