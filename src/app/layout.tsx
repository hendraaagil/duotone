import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

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
				{children}
			</body>
		</html>
	)
}
