import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/auth-store';
import { Toaster } from "@/components/ui/sonner";
function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const checkAuth = useAuthStore(state => state.checkAuth);
  const navigate = useNavigate();
  useEffect(() => {
    // This single effect handles the entire authentication flow.
    // 1. It triggers the authentication check on component mount.
    checkAuth().then(() => {
      // 2. After the check is complete, we get the latest state from the store.
      const state = useAuthStore.getState();
      // 3. If loading is finished and the user is NOT authenticated, redirect to login.
      if (!state.isLoading && !state.isAuthenticated) {
        navigate('/', { replace: true });
      }
    });
  }, [checkAuth, navigate]);
  // While the initial authentication check is running, or if the user is not authenticated
  // (and the redirect is about to happen), show a full-page loader.
  // This prevents rendering the Outlet prematurely and avoids routing errors.
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-kadro-navy text-slate-900 dark:text-slate-50">
        <div className="flex items-center gap-4">
          <img src="https://raw.githubusercontent.com/user-attachments/assets/9b4a2754-2f3a-4ac2-8302-311124e75f3a" alt="KadroKur Logo" className="h-12 w-12 animate-pulse" />
          <h1 className="text-3xl font-bold text-slate-700 dark:text-slate-300">KadroKur</h1>
        </div>
        <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }
  // Only if loading is complete AND the user is authenticated, render the main app layout.
  return (
    <AppLayout>
      <Outlet />
      <Toaster richColors position="top-right" />
    </AppLayout>
  );
}
export default App;