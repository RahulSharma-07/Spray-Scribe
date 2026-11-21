declare module "react" {
  export type ChangeEvent<T = Element> = any;
  export type ReactNode = any;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  export default any;
}

declare global {
  namespace React {
    type ReactNode = any;
    interface ChangeEvent<T = Element> {
      target: {
        value: string;
      } & T;
    }
  }
}

declare module "react-dom";
declare module "lucide-react";
declare module "react-hot-toast";
declare module "framer-motion";
declare module "gsap" {
  const gsap: any;
  export { gsap };
  export default gsap;
}
declare module "gsap/ScrollTrigger";
declare module "next" {
  export type NextConfig = any;
  export type Metadata = any;
}
declare module "next/server";
declare module "next/link";
declare module "next/navigation";
declare module "next-auth/react";
declare module "@/*";

namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
