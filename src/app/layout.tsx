import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import './globals.css'
import { Footer } from '@/components/ui/footer'

const geistSans = Geist({
	variable: '--font-geist-sans',
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Duotone Filters',
	description: 'Duotone image filters',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} font-sans antialiased`}
				suppressHydrationWarning
			>
				<Toaster />
				<div className="flex min-h-screen flex-col">
					<main className="flex-1">{children}</main>
					<Footer />
				</div>
			</body>
		</html>
	)
}
