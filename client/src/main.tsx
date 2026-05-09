import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { queryClient } from './lib/queryClient';
import { useAuth } from './lib/auth';
import { Toaster } from './components/ui/toaster';
import './index.css';

useAuth.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
