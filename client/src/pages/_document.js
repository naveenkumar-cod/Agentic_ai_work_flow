import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const themeInitScript = `
    (function() {
      try {
        var stored = localStorage.getItem('agentflow_theme') || 'system';
        var isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      } catch (e) {}
    })();
  `;

  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </Head>
      <body className="bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
