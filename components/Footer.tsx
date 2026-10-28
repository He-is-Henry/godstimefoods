import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 text-xs py-8 mt-auto mb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Godstime Food Canteen. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-slate-200 transition-colors">
            Shop
          </Link>
          <Link href="/profile" className="hover:text-slate-200 transition-colors">
            Account
          </Link>
        </div>
      </div>
    </footer>
  );
}
