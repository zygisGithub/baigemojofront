import { create } from 'zustand';

const userStore = create((set) => ({
    user: null,

    setUser: (user) => set({ user }),

    clearUser: () => set({ user: null }),

    updateUserPhoto: (photo) => set((state) => ({
        user: {
            ...state.user,
            photo
        }
    })),
}));

export default userStore;
