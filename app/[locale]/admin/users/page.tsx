"use client";
import React, { useEffect, useState } from "react";
import { getLogin } from "../../auth/login/login";
import { myClass } from "@/services/ApiServices";
import { IUser } from "@/interfaces/user";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import SpinnerEmpty from "@/lib/loading";
import Link from "next/link";

export default function Users() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [noOfRow, setNoOfRow] = useState(-1);
  const router = useRouter();
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(5);
  const [myPage, setMyPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  async function goTo(userId: number) {
    router.push(`/admin/users/${userId}`);
  }

  async function fetchUser() {
    try {
      setIsLoading(true);
      const token = await getLogin();
      if (token) {
        const data = await myClass.getUsers(token);
        setUsers(data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }

  async function deleteUser(userId: number) {
    const token = await getLogin();
    if (!token) return;
    const data = await myClass.deleteUser(userId, token);
    fetchUser();
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const token = await getLogin();
        if (token) {
          const data = await myClass.getUsers(token);
          setUsers(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchUsers();
  }, []);

  function decreaseUsers() {
    if (first == 0) {
      return;
    }
    setFirst(first - 5);
    setSecond(second - 5);
    setMyPage(myPage - 1);
  }
  function increaseUsers() {
    if (second >= users.length) {
      return;
    }
    setFirst(first + 5);
    setSecond(second + 5);
    setMyPage(myPage + 1);
  }

  return (
    <div className="my-10 w-full">
      <div className="flex justify-between">
        <h1 className="mb-5 font-bold text-2xl">Users</h1>
        <button className="px-5 py-2 bg-black mr-5 hover:bg-black/80 cursor-pointer text-white rounded-lg">
          <Link href={"/admin/users/add"}>Add</Link>
        </button>
      </div>
      {isLoading ? (
        <div className="">
          <SpinnerEmpty />
        </div>
      ) : (
        <table className="w-full border my-5">
          <thead className="border">
            <tr className="w-full">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">User name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(first, second).map((user: IUser, index) => {
              return (
                <tr className="w-full border" key={user.id}>
                  <th className="p-2 border truncate">{user.id}</th>
                  <th className="p-2 border truncate">{user.username}</th>
                  <th className="p-2 border">{user.email}</th>
                  <th className="p-2 border">
                    {user.confirmed == true ? "Confirmed" : "Pending"}
                  </th>
                  <th className="p-2 border flex gap-3">
                    <button
                      className="bg-blue-600 cursor-pointer px-3 py-1 rounded-lg text-white hover:bg-blue-800"
                      onClick={() => goTo(user.id)}
                    >
                      Edit
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Chat</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this user account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel variant="outline">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUser(user.id)}
                            variant="destructive"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </th>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div className="my-4 flex justify-end items-center mr-5 gap-5">
        <button
          onClick={() => {
            decreaseUsers();
          }}
          className="px-2 py-1 bg-black/20 rounded-md"
        >
          Previous
        </button>
        <h4>{myPage}</h4>
        <button
          onClick={() => {
            increaseUsers();
          }}
          className="px-2 py-1 bg-black/20 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
}
