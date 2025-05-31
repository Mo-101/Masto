import type React from "react"
import { FirebaseProvider } from "./firebase-provider"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FirebaseProvider>{children}</FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
