import { Link, NavLink, Outlet } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-primary ${
    isActive ? "text-primary" : "text-muted-foreground"
  }`;

const Layout = () => {
  const { isAdmin, user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Shield className="h-7 w-7 text-primary" strokeWidth={2.25} />
              <span className="absolute inset-0 rounded-full bg-primary/30 blur-md group-hover:bg-primary/50 transition-all" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm tracking-tight">SUPPLY CHAIN</span>
              <span className="font-mono text-[10px] text-primary tracking-widest">MONITOR</span>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <NavLink to="/" end className={navClass}>Feed</NavLink>
            <NavLink to="/about" className={navClass}>About</NavLink>
            {isAdmin && <NavLink to="/admin" className={navClass}>Admin</NavLink>}
            {user ? (
              <Button size="sm" variant="ghost" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            ) : (
              <Button size="sm" variant="outline" asChild>
                <Link to="/auth">Admin Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border/60 mt-16">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-mono text-xs">SUPPLY_CHAIN_MONITOR</span>
          </div>
          <p>© {new Date().getFullYear()} Supply Chain Monitor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
