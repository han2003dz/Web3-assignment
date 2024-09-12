import { create } from "zustand";

const useUserStore = create((set) => ({
  user: null,
  isLogin: false,
  setUser: (user) => set({ user }),
  setIsLogin: (isLogin) => set({ isLogin }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
