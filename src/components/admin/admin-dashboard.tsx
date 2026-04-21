
'use client';

import { getAdminDashboardData, saveCarData, updateBookingDetailsInSheet, saveContactDetails, saveGoogleSheetId, savePlaceholderImages, saveFeedbacksToSheet, saveTaxesAndCharges, saveInclusionsExclusions, saveButtonSettings, uploadTollDataToFirestore, getTollsFromFirestore, archiveOldDataToSheet, getUserRoles, saveUserRoles, deleteAllDataByCategory, getUserByEmail, saveOffersToFirestore } from '@/lib/actions';
import { Suspense, useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Car, Booking, WebLogin, CustomerDetail, RedirectLinking, Location, ContactDetails, UserReport, UserFeedback, ImagePlaceholder, TripPlan, TaxesAndCharges, InclusionsExclusions, ButtonSettings, TollPlaza, UserRole, Offer, Driver } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { isEqual } from 'lodash';
import { Loader2, Plus, Trash2, Archive, Image as ImageIcon, LogOut } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminNav from './admin-nav';
import { ThemeToggle } from '../theme-toggle';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { adminNavItems, type NavLink } from '@/lib/nav-links';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';


const BookingsTable = dynamic(() => import('@/components/admin/bookings-table'), { loading: () => <TableSkeleton /> });
const TripPlansTable = dynamic(() => import('@/components/admin/trip-plans-table'), { loading: () => <TableSkeleton /> });
const CarsAndPricingTable = dynamic(() => import('@/components/admin/cars-pricing-table'), { loading: () => <TableSkeleton /> });
const BannersTable = dynamic(() => import('@/components/admin/banners-table'), { loading: () => <TableSkeleton /> });
const OfferZoneSettings = dynamic(() => import('@/components/admin/offer-zone-settings'), { loading: () => <TableSkeleton /> });
const AnalyticsDashboard = dynamic(() => import('./analytics-dashboard'), { loading: () => <div className="space-y-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></div> });
const WebLoginsTable = dynamic(() => import('./web-logins-table'), { loading: () => <TableSkeleton /> });
const CustomerDetailsTable = dynamic(() => import('./customer-details-table'), { loading: () => <TableSkeleton /> });
const DriversTable = dynamic(() => import('./drivers-table'), { loading: () => <TableSkeleton /> });
const UserRolesTable = dynamic(() => import('./user-roles-table'), { loading: () => <TableSkeleton /> });
const UserReportsTable = dynamic(() => import('./user-reports-table'), { loading: () => <TableSkeleton /> });
const UserFeedbacksTable = dynamic(() => import('./user-feedbacks-table'), { loading: () => <TableSkeleton /> });
const ContactSettings = dynamic(() => import('./contact-settings'), { loading: () => <Skeleton className="h-64 w-full" /> });
const ButtonRedirectSettings = dynamic(() => import('./button-redirect-settings'), { loading: () => <Skeleton className="h-64 w-full" /> });
const TaxesChargesSettings = dynamic(() => import('./taxes-charges-settings'), { loading: () => <Skeleton className="h-64 w-full" /> });
const InclusionsExclusionsSettings = dynamic(() => import('./inclusions-exclusions-settings'), { loading: () => <Skeleton className="h-64 w-full" /> });
const TollDataUploader = dynamic(() => import('./toll-data-uploader'), { loading: () => <Skeleton className="h-64 w-full" /> });
const BookingFilters = dynamic(() => import('@/components/admin/booking-filters'));


type SortKey = 'createdAt' | 'customer.name' | 'status';
type SortDirection = 'asc' | 'desc';
type CustomerSortKey = 'name' | 'email' | 'bookingsCount';
type DeletableCategory = 'bookings' | 'trip-plans' | 'web-logins' | 'customer-details' | 'user-reports' | 'user-feedbacks' | 'drivers';


const PRIMARY_ADMIN_UID = '4X7WYJxguMTm6ivpmwTINmpSkI72';
const CONFIRMATION_WORDS: Record<DeletableCategory, string> = {
    'bookings': 'RIDES',
    'trip-plans': 'PLANS',
    'web-logins': 'SESSIONS',
    'customer-details': 'USERS',
    'user-reports': 'ISSUES',
    'user-feedbacks': 'REVIEWS',
    'drivers': 'DRIVERS',
};

interface UserProfile extends User {
    photoURL: string | null;
}

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'bookings');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [originalBookings, setOriginalBookings] = useState<Booking[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [originalTripPlans, setOriginalTripPlans] = useState<TripPlan[]>([]);
  const [editableCars, setEditableCars] = useState<Car[]>([]);
  const [originalCars, setOriginalCars] = useState<Car[]>([]);
  const [webLogins, setWebLogins] = useState<WebLogin[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetail[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [originalUserRoles, setOriginalUserRoles] = useState<UserRole[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [originalUserReports, setOriginalUserReports] = useState<UserReport[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>([]);
  const [originalUserFeedbacks, setOriginalUserFeedbacks] = useState<UserFeedback[]>([]);
  const [banners, setBanners] = useState<ImagePlaceholder[]>([]);
  const [originalBanners, setOriginalBanners] = useState<ImagePlaceholder[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [originalOffers, setOriginalOffers] = useState<Offer[]>([]);
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
  const [originalContactDetails, setOriginalContactDetails] = useState<ContactDetails | null>(null);
  const [buttonSettings, setButtonSettings] = useState<ButtonSettings | null>(null);
  const [originalButtonSettings, setOriginalButtonSettings] = useState<ButtonSettings | null>(null);
  const [taxesAndCharges, setTaxesAndCharges] = useState<TaxesAndCharges | null>(null);
  const [originalTaxesAndCharges, setOriginalTaxesAndCharges] = useState<TaxesAndCharges | null>(null);
  const [inclusionsExclusions, setInclusionsExclusions] = useState<InclusionsExclusions | null>(null);
  const [originalInclusionsExclusions, setOriginalInclusionsExclusions] = useState<InclusionsExclusions | null>(null);
  const [geocodedLocations, setGeocodedLocations] = useState<Location[]>([]);
  const [tollPlazaCount, setTollPlazaCount] = useState(0);
  const [tollPlazas, setTollPlazas] = useState<TollPlaza[]>([]);
  const supabase = createClient();
  
  const [archivableBookings, setArchivableBookings] = useState<Booking[]>([]);
  const [archivableTripPlans, setArchivableTripPlans] = useState<TripPlan[]>([]);
  const [archivableUserReports, setArchivableUserReports] = useState<UserReport[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, startArchiving] = useTransition();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [customerSortKey, setCustomerSortKey] = useState<CustomerSortKey>('name');
  const [customerSortDirection, setCustomerSortDirection] = useState<SortDirection>('asc');
  
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const [isDeleting, startDeleting] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<DeletableCategory | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [selectedTripPlanIds, setSelectedTripPlanIds] = useState<string[]>([]);
  const [selectedWebLoginIds, setSelectedWebLoginIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);

  
  const canDeleteData = useMemo(() => {
    if (!currentUserRole) return false;
    return currentUserRole.role === 'Admin';
  }, [currentUserRole]);
  
  const canEditBookings = useMemo(() => {
    if (!currentUserRole) return false;
    return currentUserRole.role === 'Admin' || (currentUserRole.role === 'Sub-Admin' && currentUserRole.permissions.includes('bookings'));
  }, [currentUserRole]);

  const bookingChanges = useMemo(() => !isEqual(originalBookings, bookings), [originalBookings, bookings]);
  const carChanges = useMemo(() => !isEqual(originalCars, editableCars), [originalCars, editableCars]);
  const bannerChanges = useMemo(() => !isEqual(originalBanners, banners), [originalBanners, banners]);
  const offerChanges = useMemo(() => !isEqual(originalOffers, offers), [originalOffers, offers]);
  const contactChanges = useMemo(() => !isEqual(originalContactDetails, contactDetails), [originalContactDetails, contactDetails]);
  const buttonSettingsChanges = useMemo(() => !isEqual(originalButtonSettings, buttonSettings), [originalButtonSettings, buttonSettings]);
  const taxesChargesChanges = useMemo(() => !isEqual(originalTaxesAndCharges, taxesAndCharges), [originalTaxesAndCharges, taxesAndCharges]);
  const inclusionsExclusionsChanges = useMemo(() => !isEqual(originalInclusionsExclusions, inclusionsExclusions), [originalInclusionsExclusions, inclusionsExclusions]);
  const feedbackChanges = useMemo(() => !isEqual(originalUserFeedbacks, userFeedbacks), [originalUserFeedbacks, userFeedbacks]);
  const userRolesChanges = useMemo(() => !isEqual(originalUserRoles, userRoles), [originalUserRoles, userRoles]);
  const hasChanges = bookingChanges || carChanges || contactChanges || bannerChanges || offerChanges || feedbackChanges || taxesChargesChanges || inclusionsExclusionsChanges || buttonSettingsChanges || userRolesChanges;

  const pendingBookingsCount = useMemo(() => {
    return originalBookings.filter(b => b.status === 'pending').length;
  }, [originalBookings]);
  
  const fetchData = useCallback(async () => {
      setLoading(true);
      const adminData = await getAdminDashboardData();

      if(adminData.type === 'success'){
        const {
            bookings: fetchedBookings,
            tripPlans: fetchedTripPlans,
            reports: fetchedReports,
            ...restOfData
        } = adminData;

        // Ensure the primary admin has an admin role
        const primaryAdminRole = restOfData.userRoles.find(role => role.uid === PRIMARY_ADMIN_UID);
        if (!primaryAdminRole || primaryAdminRole.role !== 'Admin') {
            const updatedRoles = [
                ...restOfData.userRoles.filter(role => role.uid !== PRIMARY_ADMIN_UID),
                {
                    uid: PRIMARY_ADMIN_UID,
                    email: 'karthick.kk2003@gmail.com', // Placeholder, can be updated
                    name: 'KrishnaKumar',
                    role: 'Admin' as 'Admin',
                    permissions: adminNavItems.map(item => item.id),
                }
            ];
            setUserRoles(updatedRoles);
            setOriginalUserRoles(JSON.parse(JSON.stringify(updatedRoles)));
            await saveUserRoles(updatedRoles);
        } else {
            setUserRoles(restOfData.userRoles);
            setOriginalUserRoles(JSON.parse(JSON.stringify(restOfData.userRoles)));
        }

        setBookings(fetchedBookings);
        setOriginalBookings(JSON.parse(JSON.stringify(fetchedBookings)));
        setTripPlans(fetchedTripPlans);
        setOriginalTripPlans(JSON.parse(JSON.stringify(fetchedTripPlans)));
        setUserReports(fetchedReports);
        setOriginalUserReports(JSON.parse(JSON.stringify(fetchedReports)));

        setEditableCars(JSON.parse(JSON.stringify(restOfData.cars)));
        setOriginalCars(JSON.parse(JSON.stringify(restOfData.cars)));
        setGeocodedLocations(restOfData.geocodedLocations || []);
        setCustomerDetails(restOfData.customers);
        setBanners(JSON.parse(JSON.stringify(restOfData.banners)));
        setOriginalBanners(JSON.parse(JSON.stringify(restOfData.banners)));
        setOffers(restOfData.offers || []);
        setOriginalOffers(JSON.parse(JSON.stringify(restOfData.offers || [])));
        setWebLogins(restOfData.webLogins);
        setContactDetails(restOfData.contactDetails);
        setOriginalContactDetails(JSON.parse(JSON.stringify(restOfData.contactDetails)));
        setButtonSettings(restOfData.buttonSettings);
        setOriginalButtonSettings(JSON.parse(JSON.stringify(restOfData.buttonSettings)));
        setTaxesAndCharges(restOfData.taxesAndCharges);
        setOriginalTaxesAndCharges(JSON.parse(JSON.stringify(restOfData.taxesAndCharges)));
        setInclusionsExclusions(restOfData.inclusionsExclusions);
        setOriginalInclusionsExclusions(JSON.parse(JSON.stringify(restOfData.inclusionsExclusions)));
        setUserFeedbacks(restOfData.feedbacks);
        setOriginalUserFeedbacks(JSON.parse(JSON.stringify(restOfData.feedbacks)));
        setTollPlazaCount(restOfData.tollPlazaCount || 0);
        setTollPlazas(restOfData.tollPlazas || []);
      } else {
        console.error("Error fetching admin data:", adminData.message);
      }

      setLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user as UserProfile | null);
    });
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setArchivableBookings(originalBookings.filter(b => new Date(b.createdAt) < thirtyDaysAgo));
    setArchivableTripPlans(originalTripPlans.filter(tp => new Date(tp.timestamp) < thirtyDaysAgo));
    setArchivableUserReports(originalUserReports.filter(ur => new Date(ur.timestamp) < thirtyDaysAgo));
  }, [originalBookings, originalTripPlans, originalUserReports]);


  useEffect(() => {
    if (currentUser?.email && !currentUser.photoURL) {
        getUserByEmail(currentUser.email).then(result => {
            if (result.success && result.user?.photoURL) {
                setCurrentUser(prevUser => ({
                    ...prevUser!,
                    photoURL: result.user!.photoURL!,
                }));
            }
        });
    }
  }, [currentUser?.email, currentUser?.photoURL]);


  useEffect(() => {
    if (currentUser && userRoles.length > 0) {
        if(currentUser.uid === PRIMARY_ADMIN_UID) {
            setCurrentUserRole({ uid: PRIMARY_ADMIN_UID, name: 'KrishnaKumar', email: 'karthick.kk2003@gmail.com', role: 'Admin', permissions: adminNavItems.map(i => i.id) });
        } else {
            const role = userRoles.find(r => r.uid === currentUser.uid);
            setCurrentUserRole(role || null);
        }
    }
  }, [currentUser, userRoles]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'bookings';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  const visibleNavItems = useMemo(() => {
    if (!currentUserRole) return [];
    if (currentUserRole.role === 'Admin') {
        return adminNavItems;
    }
    if (currentUserRole.role === 'Sub-Admin' && currentUserRole.permissions) {
        return adminNavItems.filter(item => currentUserRole.permissions.includes(item.id));
    }
    return [];
  }, [currentUserRole]);

  useEffect(() => {
    // If the user's role is loaded and the current tab is not in their visible items,
    // redirect them to the first visible item or a default.
    if (currentUserRole && visibleNavItems.length > 0) {
        const currentTabIsValid = visibleNavItems.some(item => item.id === activeTab);
        setIsAccessDenied(!currentTabIsValid);
        if (!currentTabIsValid) {
            setActiveTab(visibleNavItems[0].id);
        }
    }
  }, [activeTab, currentUserRole, visibleNavItems]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleCarDataChange = useCallback((updatedCars: Car[]) => {
    setEditableCars(updatedCars);
  }, []);
  
  const handleBookingDataChange = useCallback((updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
  }, []);

  const handleBannerDataChange = useCallback((updatedBanners: ImagePlaceholder[]) => {
    setBanners(updatedBanners);
  }, []);

  const handleOfferDataChange = useCallback((updatedOffers: Offer[]) => {
    setOffers(updatedOffers);
  }, []);

  const handleFeedbackDataChange = useCallback((updatedFeedbacks: UserFeedback[]) => {
    setUserFeedbacks(updatedFeedbacks);
  }, []);
  
  const handleUserRolesChange = useCallback((updatedRoles: UserRole[]) => {
    setUserRoles(updatedRoles);
  }, []);

  const handleContactDetailsChange = useCallback((updatedDetails: ContactDetails) => {
    setContactDetails(updatedDetails);
  }, []);

  const handleButtonSettingsChange = useCallback((updatedSettings: ButtonSettings) => {
    setButtonSettings(updatedSettings);
  }, []);
  
  const handleTaxesChargesChange = useCallback((updatedTaxes: TaxesAndCharges) => {
    setTaxesAndCharges(updatedTaxes);
  }, []);

  const handleInclusionsExclusionsChange = useCallback((updatedData: InclusionsExclusions) => {
    setInclusionsExclusions(updatedData);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.clear();
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    
    const savePromises: Promise<any>[] = [];

    if (bookingChanges) {
      const updates = bookings
        .map((b, i) => {
          const original = originalBookings.find(ob => ob.id === b.id);
          if (original && !isEqual(b, original)) {
            return {
              bookingId: b.id,
              status: b.status,
              driverName: b.driverName,
              driverNo: b.driverNo,
              carNo: b.carNo,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (updates.length > 0) {
          savePromises.push(updateBookingDetailsInSheet(updates as any).then(result => {
              if (result.success) {
                  setOriginalBookings(JSON.parse(JSON.stringify(bookings)));
              }
              return result;
          }));
      }
    }

    if (carChanges) {
        savePromises.push(saveCarData(editableCars).then(result => {
            if (result.success) {
                setOriginalCars(JSON.parse(JSON.stringify(editableCars)));
            }
            return result;
        }));
    }

    if (bannerChanges) {
        savePromises.push(savePlaceholderImages(banners).then(result => {
            if (result.success) {
                setOriginalBanners(JSON.parse(JSON.stringify(banners)));
            }
            return result;
        }));
    }

    if (offerChanges) {
        savePromises.push(saveOffersToFirestore(offers).then(result => {
            if (result.success) {
                setOriginalOffers(JSON.parse(JSON.stringify(offers)));
            }
            return result;
        }));
    }

    if (feedbackChanges) {
        savePromises.push(saveFeedbacksToSheet(userFeedbacks).then(result => {
            if (result.success) {
                setOriginalUserFeedbacks(JSON.parse(JSON.stringify(userFeedbacks)));
            }
            return result;
        }));
    }
    
    if (userRolesChanges) {
        savePromises.push(saveUserRoles(userRoles).then(result => {
            if (result.success) {
                setOriginalUserRoles(JSON.parse(JSON.stringify(userRoles)));
            }
            return result;
        }));
    }

    if (contactChanges && contactDetails) {
        savePromises.push(saveContactDetails(contactDetails).then(result => {
            if (result.success) {
                setOriginalContactDetails(JSON.parse(JSON.stringify(contactDetails)));
            }
            return result;
        }));
    }
    
    if (buttonSettingsChanges && buttonSettings) {
        savePromises.push(saveButtonSettings(buttonSettings).then(result => {
            if (result.success) {
                setOriginalButtonSettings(JSON.parse(JSON.stringify(buttonSettings)));
            }
            return result;
        }));
    }

    if (taxesChargesChanges && taxesAndCharges) {
        savePromises.push(saveTaxesAndCharges(taxesAndCharges).then(result => {
            if (result.success) {
                setOriginalTaxesAndCharges(JSON.parse(JSON.stringify(taxesAndCharges)));
            }
            return result;
        }));
    }

     if (inclusionsExclusionsChanges && inclusionsExclusions) {
        savePromises.push(saveInclusionsExclusions(inclusionsExclusions).then(result => {
            if (result.success) {
                setOriginalInclusionsExclusions(JSON.parse(JSON.stringify(inclusionsExclusions)));
            }
            return result;
        }));
    }
    

    const results = await Promise.all(savePromises);
    
    results.forEach(result => {
        if(result && (result.success === false || result.type === 'error')) {
            console.error("Save Failed:", result.error || result.message || "An error occurred during save.");
        } else {
            console.log("Data saved successfully.");
        }
    })

    setIsSaving(false);
  };
  
  const handleArchive = () => {
    startArchiving(async () => {
        const result = await archiveOldDataToSheet();
        if (result.success) {
            toast({
                title: "Archiving Complete",
                description: `${result.bookingsArchived || 0} bookings, ${result.tripsArchived || 0} trip plans, and ${result.reportsArchived || 0} reports have been archived.`,
            });
            await fetchData();
        } else {
            toast({
                title: "Archiving Failed",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
    });
  };

  const handleCancelChanges = () => {
    setBookings(JSON.parse(JSON.stringify(originalBookings)));
    setEditableCars(JSON.parse(JSON.stringify(originalCars)));
    if (originalContactDetails) {
        setContactDetails(JSON.parse(JSON.stringify(originalContactDetails)));
    }
    if (originalButtonSettings) {
        setButtonSettings(JSON.parse(JSON.stringify(originalButtonSettings)));
    }
    if (originalTaxesAndCharges) {
        setTaxesAndCharges(JSON.parse(JSON.stringify(originalTaxesAndCharges)));
    }
    if (originalInclusionsExclusions) {
        setInclusionsExclusions(JSON.parse(JSON.stringify(originalInclusionsExclusions)));
    }
    setBanners(JSON.parse(JSON.stringify(originalBanners)));
    setOffers(JSON.parse(JSON.stringify(originalOffers)));
    setUserFeedbacks(JSON.parse(JSON.stringify(originalUserFeedbacks)));
    setUserRoles(JSON.parse(JSON.stringify(originalUserRoles)));
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleCustomerSort = (key: CustomerSortKey) => {
    if (customerSortKey === key) {
      setCustomerSortDirection(customerSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCustomerSortKey(key);
      setCustomerSortDirection('asc');
    }
  };
  
  const openDeleteDialog = (category: DeletableCategory) => {
    setDeleteCategory(category);
    setDeleteConfirmationInput('');
    setShowDeleteDialog(true);
  }
  
  const getSelectedIdsForCategory = (category: DeletableCategory | null) => {
    switch (category) {
        case 'bookings': return selectedBookingIds;
        case 'trip-plans': return selectedTripPlanIds;
        case 'web-logins': return selectedWebLoginIds;
        case 'customer-details': return selectedCustomerIds;
        case 'user-reports': return selectedReportIds;
        case 'user-feedbacks': return selectedFeedbackIds;
        default: return [];
    }
  }

  const getDeleteConfirmationWord = () => {
    if (!deleteCategory) return '';
    const selectedIds = getSelectedIdsForCategory(deleteCategory);
    if (selectedIds.length > 0) {
        return `DELETE ${selectedIds.length}`;
    }
    return CONFIRMATION_WORDS[deleteCategory];
  }
  
  const handleDeleteData = () => {
    const confirmationWord = getDeleteConfirmationWord();
    if (!deleteCategory || deleteConfirmationInput !== confirmationWord) {
        toast({ title: "Confirmation text does not match.", variant: "destructive" });
        return;
    }
    
    startDeleting(async () => {
        const selectedIds = getSelectedIdsForCategory(deleteCategory);
        const result = await deleteAllDataByCategory(deleteCategory, selectedIds.length > 0 ? selectedIds : undefined);

        if (result.success) {
            toast({
                title: "Data Deleted",
                description: `The selected ${deleteCategory.replace('-', ' ')} have been deleted.`,
            });
            await fetchData(); // Refreshes data
            // Clear selections
            setSelectedBookingIds([]);
            setSelectedTripPlanIds([]);
            setSelectedWebLoginIds([]);
            setSelectedCustomerIds([]);
            setSelectedReportIds([]);
            setSelectedFeedbackIds([]);
        } else {
            toast({
                title: "Deletion Failed",
                description: result.error || "An unknown error occurred.",
                variant: "destructive",
            });
        }
        setShowDeleteDialog(false);
        setDeleteCategory(null);
    });
  }

  const sortedAndFilteredBookings = useMemo(() => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === 'customer.name') {
        aValue = a.customer?.name || '';
        bValue = b.customer?.name || '';
      } else {
        aValue = a[sortKey];
        bValue = b[sortKey];
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, statusFilter, sortKey, sortDirection]);

  const sortedCustomers = useMemo(() => {
    return [...customerDetails].sort((a, b) => {
      const aValue = a[customerSortKey];
      const bValue = b[customerSortKey];
      
      if (aValue < bValue) return customerSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return customerSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [customerDetails, customerSortKey, customerSortDirection]);

  const drivers = useMemo(() => {
    const driverMap = new Map<string, Driver>();

    originalBookings.forEach(booking => {
      if (booking.driverNo) {
        if (!driverMap.has(booking.driverNo)) {
          driverMap.set(booking.driverNo, {
            id: booking.driverNo,
            name: booking.driverName || 'N/A',
            vehicle: booking.carNo || 'N/A',
            phone: booking.driverNo,
            totalBookings: 0,
            lastSeen: new Date(0),
          });
        }
        const driver = driverMap.get(booking.driverNo)!;
        driver.totalBookings += 1;
        const bookingDate = new Date(booking.createdAt);
        if (bookingDate > driver.lastSeen) {
            driver.lastSeen = bookingDate;
            driver.vehicle = booking.carNo || driver.vehicle;
        }
      }
    });

    return Array.from(driverMap.values());
  }, [originalBookings]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(originalBookings.map(b => b.status));
    const statusArray = Array.from(statuses);
    return ['all', ...statusArray];
  }, [originalBookings]);

  const renderContent = () => {
    if (isAccessDenied) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this section.</p>
                </CardContent>
            </Card>
        );
    }
    
    const CardHeaderWithDelete = ({ title, description, category, dataLength, selectedIds, onClearSelection }: { title: string, description: string, category: DeletableCategory, dataLength: number, selectedIds: string[], onClearSelection: () => void }) => (
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                {canDeleteData && dataLength > 0 && (
                    selectedIds.length > 0 ? (
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({selectedIds.length}) Selected
                        </Button>
                    ) : (
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(category)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All
                        </Button>
                    )
                )}
            </div>
        </CardHeader>
    );
    
    switch (activeTab) {
      case 'bookings':
        return (
          <Card>
             <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Bookings</CardTitle>
                  <CardDescription>Displaying bookings from your Firestore database.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {canDeleteData && selectedBookingIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog('bookings')}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete ({selectedBookingIds.length}) Selected
                        </Button>
                    )}
                    {!loading && (
                      <BookingFilters
                        statuses={uniqueStatuses}
                        selectedStatus={statusFilter}
                        onStatusChange={setStatusFilter}
                        onClearFilters={() => setStatusFilter('all')}
                      />
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <BookingsTable
                  bookings={sortedAndFilteredBookings}
                  onDataChange={handleBookingDataChange}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  selectedBookingIds={selectedBookingIds}
                  onSelectedBookingIdsChange={setSelectedBookingIds}
                  canEdit={canEditBookings}
                />
              )}
            </CardContent>
          </Card>
        );
        case 'trip-plans':
            return (
                <Card>
                    <CardHeaderWithDelete title="Trip Plan Requests" description='Requests from the "Plan Your Trip" form.' category="trip-plans" dataLength={tripPlans.length} selectedIds={selectedTripPlanIds} onClearSelection={() => setSelectedTripPlanIds([])} />
                    <CardContent>
                        {loading ? <TableSkeleton /> : <TripPlansTable tripPlans={tripPlans} selectedIds={selectedTripPlanIds} onSelectedIdsChange={setSelectedTripPlanIds} />}
                    </CardContent>
                </Card>
            );
        case 'cars-and-pricing':
            return (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cars and Pricing</CardTitle>
                            <CardDescription>
                                An overview of available cars and their pricing stored in Firestore.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? <TableSkeleton /> : <CarsAndPricingTable cars={editableCars} onDataChange={handleCarDataChange} />}
                        </CardContent>
                    </Card>
                </div>
            );
        case 'banners':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Banners</CardTitle>
                        <CardDescription>
                            Manage hero carousel banners and other promotional images stored in Firestore.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <TableSkeleton /> : <BannersTable banners={banners} onDataChange={handleBannerDataChange} />}
                    </CardContent>
                </Card>
            );
        case 'offer-zone':
            return (
              <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Offer Zone</CardTitle>
                        <CardDescription>
                            Create and manage promotional offers and discount codes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <TableSkeleton /> : <OfferZoneSettings offers={offers} onDataChange={handleOfferDataChange} />}
                    </CardContent>
                </Card>
                
              </div>
            );
        case 'analytics':
            return <AnalyticsDashboard bookings={originalBookings} geocodedLocations={geocodedLocations} tollPlazas={tollPlazas} />;
        case 'archiving':
            return (
              <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>
                            Review and manage historical data. Google Sheets archiving is currently disabled.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted p-4 rounded-md border border-dashed text-center">
                            <p className="text-sm text-muted-foreground italic">
                                Google Sheets integration has been removed. Data older than 30 days can still be viewed in the lists below.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="bookings">
                    <TabsList>
                        <TabsTrigger value="bookings">Old Bookings ({archivableBookings.length})</TabsTrigger>
                        <TabsTrigger value="tripPlans">Old Trip Plans ({archivableTripPlans.length})</TabsTrigger>
                        <TabsTrigger value="userReports">Old Reports ({archivableUserReports.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="bookings" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Archivable Bookings</CardTitle>
                                <CardDescription>
                                    The following {archivableBookings.length} bookings are older than 30 days and will be archived.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="border rounded-lg overflow-hidden">
                                    <div className="relative overflow-y-auto max-h-[70vh]">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-secondary">
                                                <TableRow>
                                                    <TableHead>Booking ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Contact</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>From and To</TableHead>
                                                    <TableHead>Booked date</TableHead>
                                                    <TableHead>Pickup Date</TableHead>
                                                    <TableHead>Pickup Time</TableHead>
                                                    <TableHead>Passengers</TableHead>
                                                    <TableHead>Pricing</TableHead>
                                                    <TableHead>Offer (Applied or NA)</TableHead>
                                                    <TableHead>Toll & Taxes</TableHead>
                                                    <TableHead>Driver & Car</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {archivableBookings.length > 0 ? archivableBookings.map(booking => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                                        <TableCell>{booking.customer?.name}</TableCell>
                                                        <TableCell>{booking.customer?.mobile}</TableCell>
                                                        <TableCell>{booking.customer?.email}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium truncate max-w-[150px]">{booking.pickupLocation}</div>
                                                            <div className="text-sm text-muted-foreground truncate max-w-[150px]">to {booking.dropLocation}</div>
                                                        </TableCell>
                                                        <TableCell className="text-xs">{format(new Date(booking.createdAt), 'PPpp')}</TableCell>
                                                        <TableCell>{booking.pickupDate ? format(new Date(booking.pickupDate), 'PP') : 'N/A'}</TableCell>
                                                        <TableCell>{booking.pickupTime}</TableCell>
                                                        <TableCell>{booking.passengers}</TableCell>
                                                        <TableCell>{booking.estimatedFare?.toFixed(2)}</TableCell>
                                                        <TableCell>N/A</TableCell>
                                                        <TableCell>
                                                          <div className="text-xs">Toll: {booking.tollCharges || 'N/A'}</div>
                                                          <div className="text-xs">Tax: {booking.tax || 'N/A'}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                          <div className="text-sm">{booking.driverNo || 'N/A'}</div>
                                                          <div className="text-xs font-mono">{booking.carNo || 'N/A'}</div>
                                                        </TableCell>
                                                        <TableCell className="capitalize">{booking.status}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={13} className="text-center h-24">
                                                            No bookings are eligible for archiving.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="tripPlans" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>Archivable Trip Plans</CardTitle>
                                <CardDescription>
                                    The following {archivableTripPlans.length} trip plans are older than 30 days and will be archived.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="border rounded-lg overflow-hidden">
                                    <div className="relative overflow-y-auto max-h-[40vh]">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-secondary">
                                                <TableRow>
                                                    <TableHead>Request ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>From</TableHead>
                                                    <TableHead>To</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {archivableTripPlans.length > 0 ? archivableTripPlans.map(plan => (
                                                    <TableRow key={plan.id}>
                                                        <TableCell className="font-mono text-xs">{plan.id}</TableCell>
                                                        <TableCell>{plan.name}</TableCell>
                                                        <TableCell>{format(new Date(plan.timestamp), 'PP')}</TableCell>
                                                        <TableCell>{plan.from}</TableCell>
                                                        <TableCell>{plan.to}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center h-24">
                                                            No trip plans are eligible for archiving.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="userReports" className="mt-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>Archivable User Reports</CardTitle>
                                <CardDescription>
                                    The following {archivableUserReports.length} user reports are older than 30 days and will be archived.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="border rounded-lg overflow-hidden">
                                    <div className="relative overflow-y-auto max-h-[40vh]">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-secondary">
                                                <TableRow>
                                                    <TableHead>Report ID</TableHead>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Category</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {archivableUserReports.length > 0 ? archivableUserReports.map(report => (
                                                    <TableRow key={report.id}>
                                                        <TableCell className="font-mono text-xs">{report.reportId}</TableCell>
                                                        <TableCell>{report.name}</TableCell>
                                                        <TableCell>{format(new Date(report.timestamp), 'PP')}</TableCell>
                                                        <TableCell className="capitalize">{report.category}</TableCell>
                                                    </TableRow>
                                                )) : (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center h-24">
                                                            No user reports are eligible for archiving.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                               </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
              </div>
            );
        case 'web-logins':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Web Logins</CardTitle>
                        <CardDescription>Recent login activity from users, stored in Firestore.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <TableSkeleton /> : <WebLoginsTable logins={webLogins} />}
                    </CardContent>
                </Card>
            );
        case 'customer-details':
            return (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Customer &amp; Driver Profiles</CardTitle>
                                <CardDescription>An overview of all your users from Firestore.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="customers" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="customers">Customers</TabsTrigger>
                                <TabsTrigger value="drivers">Drivers</TabsTrigger>
                            </TabsList>
                            <TabsContent value="customers" className="mt-4">
                                <div className="flex justify-end mb-4">
                                    {canDeleteData && customerDetails.length > 0 && (
                                        selectedCustomerIds.length > 0 ? (
                                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog('customer-details')}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete ({selectedCustomerIds.length}) Selected
                                            </Button>
                                        ) : (
                                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog('customer-details')}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete All
                                            </Button>
                                        )
                                    )}
                                </div>
                                {loading ? <TableSkeleton /> : 
                                    <CustomerDetailsTable 
                                        customers={sortedCustomers} 
                                        sortKey={customerSortKey}
                                        sortDirection={customerSortDirection}
                                        onSort={handleCustomerSort}
                                        selectedIds={selectedCustomerIds}
                                        onSelectedIdsChange={setSelectedCustomerIds}
                                    />
                                }
                            </TabsContent>
                            <TabsContent value="drivers" className="mt-4">
                                <div className="flex justify-end mb-4">
                                    {canDeleteData && drivers.length > 0 && (
                                        <Button variant="destructive" size="sm" onClick={() => openDeleteDialog('drivers')}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Clear All Drivers
                                        </Button>
                                    )}
                                </div>
                                {loading ? <TableSkeleton /> : <DriversTable drivers={drivers} />}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            );
        case 'user-roles':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>User Roles</CardTitle>
                        <CardDescription>
                            Manage Admin and Sub-Admin roles for your application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <TableSkeleton /> : 
                          <UserRolesTable
                              roles={userRoles}
                              onDataChange={handleUserRolesChange}
                          />
                        }
                    </CardContent>
                </Card>
            );
        case 'redirect-linkings':
            return (
                <div className="space-y-6">
                  <Card>
                      <CardHeader>
                          <CardTitle>Redirect &amp; Linkings (Settings)</CardTitle>
                          <CardDescription>
                              Configure URLs, contact details, and button actions. Stored in Firestore.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8 pt-6">
                        {loading || !contactDetails ? <Skeleton className="h-64 w-full" /> : 
                        <ContactSettings 
                            details={contactDetails}
                            onDataChange={handleContactDetailsChange}
                        />}

                        {loading || !buttonSettings ? <Skeleton className="h-40 w-full" /> : 
                        <ButtonRedirectSettings 
                            settings={buttonSettings}
                            onDataChange={handleButtonSettingsChange}
                        />}

                      </CardContent>
                  </Card>
                </div>
            );
        case 'taxes-and-charges':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Taxes &amp; Charges</CardTitle>
                        <CardDescription>
                            Set application-wide taxes, fees, and other charges. Stored in Firestore.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading || !taxesAndCharges ? <Skeleton className="h-64 w-full" /> : 
                        <TaxesChargesSettings
                            details={taxesAndCharges}
                            onDataChange={handleTaxesChargesChange}
                        />}
                    </CardContent>
                </Card>
            );
        case 'inclusions-exclusions':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Inclusions &amp; Exclusions</CardTitle>
                        <CardDescription>
                            Manage the list of included and excluded items for rides. Stored in Firestore.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading || !inclusionsExclusions ? <Skeleton className="h-64 w-full" /> : 
                        <InclusionsExclusionsSettings
                            data={inclusionsExclusions}
                            onDataChange={handleInclusionsExclusionsChange}
                        />}
                    </CardContent>
                </Card>
            );
        case 'toll-data':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Toll Plaza Data</CardTitle>
                        <CardDescription>
                            Manage the toll plaza dataset used for route calculations. Stored in Firestore.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-64 w-full" /> : 
                            <TollDataUploader 
                                currentTollCount={tollPlazaCount} 
                                onUploadSuccess={(newCount) => {
                                  setTollPlazaCount(newCount);
                                  getTollsFromFirestore().then(setTollPlazas);
                                }}
                            />
                        }
                    </CardContent>
                </Card>
            );
        case 'user-reports':
            return (
                <Card>
                    <CardHeaderWithDelete title="User Reports" description="Reports and issues submitted by users, stored in Firestore." category="user-reports" dataLength={userReports.length} selectedIds={selectedReportIds} onClearSelection={() => setSelectedReportIds([])} />
                    <CardContent>
                        {loading ? <TableSkeleton /> : <UserReportsTable reports={userReports} selectedIds={selectedReportIds} onSelectedIdsChange={setSelectedReportIds} />}
                    </CardContent>
                </Card>
            );
        case 'user-feedbacks':
            return (
                <Card>
                    <CardHeaderWithDelete title="User Feedbacks" description="Testimonials and ratings from customers, stored in Firestore." category="user-feedbacks" dataLength={userFeedbacks.length} selectedIds={selectedFeedbackIds} onClearSelection={() => setSelectedFeedbackIds([])} />
                    <CardContent>
                        {loading ? <TableSkeleton /> : <UserFeedbacksTable feedbacks={userFeedbacks} onDataChange={handleFeedbackDataChange} selectedIds={selectedFeedbackIds} onSelectedIdsChange={setSelectedFeedbackIds} />}
                    </CardContent>
                </Card>
            );
        default:
            return <p>Select a tab</p>;
    }
  };


  return (
    <div className="w-full min-h-screen flex flex-col">
       <header className="sticky top-0 z-40 w-full border-b bg-background text-foreground">
          <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
             <Link href="/" className="flex items-center">
                <Image
                src="https://raw.githubusercontent.com/thethanjaiculture-dev/GetIn-Assests/main/ZyroCabsBF-Photoroom.png"
                alt="ZyroCabs Logo"
                width={70}
                height={20}
                className="object-contain"
                priority
                />
            </Link>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                {currentUser && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={currentUser.photoURL || ''} alt={currentUser.displayName || 'Admin'} />
                                    <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{currentUser.displayName || 'Admin'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
          </div>
       </header>
       
       <main className="flex-grow flex flex-col bg-background">
          <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b">
             <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground text-sm">Manage your bookings, cars, and settings.</p>
                    </div>
                     {hasChanges && !isAccessDenied && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleCancelChanges} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleSaveChanges} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                <div className="border-b">
                   <AdminNav 
                        activeTab={activeTab} 
                        pendingBookingsCount={pendingBookingsCount}
                        navItems={visibleNavItems} 
                    />
                </div>
            </div>
          </div>

          <div className="flex-grow px-4 sm:px-6 lg:px-8 py-8">
            <div className="mt-6">
              <Suspense fallback={<TableSkeleton />}>
                {loading && !currentUserRole ? <TableSkeleton/> : renderContent()}
              </Suspense>
            </div>
          </div>
       </main>
       
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected data from the <strong className="capitalize">{deleteCategory?.replace('-', ' ')}</strong> category.
                        <br/><br/>
                        Please type <strong className="text-destructive font-mono">{getDeleteConfirmationWord()}</strong> below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                    value={deleteConfirmationInput}
                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                    placeholder={`Type "${getDeleteConfirmationWord()}" to confirm`}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteData} 
                        disabled={isDeleting || (deleteCategory ? deleteConfirmationInput !== getDeleteConfirmationWord() : true)}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Permanently
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

function TableSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}

    
    