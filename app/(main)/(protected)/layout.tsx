"use client"

import { useAuth } from "@/context/AuthContext"
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react"

type Props = {
  children: ReactNode
}
export default function ProtectedLayout({ children }: Props) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    }
  }, [loading, isAuthenticated, router, pathname])

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
    </div>
  )

  return <>{children}</>
}