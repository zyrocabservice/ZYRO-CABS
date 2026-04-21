
'use server';

import type { Booking, Car, Location, ContactDetails, CustomerDetail, UserReport, UserFeedback, ImagePlaceholder, TripPlan, TaxesAndCharges, InclusionsExclusions, WebLogin, ButtonSettings, TollPlaza, BookingStatus, UserRole, Offer, StatePermitCharge } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { promises as fs } from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';




// --- Config File Management ---
const configPath = path.join(process.cwd(), 'src', 'lib', 'config.json');

async function readConfig(): Promise<{ googleSheetId?: string }> {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is invalid, return an empty object.
    return {};
  }
}

async function writeConfig(config: { googleSheetId: string }): Promise<void> {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}


// --- Supabase Data Fetching and Saving ---

export async function getAllCars(): Promise<{data: Car[], isFallback: boolean}> {
    const supabase = await createClient();
    
    try {
        const { data: cars, error } = await supabase
            .from('cars')
            .select('*')
            .order('one_way_rate', { ascending: true });

        if (error) throw error;

        if (!cars || cars.length === 0) {
            return { data: [], isFallback: false };
        }

        const formattedCars: Car[] = cars.map(car => ({
            id: car.id,
            carType: car.car_type,
            imageUrl: car.image_url,
            imageHint: car.image_hint,
            capacity: car.capacity,
            oneWayRate: car.one_way_rate,
            roundTripRate: car.round_trip_rate,
            airportTransferRate: car.airport_transfer_rate,
            driverAllowance: car.driver_allowance,
            description: car.description,
        }));

        return { data: formattedCars, isFallback: false };
    } catch(e: any) {
        console.error("Error fetching cars from Supabase:", e.message || e, e.details || '', e.hint || '');
        return { data: [], isFallback: true };
    }
}

async function getBookingsFromSupabase(): Promise<Booking[]> {
    const supabase = await createClient();
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (bookings || []).map(b => ({
            ...b,
            createdAt: new Date(b.created_at),
        })) as Booking[];
    } catch (error) {
        console.error("Error fetching bookings from Supabase:", error);
        return [];
    }
}

const geocodeCache = new Map<string, any>();

async function geocodeAddress(address: string): Promise<any> {
    if (geocodeCache.has(address)) {
        return geocodeCache.get(address)!;
    }

    // Using Photon (Komoot) as a free alternative to Google Geocoding
    let url = '';
    if (/^-?[\d.]+(,\s*-?[\d.]+)+$/.test(address)) {
        const [lat, lng] = address.split(',').map(Number);
        url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
    } else {
        url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const firstResult = data.features[0];
            const result = {
                geometry: {
                    location: {
                        lat: firstResult.geometry.coordinates[1],
                        lng: firstResult.geometry.coordinates[0],
                    }
                },
                address_components: [
                    { long_name: firstResult.properties.state || '', types: ['administrative_area_level_1'] },
                    { long_name: firstResult.properties.country || '', types: ['country'] }
                ],
                formatted_address: firstResult.properties.name || address
            };
            geocodeCache.set(address, result);
            return result;
        }
        return null;
    } catch (error) {
        console.error(`Geocoding error for "${address}":`, error);
        return null;
    }
}

async function getWebLoginsFromSupabase(): Promise<WebLogin[]> {
    const supabase = await createClient();
    try {
        const { data: logins, error } = await supabase
            .from('web_logins')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;

        return (logins || []).map(l => ({
            ...l,
            timestamp: new Date(l.timestamp),
        })) as WebLogin[];
    } catch (error) {
        console.error("Error fetching web logins from Supabase:", error);
        return [];
    }
}

export async function saveWebLoginToSupabase(loginData: Omit<WebLogin, 'id' | 'timestamp'>) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('web_logins')
            .insert([loginData]);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error("Error saving web login to Supabase:", error);
        return { success: false, error: error.message };
    }
}


export async function getAdminDashboardData() {
    try {
        const configPromise = readConfig().catch(e => {
            console.error("Failed to read config:", e);
            throw new Error('Failed to read config.json');
        });

        const carsPromise = getAllCars();
        const bookingsPromise = getBookingsFromSupabase();
        const customersPromise = getCustomersFromSupabase();
        const userRolesPromise = getUserRoles();
        const reportsPromise = getReportsFromSupabase();
        const feedbacksPromise = getFeedbacksFromSupabase();
        const tripPlansPromise = getTripPlansFromSupabase();
        const webLoginsPromise = getWebLoginsFromSupabase();
        const tollPlazasPromise = getTollsFromSupabase();
        const contactDetailsPromise = getContactDetails();
        const taxesAndChargesPromise = getTaxesAndCharges();
        const inclusionsExclusionsPromise = getInclusionsExclusions();
        const buttonSettingsPromise = getButtonSettings();
        const bannersPromise = getBannersFromSupabase();
        const offersPromise = getOffersFromSupabase();

        const [
            config, 
            carsResult, 
            bookings, 
            customers,
            userRoles,
            reports, 
            feedbacks, 
            tripPlans,
            webLogins, 
            tollPlazas,
            contactDetails,
            taxesAndCharges,
            inclusionsExclusions,
            buttonSettings,
            banners,
            offers
        ] = await Promise.all([
            configPromise,
            carsPromise,
            bookingsPromise,
            customersPromise,
            userRolesPromise,
            reportsPromise,
            feedbacksPromise,
            tripPlansPromise,
            webLoginsPromise,
            tollPlazasPromise,
            contactDetailsPromise,
            taxesAndChargesPromise,
            inclusionsExclusionsPromise,
            buttonSettingsPromise,
            bannersPromise,
            offersPromise
        ]);

        const dropoffAddresses = bookings
            .map(b => b.dropLocation)
            .filter((l): l is string => !!l);
            
        const uniqueAddresses = [...new Set(dropoffAddresses)];
        const geocodePromises = uniqueAddresses.map(address => geocodeAddress(address).then(result => result?.geometry?.location));
        const geocodedLocations = (await Promise.all(geocodePromises)).filter((l): l is Location => l !== null);
        
        const tollPlazaCount = tollPlazas.length;

        return {
            type: 'success' as const,
            bookings,
            cars: carsResult.data,
            geocodedLocations,
            customers,
            userRoles,
            reports,
            feedbacks,
            tripPlans,
            webLogins,
            contactDetails,
            taxesAndCharges,
            inclusionsExclusions,
            googleSheetId: config.googleSheetId || null,
            buttonSettings,
            tollPlazaCount,
            tollPlazas,
            banners,
            offers,
        }
    } catch (error: any) {
        console.error('Error getting admin dashboard data from Supabase', error);
        return {
            type: 'error' as const,
            message: error.message || 'Failed to load admin data.'
        }
    }
}

export async function getTollsFromSupabase(): Promise<TollPlaza[]> {
    const supabase = await createClient();
    try {
        const { data: tolls, error } = await supabase
            .from('toll_data')
            .select('*');

        if (error) throw error;

        return (tolls || []).filter(loc => 
            loc.Latitude && loc.Longitude && !isNaN(parseFloat(loc.Latitude.toString())) && !isNaN(parseFloat(loc.Longitude.toString()))
        ).map(loc => ({
            ...loc,
            Latitude: parseFloat(loc.Latitude.toString()),
            Longitude: parseFloat(loc.Longitude.toString())
        }));
    } catch (error) {
        console.error("Failed to read toll data from Supabase:", error);
        return [];
    }
}

function isLocationOnSegment(point: { lat: number, lng: number }, start: { lat: number, lng: number }, end: { lat: number, lng: number }, tolerance = 0.0001) {
    const dist = (p1: { lat: number, lng: number }, p2: { lat: number, lng: number }) => Math.sqrt(Math.pow(p2.lat - p1.lat, 2) + Math.pow(p2.lng - p1.lng, 2));

    const d1 = dist(point, start);
    const d2 = dist(point, end);
    const lineLength = dist(start, end);

    return d1 + d2 >= lineLength - tolerance && d1 + d2 <= lineLength + tolerance;
}

function isLocationOnPath(location: { lat: number, lng: number }, path: { lat: number, lng: number }[], tolerance: number) {
  for (let i = 0; i < path.length - 1; i++) {
    const start = path[i];
    const end = path[i+1];
    
    // Simplified point-to-line distance calculation
    const dx = end.lng - start.lng;
    const dy = end.lat - start.lat;
    
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue; // Start and end are the same point

    let t = ((location.lng - start.lng) * dx + (location.lat - start.lat) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestPoint = {
      lat: start.lat + t * dy,
      lng: start.lng + t * dx,
    };

    const latDiff = location.lat - closestPoint.lat;
    const lngDiff = location.lng - closestPoint.lng;
    const distanceSq = latDiff * latDiff + lngDiff * lngDiff;

    if (distanceSq < tolerance * tolerance) {
      return true;
    }
  }
  return false;
}

const reverseGeocodeCache = new Map<string, string>();
async function reverseGeocodeForState(lat: number, lng: number): Promise<string | null> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (reverseGeocodeCache.has(cacheKey)) {
        return reverseGeocodeCache.get(cacheKey)!;
    }
    
    const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            const state = data.features[0].properties.state || null;
            if(state) reverseGeocodeCache.set(cacheKey, state);
            return state;
        }
        return null;
    } catch (error) {
        console.error(`Reverse geocoding error for ${lat},${lng}:`, error);
        return null;
    }
}


export async function getCalculatedCarOptions(from: string, to: string, rideType: string) {
  // Use OSRM as a free alternative to Google Directions
  const [originGeo, destinationGeo, taxes] = await Promise.all([
    geocodeAddress(from),
    geocodeAddress(to),
    getTaxesAndCharges(),
  ]);

  if (!originGeo || !destinationGeo) {
    return { error: "Could not find locations. Please check your addresses." };
  }

  const { lat: oLat, lng: oLng } = originGeo.geometry.location;
  const { lat: dLat, lng: dLng } = destinationGeo.geometry.location;

  const directionsUrl = `http://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;
  
  let routeDistance = 0; 
  let routeDuration = 0;
  let routePolyline = '';
  
  try {
    const response = await fetch(directionsUrl);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      routeDistance = route.distance; // in meters
      routeDuration = route.duration; // in seconds
      routePolyline = route.geometry;
    } else {
      console.error(`OSRM Directions failed with code: ${data.code}`);
      return { error: `Could not calculate route. Please try again later.` };
    }
  } catch (error) {
    console.error(`Error fetching directions from OSRM:`, error);
    return { error: "Failed to fetch route information." };
  }
  
  const distanceInKm = routeDistance / 1000;

  if (distanceInKm > 0 && distanceInKm < 30) {
    return { error: "Minimum travel distance is 30 km." };
  }


  const getStateFromGeocode = (geoResult: any) => {
    if (!geoResult || !geoResult.address_components) return null;
    const stateComponent = geoResult.address_components.find((c: any) =>
      c.types.includes('administrative_area_level_1')
    );
    return stateComponent ? stateComponent.long_name : null;
  };

  const originState = getStateFromGeocode(originGeo);
  const destinationState = getStateFromGeocode(destinationGeo);
  
  // Determine states crossed during the route
  // For now, using Photon to check major points if polyline logic is too complex to port immediately
  const uniqueStatesCrossed = new Set<string>();
  if (originState) uniqueStatesCrossed.add(originState);
  if (destinationState) uniqueStatesCrossed.add(destinationState);
  
  // Note: Detailed state crossing check simplified due to removal of @googlemaps dependency
  // In a full implementation, we would decode the polyline and check states at intervals.
  
  // Toll checking removed as it depended on Firestore/internal tool logic
  const tollPlazasOnRoute: any[] = [];


  const { data: cars } = await getAllCars();

  const getRateForTripType = (car: Car) => {
    switch (rideType) {
      case 'round-trip':
        return car.roundTripRate;
      case 'airport-transfer':
        return car.airportTransferRate;
      case 'one-way':
      default:
        return car.oneWayRate;
    }
  };
  
    const calculateCharge = (chargeValue: string | number | undefined, base: number): number => {
        if (chargeValue === undefined || chargeValue === null) return 0;
        const valueStr = String(chargeValue).trim();
        if (valueStr.toLowerCase() === 'as applicable' || valueStr.toLowerCase() === 'not applicable') return 0;
        const numericValue = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue) && numericValue >= 0) return numericValue;
        return 0;
    };

  const carOptions = cars.map(car => {
        const baseRate = getRateForTripType(car);
        const billingDistance = Math.max(distanceInKm, 130);
        const baseFare = baseRate * billingDistance;

        const driverFee = car.driverAllowance || 0;

        const calculateTax = (chargeValue: string | number | undefined, base: number): number => {
            if (chargeValue === undefined || chargeValue === null) return 0;
            const valueStr = String(chargeValue).trim();
            if (valueStr.toLowerCase() === 'as applicable' || valueStr.toLowerCase() === 'not applicable') return 0;
            let numericValue = -1;
            if (valueStr.includes('%')) {
                numericValue = parseFloat(valueStr.replace('%', ''));
            } else {
                numericValue = parseFloat(valueStr);
            }
            if (!isNaN(numericValue) && numericValue >= 0) return base * (numericValue / 100);
            return 0;
        };

        const perTollCharge = typeof taxes.tollCharges === 'string' ? parseFloat(taxes.tollCharges) : taxes.tollCharges;
        const tollChargeAmount = isNaN(perTollCharge) ? 0 : perTollCharge * tollPlazasOnRoute.length;

        const permitStates = Array.from(uniqueStatesCrossed).filter(s => originState && s.toLowerCase() !== originState.toLowerCase());

        let permitChargeAmount = 0;
        if (permitStates.length > 0) {
            for (const state of permitStates) {
                const stateRules = taxes.statePermitCharges.filter(c => c.state.toLowerCase() === state.toLowerCase());
                
                // Find best matching rule for capacity
                const capacityRules = stateRules.filter(r => r.capacity !== undefined);
                const genericRule = stateRules.find(r => r.capacity === undefined);
                
                let permitRule: StatePermitCharge | undefined;

                if (capacityRules.length > 0) {
                    // Find the rule with the smallest capacity that is still >= car's capacity
                    permitRule = capacityRules
                        .filter(r => r.capacity! >= car.capacity)
                        .sort((a, b) => a.capacity! - b.capacity!)[0];
                }

                if (!permitRule) {
                    permitRule = genericRule;
                }

                if (permitRule) {
                    permitChargeAmount += calculateCharge(permitRule.charge, baseFare);
                }
            }
        }

        const totalTaxAmount = taxes.taxes
            .filter(tax => tax.enabled)
            .reduce((sum, tax) => sum + calculateTax(tax.value, baseFare), 0);

        const totalFare = baseFare + driverFee + tollChargeAmount + permitChargeAmount + totalTaxAmount;

        return {
            ...car,
            estimatedFare: totalFare,
            driverFee: driverFee,
            permitFee: permitChargeAmount,
        }
    }).sort((a,b) => a.estimatedFare - b.estimatedFare);

  return {
    carOptions,
    distance: distanceInKm,
    duration: routeDuration,
    polyline: routePolyline,
    tollPlazas: tollPlazasOnRoute,
    originState,
    destinationState,
    statesCrossed: Array.from(uniqueStatesCrossed)
  };
}



async function getNextBookingId(): Promise<string> {
    const supabase = await createClient();
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    
    try {
        const { data: nextNumber, error } = await supabase.rpc('increment_counter', {
            counter_id: 'booking_id',
            current_year: currentYear
        });

        if (error) throw error;
        
        const formattedNumber = String(nextNumber).padStart(4, '0');
        return `ZC${yearSuffix}${formattedNumber}`;

    } catch (error) {
        console.error("Failed to get next booking ID from Supabase:", error);
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        return `ZC${yearSuffix}R${randomPart}`;
    }
}


export async function confirmAndSaveBooking(bookingDetails: {
    from: string;
    to: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerUid?: string;
    carType: string;
    passengers: string;
    pickupTime: string;
    pickupDate: string;
    estimatedFare: number;
    distance: string;
    rideType: string;
    tollCharges: string | number;
    taxes: string;
    subTotal: number;
}) {
    const supabase = await createClient();
    const bookingId = await getNextBookingId();

    let finalCustomerUid = bookingDetails.customerUid;
    
    // Handle guest vs logged-in user
    if (finalCustomerUid) {
        const { data: { user }, error } = await supabase.auth.admin.getUserById(finalCustomerUid);
        if (error || !user) {
            console.warn("Could not find user by provided UID in Supabase. Treating as guest.");
            finalCustomerUid = undefined;
        }
    }

    if (!finalCustomerUid) {
        // This is a guest user. Check if a customer record already exists for this email.
        const { data: customerData } = await supabase
            .from('customers')
            .select('id')
            .eq('email', bookingDetails.customerEmail)
            .single();

        if (customerData) {
            // Found existing customer (by email) - we'll use their internal ID but they may not have a UID
        }
    }
    
    const bookingData = {
        id: bookingId,
        pickup_location: bookingDetails.from,
        drop_location: bookingDetails.to,
        customer_name: bookingDetails.customerName,
        customer_email: bookingDetails.customerEmail,
        customer_phone: bookingDetails.customerPhone,
        customer_uid: finalCustomerUid || null,
        car_type: bookingDetails.carType,
        passengers: Number(bookingDetails.passengers),
        pickup_date: bookingDetails.pickupDate,
        pickup_time: bookingDetails.pickupTime,
        estimated_fare: bookingDetails.estimatedFare,
        ride_type: bookingDetails.rideType,
        status: 'pending' as BookingStatus,
        driver_name: '',
        driver_no: '',
        car_no: '',
        toll_charges: Number(bookingDetails.tollCharges),
        taxes: bookingDetails.taxes,
        sub_total: bookingDetails.subTotal,
    };

    try {
        const { error: bookingError } = await supabase
            .from('bookings')
            .insert([bookingData]);

        if (bookingError) throw bookingError;



        // Upsert customer
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('email', bookingDetails.customerEmail)
            .single();

        if (existingCustomer) {
            await supabase
                .from('customers')
                .update({
                    bookings_count: (existingCustomer.bookings_count || 0) + 1,
                    last_seen: new Date().toISOString(),
                    name: bookingDetails.customerName,
                    phone: bookingDetails.customerPhone,
                })
                .eq('id', existingCustomer.id);
        } else {
            await supabase
                .from('customers')
                .insert([{
                    email: bookingDetails.customerEmail,
                    name: bookingDetails.customerName,
                    phone: bookingDetails.customerPhone,
                    bookings_count: 1,
                    last_seen: new Date().toISOString(),
                    uid: finalCustomerUid || null,
                }]);
        }
        
        return { success: true, bookingId };
    } catch (error: any) {
        console.error("Error saving booking to Supabase:", error.message);
        return { success: false, error: "Failed to save booking to database." };
    }
}

export async function updateBookingDetailsInSupabase(updates: { bookingId: string; status?: string; driverName?: string; driverNo?: string; carNo?: string }[]) {
    const supabase = await createClient();
    try {
        for (const update of updates) {
            const updateData: any = {};
            if (update.status) updateData.status = update.status;
            if (update.driverName !== undefined) updateData.driver_name = update.driverName;
            if (update.driverNo !== undefined) updateData.driver_no = update.driverNo;
            if (update.carNo !== undefined) updateData.car_no = update.carNo;
            
            if (Object.keys(updateData).length > 0) {
                const { error } = await supabase
                    .from('bookings')
                    .update(updateData)
                    .eq('id', update.bookingId);
                
                if (error) throw error;
            }
        }
        return { success: true };
    } catch (error: any) {
        console.error("Error updating bookings in Supabase:", error);
        return { success: false, error: error.message };
    }
}


export async function saveCarData(cars: Car[]) {
    const supabase = await createClient();
    try {
        // In Supabase, we can use upsert to handle updates and inserts.
        // For deletions, we might need a separate step or a transaction-like approach.
        // Simplest for now: delete all and insert all (be careful with foreign keys if any).
        // If 'cars' table is referenced by 'bookings', deletion might fail.
        
        const { error: deleteError } = await supabase
            .from('cars')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('cars')
            .insert(cars);

        if (insertError) throw insertError;
        
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Error saving car data to Supabase:", error);
        return { success: false, error: error.message };
    }
}

async function getConfigFromSupabase(configId: string, defaults: any) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('config')
            .select('data')
            .eq('id', configId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // No rows found
                await supabase.from('config').insert({ id: configId, data: defaults });
                return defaults;
            }
            throw error;
        }
        return { ...defaults, ...data.data };
    } catch (error) {
        console.error(`Error getting '${configId}' from Supabase. Returning defaults.`, error);
        return defaults;
    }
}

async function saveConfigToSupabase(configId: string, data: any) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('config')
            .upsert({ id: configId, data }, { onConflict: 'id' });

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error(`Error saving ${configId} to Supabase:`, error);
        return { success: false, error: error.message };
    }
}


const defaultContactDetails: ContactDetails = {
  phone: '+919677774119',
  email: 'zyrocabservice@gmail.com',
  whatsapp: '6590593870',
  instagram: 'zyrocabsindia',
  facebook: 'zyrocabs',
  enquiryWhatsappMessage: "Hi, I'd like to enquire about a {carType}...",
  emailSubject: "Enquiry for {carType} - {tripType}",
  emailBody: "Hello, I would like to enquire about a {carType} for a {tripType}...",
};

export async function getContactDetails(): Promise<ContactDetails> {
    return getConfigFromSupabase('contactDetails', defaultContactDetails);
}

export async function saveContactDetails(details: ContactDetails) {
    revalidatePath('/');
    return saveConfigToSupabase('contactDetails', details);
}

export async function getGoogleSheetId(): Promise<string | null> {
    const config = await readConfig();
    return config.googleSheetId || null;
}

export async function saveGoogleSheetId(sheetId: string) {
    try {
        await writeConfig({ googleSheetId: sheetId });
        return { success: true };
    } catch (error: any) {
        console.error("Error saving Google Sheet ID:", error);
        return { success: false, error: error.message };
    }
}

export async function getCustomersFromSupabase(): Promise<CustomerDetail[]> {
    const supabase = await createClient();
    try {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('*');

        if (error) throw error;

        return (customers || []).map(c => ({
            ...c,
            lastSeen: c.last_seen ? new Date(c.last_seen) : null,
        })) as CustomerDetail[];
    } catch (error) {
        console.error("Error fetching customers from Supabase:", error);
        return [];
    }
}

export async function getUserRoles(): Promise<UserRole[]> {
    const supabase = await createClient();
    try {
        const { data: roles, error } = await supabase
            .from('roles')
            .select('*');

        if (error) throw error;
        return (roles || []) as UserRole[];
    } catch (error) {
        console.error("Error fetching user roles from Supabase:", error);
        return [];
    }
}

export async function saveUserRoles(roles: UserRole[]): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    try {
        // Delete all and re-insert for roles
        const { error: deleteError } = await supabase
            .from('roles')
            .delete()
            .neq('uid', '00000000-0000-0000-0000-000000000000');

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('roles')
            .insert(roles);

        if (insertError) throw insertError;
        
        return { success: true };
    } catch (error: any) {
        console.error("Error saving user roles to Supabase:", error);
        return { success: false, error: error.message };
    }
}




export async function saveReportToSupabase(reportData: Omit<UserReport, 'reportId' | 'timestamp'>) {
    const supabase = await createClient();
    try {
        const reportRecord = {
            ...reportData,
            timestamp: new Date().toISOString(),
            report_id: `ZR-${Date.now()}`
        };
        const { data, error } = await supabase
            .from('reports')
            .insert([reportRecord])
            .select()
            .single();

        if (error) throw error;
        return { success: true, reportId: data.id };
    } catch (error: any) {
        console.error("Error saving report to Supabase:", error);
        return { success: false, error: error.message };
    }
}

export async function getReportsFromSupabase(): Promise<UserReport[]> {
    const supabase = await createClient();
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        return (reports || []).map(r => ({
            ...r,
            timestamp: new Date(r.timestamp),
        })) as UserReport[];
    } catch (error) {
        console.error("Error fetching reports from Supabase:", error);
        return [];
    }
}

export async function getFeedbacksFromSupabase(): Promise<UserFeedback[]> {
    const supabase = await createClient();
    try {
        const { data: feedbacks, error } = await supabase
            .from('feedbacks')
            .select('*')
            .order('rating', { ascending: false });

        if (error) throw error;

        return (feedbacks || []) as UserFeedback[];
    } catch (error) {
        console.error("Error fetching feedbacks from Supabase:", error);
        return [];
    }
}

export async function saveFeedbackToSupabase(feedbackData: Omit<UserFeedback, 'id' | 'avatar'>) {
  const supabase = await createClient();
  const id = `FB-${Date.now()}`;
  
  // Note: We don't have easy access to user records by email in client-side auth,
  // but we can just use the provided feedback data.
  
  const feedbackRecord = {
    id,
    name: feedbackData.name,
    email: feedbackData.email,
    avatar: `https://avatar.vercel.sh/${encodeURIComponent(feedbackData.email || feedbackData.name)}.png`,
    feedback: feedbackData.feedback,
    rating: feedbackData.rating,
  };

  try {
    const { error } = await supabase
        .from('feedbacks')
        .insert([feedbackRecord]);

    if (error) throw error;
    revalidatePath('/');
    return { success: true, id };
  } catch (error: any) {
    console.error("Error saving feedback to Supabase:", error);
    return { success: false, error: error.message };
  }
}


export async function saveFeedbacksToSupabase(feedbacks: UserFeedback[]) {
    const supabase = await createClient();
    try {
        const { error: deleteError } = await supabase
            .from('feedbacks')
            .delete()
            .neq('id', 'placeholder');

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('feedbacks')
            .insert(feedbacks);

        if (insertError) throw insertError;
        
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Error saving feedbacks to Supabase:", error);
        return { success: false, error: error.message };
    }
}


export async function getBannersFromSupabase(): Promise<ImagePlaceholder[]> {
    const supabase = await createClient();
    try {
        const { data: banners, error } = await supabase
            .from('banners')
            .select('*');

        if (error) throw error;
        return (banners || []) as ImagePlaceholder[];
    } catch (error) {
        console.error("Error fetching banners from Supabase:", error);
        return [];
    }
}

export async function savePlaceholderImages(images: ImagePlaceholder[]) {
    const supabase = await createClient();
    try {
        const { error: deleteError } = await supabase
            .from('banners')
            .delete()
            .neq('id', 'placeholder');

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('banners')
            .insert(images);

        if (insertError) throw insertError;
        
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Error saving banners to Supabase:", error);
        return { success: false, error: error.message };
    }
}


export async function getOffersFromSupabase(): Promise<Offer[]> {
    const supabase = await createClient();
    try {
        const { data: offers, error } = await supabase
            .from('offers')
            .select('*');

        if (error) throw error;
        return (offers || []) as Offer[];
    } catch (error) {
        console.error("Error fetching offers from Supabase:", error);
        return [];
    }
}

export async function saveOffersToSupabase(offers: Offer[]) {
    const supabase = await createClient();
    try {
        const { error: deleteError } = await supabase
            .from('offers')
            .delete()
            .neq('id', 'placeholder');

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('offers')
            .insert(offers);

        if (insertError) throw insertError;
        
        return { success: true };
    } catch (error: any) {
        console.error("Error saving offers to Supabase:", error);
        return { success: false, error: error.message };
    }
}


export async function saveTripPlanToSupabase(tripPlanData: Omit<TripPlan, 'id' | 'timestamp'>) {
    const supabase = await createClient();
    try {
        const tripPlanRecord = {
            ...tripPlanData,
            timestamp: new Date().toISOString(),
            id: `TP-${Date.now()}`
        };
        const { data, error } = await supabase
            .from('trip_plans')
            .insert([tripPlanRecord])
            .select()
            .single();

        if (error) throw error;
        return { success: true, id: data.id };
    } catch (error: any) {
        console.error("Error saving trip plan to Supabase:", error);
        return { success: false, error: error.message };
    }
}

export async function getTripPlansFromSupabase(): Promise<TripPlan[]> {
    const supabase = await createClient();
    try {
        const { data: tripPlans, error } = await supabase
            .from('trip_plans')
            .select('*')
            .order('timestamp', { ascending: false });

        if (error) throw error;

        return (tripPlans || []).map(tp => ({
            ...tp,
            timestamp: new Date(tp.timestamp),
        })) as TripPlan[];
    } catch (error) {
        console.error("Error fetching trip plans from Supabase:", error);
        return [];
    }
}

const defaultTaxesAndCharges: TaxesAndCharges = {
    tollCharges: "0",
    taxes: [{ id: 'tax-1', name: 'GST', value: '5', enabled: true }],
    statePermitCharges: [],
};

export async function getTaxesAndCharges(): Promise<TaxesAndCharges> {
    return getConfigFromSupabase('taxesAndCharges', defaultTaxesAndCharges);
}

export async function saveTaxesAndCharges(details: TaxesAndCharges) {
    return saveConfigToSupabase('taxesAndCharges', details);
}


const defaultInclusionsExclusions: InclusionsExclusions = {
    inclusions: [],
    exclusions: []
};

export async function getInclusionsExclusions(): Promise<InclusionsExclusions> {
    return getConfigFromSupabase('inclusionsExclusions', defaultInclusionsExclusions);
}

export async function saveInclusionsExclusions(data: InclusionsExclusions) {
    return saveConfigToSupabase('inclusionsExclusions', data);
}


export async function getUserBookings(userEmail: string): Promise<Booking[]> {
    const supabase = await createClient();
    try {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('customer_email', userEmail)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return (bookings || []).map(b => ({
            ...b,
            createdAt: new Date(b.created_at),
        })) as Booking[];
    } catch (error: any) {
        console.error("Error fetching user bookings from Supabase:", error);
        return [];
    }
}

const defaultButtonSettings: ButtonSettings = {
    enquireNowAction: 'email',
};

export async function getButtonSettings(): Promise<ButtonSettings> {
  return getConfigFromSupabase('buttonSettings', defaultButtonSettings);
}

export async function saveButtonSettings(settings: ButtonSettings) {
    revalidatePath('/');
    return saveConfigToSupabase('buttonSettings', settings);
}

// Helper functions for collection deletion removed

export async function uploadTollDataToSupabase(tollData: TollPlaza[]): Promise<{ success: boolean, error?: string, count?: number }> {
    const supabase = await createClient();
    try {
        const { error: deleteError } = await supabase
            .from('toll_data')
            .delete()
            .neq('id', 'placeholder');

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
            .from('toll_data')
            .insert(tollData);

        if (insertError) throw insertError;
        
        return { success: true, count: tollData.length };
    } catch (error: any) {
        console.error("Error uploading toll data to Supabase:", error);
        return { success: false, error: error.message };
    }
}

export async function clearTollData(): Promise<{ success: boolean; error?: string; count?: number }> {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('toll_data')
            .delete()
            .neq('id', 'placeholder');

        if (error) throw error;
        return { success: true, count: 0 };
    } catch (error: any) {
        console.error("Error clearing toll data from Supabase:", error);
        return { success: false, error: error.message };
    }
}

export async function archiveOldDataToSheet() {
    return { success: false, error: "Google Sheets archiving is currently disabled." };
}



export async function deleteAllDataByCategory(category: string, selectedIds?: string[]): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    const tables: { [key: string]: string } = {
        'bookings': 'bookings',
        'trip-plans': 'trip_plans',
        'web-logins': 'web_logins',
        'customer-details': 'customers',
        'user-reports': 'reports',
        'user-feedbacks': 'feedbacks'
    };

    const tableName = tables[category];

    if (!tableName) {
        return { success: false, error: "Invalid data category specified." };
    }

    try {
        if (selectedIds && selectedIds.length > 0) {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .in('id', selectedIds);
            
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .neq('id', 'placeholder_to_match_all'); // Simple trick to delete all rows
            
            if (error) throw error;
        }
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting from table ${tableName}:`, error);
        return { success: false, error: `Failed to delete ${category}.` };
    }
}

// deleteSelectedItems logic merged into deleteAllDataByCategory

export async function getUserById(uid: string): Promise<{ success: boolean; user?: { uid: string; email: string; displayName: string }; error?: string }> {
    const supabase = await createClient();
    try {
        const { data: { user }, error } = await supabase.auth.admin.getUserById(uid);
        if (error || !user) throw error || new Error("User not found");
        
        return { 
            success: true, 
            user: { 
                uid: user.id, 
                email: user.email || '', 
                displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            } 
        };
    } catch (error: any) {
        console.error("Error fetching user by ID from Supabase:", error);
        return { success: false, error: error.message };
    }
}

export async function getUserByEmail(email: string): Promise<{ success: boolean; user?: { uid: string; email: string; displayName: string }; error?: string }> {
    const supabase = await createClient();
    try {
        // listUsers is more reliable for admin search
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        const user = users.find(u => u.email === email);
        if (!user) return { success: false, error: "User not found" };
        
        return { 
            success: true, 
            user: { 
                uid: user.id, 
                email: user.email || '', 
                displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            } 
        };
    } catch (error: any) {
        console.error("Error fetching user by email from Supabase:", error);
        return { success: false, error: error.message };
    }
}





    







    

    