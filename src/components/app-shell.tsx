import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  Search,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
  { to: "/planner", label: "AI Planner", icon: WandSparkles },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
        <Sparkles className="size-4.5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-sidebar-foreground">AI Workday</span>
        <span className="block text-xs text-muted-foreground">Copilot</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1" aria-label="Main">
      {nav.map((item) => {
        const active = pathname === item.to || (item.to === "/dashboard" && pathname === "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4.5 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="border-t border-sidebar-border pt-4">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
          AM
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-sidebar-foreground">
            Alex Mokoena
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            Product Operations
          </span>
        </span>
        <Button asChild variant="ghost" size="icon" aria-label="Account settings" title="Account settings">
          <Link to="/settings" onClick={onNavigate}>
            <Settings className="size-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <div className="space-y-6">
          <Brand />
          <NavLinks />
        </div>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur lg:hidden">
          <Brand />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="size-4.5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[17rem] flex-col justify-between px-4 py-5">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="space-y-6">
                <Brand />
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <SidebarFooter onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
