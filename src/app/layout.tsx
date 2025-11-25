import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalFooter from "@/components/ConditionalFooter";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: 'swap',
});

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ['400', '500', '600', '700', '800'],
	display: 'swap',
});

export const metadata: Metadata = {
	title: "SmartScrap - Smart Waste Management Platform",
	description: "Turn your waste into value. Connect with local recyclers, schedule doorstep pickups, and earn money from your recyclables.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" type="image/x-icon"></link>
			</head>
			<body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
				{children}
				<ConditionalFooter />
			</body>
		</html>
	);
}
