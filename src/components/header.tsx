
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { Menu, X, Lock, LogOut, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { navLinks, type NavLink } from '@/lib/nav-links';
import type { UserRole } from '@/lib/types';
import { ThemeToggle } from './theme-toggle';
import { Badge } from './ui/badge';

const ADMIN_AUTH_KEY = 'zyro_admin_auth';
const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72'; // Keep for legacy or update to Supabase UID

export default function Header() {
  const scrollDirection = useScrollDirection();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
          sessionStorage.setItem('zyro_user_auth', 'true');
          
          let hasAdminRole = false;
          // Note: In Supabase, you might want to use JWT claims for roles, 
          // but for now we follow the legacy pattern of a 'roles' table.
          const { data: roleData } = await supabase
              .from('roles')
              .select('role')
              .eq('uid', currentUser.id)
              .single();

          if (roleData && (roleData.role === 'Admin' || roleData.role === 'Sub-Admin')) {
              hasAdminRole = true;
          }
          
          setIsAdmin(hasAdminRole);
          if (hasAdminRole) {
              sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
          } else {
              sessionStorage.removeItem(ADMIN_AUTH_KEY);
          }

      } else {
          sessionStorage.removeItem('zyro_user_auth');
          sessionStorage.removeItem(ADMIN_AUTH_KEY);
          setIsAdmin(false);
          setPendingBookingsCount(0);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !user.id) {
        setPendingBookingsCount(0);
        return;
    };

    // Initial fetch
    const fetchPendingCount = async () => {
        const { count, error } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('customer_uid', user.id)
            .eq('status', 'pending');
        
        if (!error) setPendingBookingsCount(count || 0);
    };
    
    fetchPendingCount();

    // Subscribe to changes
    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'bookings',
                filter: `customer_uid=eq.${user.id}`
            },
            () => fetchPendingCount()
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };

  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.clear();
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const renderNavLinks = (isMobile: boolean, includeAuth: boolean) => {
    const allLinks = [...navLinks];
    if(isAdmin) {
        allLinks.push({ href: '/admin', label: 'Admin', authRequired: true, adminRequired: true, id: 'admin-home' });
    }

    const linkItems = allLinks.map((link: NavLink) => {
        const isAuthLink = link.id === 'login';
        if (includeAuth !== isAuthLink) return null;

        if ((link.authRequired && !user) || (link.guestOnly && user) || (link.adminRequired && !isAdmin)) {
            return null;
        }
        
        // Don't show admin link on desktop nav, it's next to the avatar
        if (link.id === 'admin-home' && !isMobile) {
            return null;
        }

        const showBadge = link.id === 'my-bookings' && pendingBookingsCount > 0;

        const linkContent = (
            <div className="flex items-center gap-2">
                <span>{link.label}</span>
                 {showBadge && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                        {pendingBookingsCount}
                    </Badge>
                )}
            </div>
        );

        if (isMobile) {
            return (
                <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                        {linkContent}
                    </Link>
                </DropdownMenuItem>
            );
        }
        return (
             <Button key={link.href} asChild variant="link" className="text-primary-foreground">
                <Link href={link.href}>
                    {linkContent}
                </Link>
            </Button>
        )
    }).filter(Boolean);

    if (isMobile) {
        if (!isLoading) {
            if (user) {
                linkItems.push(<DropdownMenuSeparator key="separator" />);
                linkItems.push(
                    <DropdownMenuItem key="logout" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                );
            }
        }
    }
    return linkItems;
  }


  return (
    <header 
      className={`sticky top-0 z-50 bg-primary text-primary-foreground transition-transform duration-300 ${
        scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="px-4 md:px-6">
        <div className="relative flex justify-between items-center h-14 md:h-16">
          <div className="flex-1 flex justify-start items-center gap-2">
            {!isLoading && user ? (
                <>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                                  <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                          </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start" forceMount>
                          <DropdownMenuLabel className="font-normal">
                              <div className="flex flex-col space-y-1">
                                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                  {user.phoneNumber && (
                                      <p className="text-xs leading-none text-muted-foreground flex items-center gap-1 pt-1">
                                          <Phone className="w-3 h-3" />
                                          {user.phoneNumber}
                                      </p>
                                  )}
                              </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Log out</span>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  {isAdmin && (
                      <Button asChild variant="link" className="text-primary-foreground hidden md:inline-flex">
                          <Link href="/admin">
                              <Lock className="mr-2 h-4 w-4" />
                              Admin
                          </Link>
                      </Button>
                  )}
                </>
            ) : !isLoading && (
                 <nav className="hidden md:flex items-center gap-1">
                    {renderNavLinks(false, true)}
                </nav>
            )}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="flex items-center">
                <Image
                src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/ZyrocabBB-Photoroom.png"
                alt="ZyroCabs Logo"
                width={70}
                height={20}
                className="object-contain"
                priority
                />
            </Link>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <nav className="hidden md:flex items-center gap-1">
                {renderNavLinks(false, false)}
            </nav>
             <div className="hidden md:block ml-4">
                <ThemeToggle />
            </div>
            <div className="md:hidden">
              <DropdownMenu onOpenChange={setIsMenuOpen} open={isMenuOpen}>
                  <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon">
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      {renderNavLinks(true, true)}
                      <DropdownMenuSeparator />
                      {renderNavLinks(true, false)}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div className="flex items-center justify-between w-full">
                           <span>Theme</span>
                           <ThemeToggle />
                        </div>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
