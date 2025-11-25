import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Dashboard - SmartScrap",
	description: "Your personal waste management dashboard. Track recyclables, schedule pickups, and earn money while helping the environment.",
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
