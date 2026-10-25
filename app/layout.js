import "./globals.css";

export const metadata = {
  title: "Catchit",
  description:
    "Catchit catches what companies ask you to do, before it slips. Assessment links, interview invites and deadlines, found in your email.",
  appleWebApp: { capable: true, title: "Catchit", statusBarStyle: "default" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#faf6ef" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#111315" media="(prefers-color-scheme: dark)" />
        {/* Applies a saved light/dark choice before the page paints, so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("catchit-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
