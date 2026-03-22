import { getLogin } from "@/app/[locale]/auth/login/login";
import { createContext, useContext, useEffect, useState } from "react";

interface Auth {
  token: string | null;
  setToken: (value: string | null) => void;
}

export const authContext = createContext<Auth | null>(null);

export function useAuth() {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("Cannot use useAuth outside authContext");
  }
  return context;
}

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function getReady() {
      const tokens = await getLogin();
      if (!tokens) return;
      setToken(tokens);
    }
    getReady();
  }, []);

  return (
    <authContext.Provider value={{ token, setToken }}>
      {children}
    </authContext.Provider>
  );
}
