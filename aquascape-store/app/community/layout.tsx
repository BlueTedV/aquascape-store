import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Hub | Aquaku Shop",
  description:
    "Explore and share aquascape builds from the Aquaku community. Browse stunning planted aquariums, like your favorites, and upload your own creation.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
