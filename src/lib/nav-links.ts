
import type { LucideIcon } from 'lucide-react';
import { Lock, MessageSquare, BookOpen, BarChart2, Archive, LogIn, User, UserCog, Link2, FileText, Upload, MessageCircle, Star, BadgePercent, Home, FileWarning, Milestone } from 'lucide-react';

export interface NavLink {
    href: string;
    label: string;
    authRequired?: boolean;
    adminRequired?: boolean;
    id: string;
    guestOnly?: boolean;
}

export const navLinks: NavLink[] = [
    { href: '/my-bookings', label: 'My Bookings', id: 'my-bookings' },
    { href: '/login', label: 'Sign in', id: 'login', guestOnly: true },
    { href: '/feedback', label: 'Feedback', id: 'feedback' },
    { href: '/report', label: 'Report', id: 'report' },
];

export const adminNavItems = [
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'trip-plans', label: 'Trip Plans', icon: Milestone },
  { id: 'cars-and-pricing', label: 'Cars and Pricing', icon: BookOpen },
  { id: 'banners', label: 'Banners', icon: BookOpen },
  { id: 'offer-zone', label: 'Offer Zone', icon: BadgePercent },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'archiving', label: 'Archiving', icon: Archive },
  { id: 'web-logins', label: 'Web Logins', icon: LogIn },
  { id: 'customer-details', label: 'Customer And Driver Profile', icon: User },
  { id: 'user-roles', label: 'Admin Roles', icon: UserCog },
  { id: 'redirect-linkings', label: 'Redirect & Linkings', icon: Link2 },
  { id: 'taxes-and-charges', label: 'Taxes & Charges', icon: FileText },
  { id: 'inclusions-exclusions', label: 'Inclusions & Exclusions', icon: FileText },
  { id: 'toll-data', label: 'Toll Data', icon: Upload },
  { id: 'user-reports', label: 'User Reports', icon: MessageCircle },
  { id: 'user-feedbacks', label: 'User Feedbacks', icon: Star },
];
