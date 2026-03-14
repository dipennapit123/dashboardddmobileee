"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  admin: AdminInfo | null;
  login: (payload: { token: string; admin: AdminInfo }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      login: ({ token, admin }) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
    }),
    { name: "astradaily-admin-auth" }
  )
);
