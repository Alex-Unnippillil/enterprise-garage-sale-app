'use client';

import StoreProvider from '@/state/redux';
import { Authenticator } from '@aws-amplify/ui-react';
import Auth from './(auth)/auth-provider';
import { ThemeProvider } from 'next-themes';
import { usePlaceholderSync } from '@/hooks/use-placeholder-sync';

const Providers = ({ children }: { children: React.ReactNode }) => {
  usePlaceholderSync();
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <StoreProvider>
        <Authenticator.Provider>
          <Auth>{children}</Auth>
        </Authenticator.Provider>
      </StoreProvider>
    </ThemeProvider>
  );
};

export default Providers;
