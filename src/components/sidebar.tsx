"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet, UserCircle, RotateCcw, History } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Movimentações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Logs", href: "/admin/logs", icon: History },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#111318] flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Top Header (Brand Only) */}
      <header className="h-16 flex items-center justify-between px-6 bg-[#1A1C1E] border-b border-[#43474E] md:hidden sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D0E4FF] flex items-center justify-center text-[#003258] shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="text-lg font-bold text-[#E2E2E6] tracking-tight">FLY DEA</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#3C4858] flex items-center justify-center">
          <UserCircle className="w-6 h-6 text-[#D7E3F7]" />
        </div>
      </header>

      {/* M3 Navigation Drawer (Sidebar - Desktop Only) */}
      <aside className="w-80 bg-[#1A1C1E] border-r border-[#43474E] hidden md:flex flex-col fixed inset-y-0 z-50 p-4">
        <div className="h-20 flex items-center px-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D0E4FF] flex items-center justify-center text-[#003258] shadow-sm">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#E2E2E6]">
                FLY DEA
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#C3C7CF]">Dashboard M3</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-[#00497D] text-[#D1E4FF] font-bold shadow-sm" 
                    : "text-[#C3C7CF] hover:bg-[#43474E]/30 hover:text-[#E2E2E6]"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive ? "text-[#D1E4FF]" : "group-hover:text-[#D1E4FF] transition-colors")} />
                <span className="text-sm tracking-tight">{item.name}</span>
                {isActive && (
                   <div className="absolute left-0 w-1.5 h-6 bg-[#D1E4FF] rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-4 pt-4 border-t border-[#43474E]">
          <div className="p-4 rounded-[28px] bg-[#1D2024] border border-[#43474E] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#3C4858] flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-[#D7E3F7]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#E2E2E6] truncate">
                {session?.user?.name || "Augusto"}
              </p>
              <p className="text-[10px] text-[#C3C7CF] truncate uppercase font-bold tracking-tighter">{session?.user?.email}</p>
            </div>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-3 px-6 py-4 w-full rounded-full text-xs font-bold text-[#F2B8B5] bg-[#8C1D18]/10 hover:bg-[#8C1D18]/20 border border-[#8C1D18]/20 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            ENCERRAR SESSÃO
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 min-h-screen pb-24 md:pb-0">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
