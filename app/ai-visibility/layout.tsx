import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Visibility Check | De-Omega-Point",
  description: "Check whether AI systems can understand, trust and recommend your Australian business.",
};

export default function AIVisibilityLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
