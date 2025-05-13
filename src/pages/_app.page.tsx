import { globalStyles } from '@/src/styles/global';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';

globalStyles();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}