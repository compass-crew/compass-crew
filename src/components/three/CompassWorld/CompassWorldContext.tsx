import { createContext, useContext } from "react";
import type { CompassWorldContextValue } from "./types";

export const CompassWorldContext = createContext<CompassWorldContextValue | null>(null);

export function useCompassWorld(): CompassWorldContextValue {
  const context = useContext(CompassWorldContext);
  if (!context) {
    throw new Error("useCompassWorld must be used within a CompassWorld provider");
  }
  return context;
}
