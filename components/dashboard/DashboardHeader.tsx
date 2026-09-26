"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard",          label: "Visão Geral",           icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contatos de Emergência", icon: Users          },
];

export function DashboardHeader({ userName }: { userName: string | null | undefined }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/dashboard" className="text-base font-bold text-neutral-900">
          SeniorCare
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-500 md:block">
            Olá, <strong className="text-neutral-900">{userName ?? "Usuário"}</strong>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-400 transition hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex border-t border-neutral-100 md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium ${
                active ? "border-t-2 border-neutral-900 text-neutral-900" : "text-neutral-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
