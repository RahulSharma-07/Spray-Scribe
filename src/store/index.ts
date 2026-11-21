import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  credits: number;
  plan: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  updateCredits: (credits: number) => void;
  deductCredits: (amount: number) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateCredits: (credits) =>
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        })),
      deductCredits: (amount) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, credits: Math.max(0, state.user.credits - amount) }
            : null,
        })),
    }),
    { name: "user-store" }
  )
);

interface NotificationStore {
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    createdAt: Date;
  }>;
  addNotification: (
    type: "success" | "error" | "warning" | "info",
    message: string
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), type, message, createdAt: new Date() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () => set({ notifications: [] }),
}));

interface GenerationStore {
  isGenerating: boolean;
  currentOutput: string | null;
  setGenerating: (v: boolean) => void;
  setOutput: (output: string | null) => void;
  clearOutput: () => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  isGenerating: false,
  currentOutput: null,
  setGenerating: (v) => set({ isGenerating: v }),
  setOutput: (output) => set({ currentOutput: output }),
  clearOutput: () => set({ currentOutput: null }),
}));
