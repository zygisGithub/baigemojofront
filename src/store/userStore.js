import create from 'zustand';

const userStore = create((set) => ({
    user: null,

    setUser: (userData) => set({ user: userData }),

    clearUser: () => set({ user: null }),
}));

export default userStore;
