"use client";

import React from "react";

// Magnetic effect removed — it was causing buttons to physically move on hover
// which users reported as a bug. Now just a passthrough wrapper.
export function Magnetic({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
