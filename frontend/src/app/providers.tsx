'use client';
import { store } from '@/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { RootState, AppDispatch } from '@/store';
import { rehydrateCustomer } from '@/store/slices/customerAuthSlice';
import { rehydrateSeller } from '@/store/slices/sellerAuthSlice';
import { rehydrateAdmin } from '@/store/slices/adminAuthSlice';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
});

function AuthRehydrator() {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(rehydrateCustomer());
    dispatch(rehydrateSeller());
    dispatch(rehydrateAdmin());
  }, [dispatch]);
  return null;
}

function DarkModeSync() {
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    document.body.style.color = darkMode ? '#f1f5f9' : '#0f172a';
  }, [darkMode]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthRehydrator />
        <DarkModeSync />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '12px', fontWeight: '600', borderRadius: '4px' },
          }}
        />
      </QueryClientProvider>
    </Provider>
  );
}
