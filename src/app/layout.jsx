import "./globals.css";

export const metadata = {
  title: "Loading...",
  description: "Generated by Kritmank",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-400">{children}</body>
    </html>
  );
}
