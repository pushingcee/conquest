import "./globals.css";

export const metadata = {
  title: "Завладей България!",
  description: "Образователна игра за завладяване на територии",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
