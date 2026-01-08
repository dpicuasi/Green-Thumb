import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Sprout, LayoutDashboard, Calendar, Sparkles, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const links = [
    { href: "/", label: t("nav.myPlants"), icon: Sprout },
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/ai-advisor", label: t("nav.chat"), icon: Sparkles },
    { href: "/profile", label: t("nav.profile", { defaultValue: "Profile" }), icon: User },
    { href: "/subscription", label: t("nav.subscription"), icon: Calendar },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-display font-bold text-primary flex items-center gap-2">
          <Sprout className="w-8 h-8 fill-primary/20" />
          {t("app.name")}
        </h1>
        {user && (
          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.firstName?.[0] || user.email?.[0] || "U"}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{user.firstName || 'Gardener'}</span>
              <span className="text-xs">{user.email}</span>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                <span className="font-medium">{link.label}</span>
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50 flex flex-col gap-2">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">{t("nav.language", { defaultValue: "Language" })}</span>
          <LanguageSwitcher />
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5" />
          {t("nav.logout", { defaultValue: "Log Out" })}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50 px-4 flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-primary flex items-center gap-2">
          <Sprout className="w-6 h-6" />
          {t("app.name")}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border/50 shadow-sm z-40">
        <NavContent />
      </div>

      {/* Spacer for mobile header */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
