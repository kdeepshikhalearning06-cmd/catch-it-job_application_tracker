// Makes Catchit installable ("Add to Home Screen"), which iPhones need before they allow notifications.
export default function manifest() {
  return {
    name: "Catchit",
    short_name: "Catchit",
    description: "Catches the tests, interviews and deadlines companies send you, and reminds you in time.",
    start_url: "/today",
    scope: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#046a38",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
