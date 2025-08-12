import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "American Professional Management Institute of Hospitality",
  description:
    "Professional certifications for the hospitality industry, specializing in cruise ship and maritime hospitality training.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>

        {/* Zoho SalesIQ Initialization Script */}
        <Script
          id="zoho-salesiq-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};
            `,
          }}
        />
        {/* Zoho SalesIQ Widget Script */}
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.com/widget?wc=siq3fd10a26ef516a8d90a7389af5909cdc0f6efb7822c4cf5b85357a78da797eeb"
          strategy="afterInteractive"
          defer
        />
      </body>
    </html>
  )
}
