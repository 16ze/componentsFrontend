"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Calendar,
} from "lucide-react";

// Navigation items configuration
const navItems = [
  {
    title: "Accueil",
    href: "/",
  },
  {
    title: "Services",
    href: "#",
    children: [
      {
        title: "Consultations",
        href: "/services/consultations",
        description: "Nos différentes offres de consultation personnalisée",
        icon: <User className="h-5 w-5 text-primary" />,
      },
      {
        title: "Réservations",
        href: "/booking",
        description: "Prenez rendez-vous en ligne rapidement",
        icon: <Calendar className="h-5 w-5 text-primary" />,
      },
      {
        title: "Support",
        href: "/services/support",
        description: "Besoin d'aide? Notre équipe est à votre disposition",
        icon: <Settings className="h-5 w-5 text-primary" />,
      },
    ],
  },
  {
    title: "À propos",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export function MainNavigation({ user }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Detect scroll for transparent/solid header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Logo component with light/dark variant support
  const Logo = () => (
    <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-primary-foreground">C</span>
      </div>
      <span>Company</span>
    </Link>
  );

  // Theme toggle button
  const ThemeToggle = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Settings className="h-4 w-4 mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // User menu component
  const UserMenu = () => {
    if (!user) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild className="hidden md:flex">
            <Link href="/register">Inscription</Link>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Separator className="my-1" />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <User className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          </DropdownMenuItem>
          <Separator className="my-1" />
          <DropdownMenuItem asChild>
            <Link href="/logout">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Desktop menu items with dropdown support
  const DesktopNavItems = () => (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map((item) => {
          // Regular link
          if (!item.children) {
            return (
              <NavigationMenuItem key={item.title}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === item.href &&
                        "bg-accent text-accent-foreground",
                      "transition-colors"
                    )}
                  >
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          }

          // Dropdown menu
          return (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuTrigger
                className={cn(
                  item.children.some((child) => pathname === child.href) &&
                    "bg-accent text-accent-foreground",
                  "transition-colors"
                )}
              >
                {item.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {item.children.map((child) => (
                    <li key={child.title} className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          href={child.href}
                          className={cn(
                            "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-4 no-underline outline-none focus:shadow-md",
                            pathname === child.href && "from-accent to-accent"
                          )}
                        >
                          <div className="mb-2 mt-4 flex items-center gap-2">
                            {child.icon}
                            <span className="text-sm font-medium">
                              {child.title}
                            </span>
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            {child.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );

  // Mobile navigation content (expanded sheet)
  const MobileNavContent = () => (
    <div className="flex flex-col space-y-6 pt-4">
      {navItems.map((item) => {
        // Regular link
        if (!item.children) {
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center py-2 text-base font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {item.title}
            </Link>
          );
        }

        // Section with sub-items
        return (
          <div key={item.title} className="space-y-3">
            <div className="font-semibold text-base">{item.title}</div>
            <div className="ml-4 border-l pl-4 flex flex-col space-y-3">
              {item.children.map((child) => (
                <Link
                  key={child.title}
                  href={child.href}
                  className={cn(
                    "flex items-center space-x-2 text-sm transition-colors hover:text-primary",
                    pathname === child.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    {child.icon}
                    <span>{child.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors duration-300",
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <DesktopNavItems />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu />

          {/* Mobile Menu Button */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-sm">
              <SheetHeader className="mb-4">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <MobileNavContent />

              {/* Mobile-only actions */}
              <div className="mt-8 space-y-4">
                {!user && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full"
                      size="lg"
                    >
                      <Link href="/login">Connexion</Link>
                    </Button>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/register">Inscription</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Usage example
// In layout.js:
// import { MainNavigation } from "@/components/layout/MainNavigation";
// export default function RootLayout({ children }) {
//   return (
//     <html lang="fr">
//       <body>
//         <MainNavigation user={null} /> {/* or provide user data */}
//         <main>{children}</main>
//       </body>
//     </html>
//   );
// }
