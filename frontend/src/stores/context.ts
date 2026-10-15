import { createContext, useContext } from 'react';
import type { RootStore } from './RootStore';
export const StoreContext = createContext<RootStore | null>(null);
export function useStores(): RootStore {
  const stores = useContext(StoreContext);
  if (!stores) throw new Error('StoreContext is missing');
  return stores;
}
