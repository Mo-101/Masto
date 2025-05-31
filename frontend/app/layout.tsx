import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // Assuming you have a globals.css

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cesium Starter Kit - Modular",
  description: "Next.js 14 with Cesium and modular layout",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-100">
      <body className={`${inter.className} flex flex-col h-full`}>
        <header className="p-4 bg-gray-800 text-white shadow-md flex-shrink-0">
          <nav className="container mx-auto flex items-center gap-6">
            <a href="/" className="text-lg font-semibold hover:text-sky-400 transition-colors">
              Home
            </a>
            <a href="/map-dashboard" className="text-lg font-semibold hover:text-sky-400 transition-colors">
              Map Dashboard
            </a>
            {/* The /command-center link might be redundant if the map-dashboard handles it.
                Keeping it for now, but you might want to remove or change it. */}
            <a href="/command-center" className="text-lg font-semibold hover:text-sky-400 transition-colors">
              Old Command Center
            </a>
          </nav>
        </header>
        <main className="flex-grow overflow-y-auto">{children}</main>
      </body>
    </html>
  )
}
