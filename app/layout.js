import "./globals.css";

export const metadata = {
  title: "Catchit",
  description:
    "Catchit catches what companies ask you to do, before it slips. Assessment links, interview invites and deadlines, found in your email.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
