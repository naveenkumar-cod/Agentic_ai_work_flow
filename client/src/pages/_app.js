import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { ThemeProvider } from '../context/ThemeContext';

export default function MyApp({ Component, pageProps }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <Head>
        <title>Agentflow_AI | Multi-Agent Operations Automation Platform</title>
        <meta
          name="description"
          content="Turn natural language prompts into executable multi-agent workflows with real OAuth integrations and live event streaming."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
