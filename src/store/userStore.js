import { create } from 'zustand';

const userStore = create((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    clearUser: () => set({ user: null }),
}));

export default userStore;
