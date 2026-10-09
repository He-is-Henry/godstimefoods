import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
