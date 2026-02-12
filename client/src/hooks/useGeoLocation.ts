import { trpc } from '@/lib/trpc';

interface GeoLocationResult {
  country: string | null;
  countryCode: string | null;
  isRussia: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useGeoLocation(): GeoLocationResult {
  // Use server-side geo check (more reliable than client-side)
  const geoQuery = trpc.geo.check.useQuery(undefined, {
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });

  if (geoQuery.isLoading) {
    return {
      country: null,
      countryCode: null,
      isRussia: false,
      isLoading: true,
      error: null,
    };
  }

  if (geoQuery.error) {
    console.error('[GeoLocation] Server error:', geoQuery.error);
    return {
      country: null,
      countryCode: null,
      isRussia: false,
      isLoading: false,
      error: geoQuery.error.message,
    };
  }

  if (geoQuery.data) {
    console.log('[GeoLocation] Server result:', geoQuery.data.country, '| isRussia:', geoQuery.data.isRussia);
    return {
      country: geoQuery.data.country,
      countryCode: geoQuery.data.isRussia ? 'RU' : null,
      isRussia: geoQuery.data.isRussia,
      isLoading: false,
      error: null,
    };
  }

  return {
    country: null,
    countryCode: null,
    isRussia: false,
    isLoading: false,
    error: 'No data',
  };
}

// Helper to check if warning was dismissed in this session
const WARNING_DISMISSED_KEY = 'invites_russia_warning_dismissed';

export function isRussiaWarningDismissed(): boolean {
  try {
    return sessionStorage.getItem(WARNING_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissRussiaWarning(): void {
  try {
    sessionStorage.setItem(WARNING_DISMISSED_KEY, 'true');
  } catch {
    // sessionStorage might be disabled
  }
}


