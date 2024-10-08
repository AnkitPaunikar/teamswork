import { ClerkProvider, SignedIn } from "@clerk/nextjs";

import "./globals.css";
import NavBar from "../components/Nav";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className='w-full'>
          <SignedIn>
            <NavBar />
          </SignedIn>
          <div>{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
