import Link from "next/link";
import { Building2, LogOut } from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-2 text-sm font-bold text-primary-foreground shadow shadow-primary/30">
              N
            </div>
            <div className="hidden sm:block">
              <p className="text-[15px] font-semibold leading-none tracking-tight">
                NAWA Contas
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                Administração
              </p>
            </div>
          </div>

          <nav className="flex flex-1 items-center gap-1">
            <Link
              href="/empresas"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              <Building2 className="h-4 w-4" />
              Empresas
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-[13px] text-muted-foreground sm:inline">
              {admin.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger active:scale-95"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6">{children}</main>
    </div>
  );
}
