import { useEffect, useRef, useState } from 'react';

export type LocationPoint = {
  address: string;
  latitude: number;
  longitude: number;
  source?: 'address' | 'map';
};
type Point = LocationPoint;
type Prediction = {
  text: string;
  placeId: string;
  toPlace: () => {
    fetchFields: (options: unknown) => Promise<void>;
    formattedAddress?: string;
    types?: string[];
    location?: { lat: () => number; lng: () => number };
  };
};
type GoogleMap = {
  setCenter: (point: { lat: number; lng: number }) => void;
  addListener: (
    event: string,
    callback: (event: { latLng?: { lat: () => number; lng: () => number } }) => void,
  ) => { remove: () => void };
  setOptions: (options: unknown) => void;
  getCenter: () => { lat: () => number; lng: () => number } | undefined;
};
type MapsLibrary = {
  Map: new (element: HTMLElement, options: unknown) => GoogleMap;
  AdvancedMarkerElement?: new (options: unknown) => { position: unknown };
  PinElement?: new (options: { background: string; borderColor: string; glyphColor: string }) => {
    element: HTMLElement;
  };
};
type GeocodingLibrary = {
  Geocoder: new () => {
    geocode: (request: unknown) => Promise<{ results: Array<{ formatted_address: string }> }>;
  };
};
type PlacesLibrary = {
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: unknown) => Promise<{
      suggestions?: Array<{
        placePrediction?: {
          text?: { toString: () => string };
          placeId?: string;
          toPlace: () => {
            fetchFields: (options: unknown) => Promise<void>;
            formattedAddress?: string;
            types?: string[];
            location?: { lat: () => number; lng: () => number };
          };
        };
      }>;
    }>;
  };
  AutocompleteSessionToken: new () => object;
};
type GoogleMapsWindow = Window & {
  google?: {
    maps?: { importLibrary: (name: string) => Promise<unknown>; Map?: MapsLibrary['Map'] };
  };
};

export type OperationalRequestPin = {
  id: string;
  number: string;
  latitude: number;
  longitude: number;
};

let loader: Promise<void> | undefined;
async function bounded<T>(operation: Promise<T>, label: string, timeoutMs = 10000): Promise<T> {
  let timer: number | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(
          () => reject(new Error(`${label} timed out. Retry the lookup.`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) window.clearTimeout(timer);
  }
}
async function reverseGeocode(latitude: number, longitude: number) {
  await loadMaps();
  const library = (await bounded(
    (window as GoogleMapsWindow).google!.maps!.importLibrary('geocoding'),
    'Address lookup setup',
  )) as GeocodingLibrary;
  const result = await bounded(
    new library.Geocoder().geocode({ location: { lat: latitude, lng: longitude } }),
    'Address lookup',
  );
  return result.results[0]?.formatted_address ?? '';
}
function loadMaps(): Promise<void> {
  if (loader) return loader;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if ((window as GoogleMapsWindow).google?.maps?.importLibrary) return Promise.resolve();
  if (!key) return Promise.reject(new Error('Google Maps is not configured for this runtime.'));
  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-civicmaps-google]');
    const script = existing ?? document.createElement('script');
    const timer = window.setTimeout(() => {
      script.remove();
      reject(
        new Error('Google Maps did not load. Check the runtime key and referrer restrictions.'),
      );
    }, 12000);
    script.dataset.civicmapsGoogle = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('Google Maps could not load. Retry when the connection is available.'));
    };
    if (!existing) document.head.append(script);
  }).catch((error) => {
    loader = undefined;
    throw error;
  });
  return loader;
}

export function GoogleLocationPicker({
  address,
  onAddressChange,
  onSelect,
  point,
}: {
  address: string;
  onAddressChange: (value: string) => void;
  onSelect: (point: Point | null) => void;
  point: Point | null;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<GoogleMap | null>(null);
  const marker = useRef<{ position: unknown } | null>(null);
  const revision = useRef(0);
  const pointRevision = useRef(0);
  const searchTimer = useRef<number | null>(null);
  const session = useRef<object | null>(null);
  const mapPickListener = useRef<{ remove: () => void } | null>(null);
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [status, setStatus] = useState('');
  const [mapMode, setMapMode] = useState(false);
  const [candidate, setCandidate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [mapGeneration, setMapGeneration] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const previousPoint = useRef<Point | null>(null);
  const previousAddress = useRef('');
  const [mapError, setMapError] = useState(false);
  const [lookupError, setLookupError] = useState(false);

  useEffect(() => {
    let active = true;
    const mountedRevision = revision.current;
    setMapReady(false);
    setMapError(false);
    map.current = null;
    marker.current = null;
    void loadMaps()
      .then(async () => {
        const maps = (await bounded(
          (window as GoogleMapsWindow).google!.maps!.importLibrary('maps'),
          'Map loading',
        )) as MapsLibrary;
        (await bounded(
          (window as GoogleMapsWindow).google!.maps!.importLibrary('places'),
          'Address search setup',
        )) as PlacesLibrary;
        const markerLibrary = (await bounded(
          (window as GoogleMapsWindow).google!.maps!.importLibrary('marker'),
          'Map marker setup',
        )) as MapsLibrary;
        if (!active || !mapElement.current) return;
        const center = { lat: -25.0, lng: 133.0 };
        map.current = new maps.Map(mapElement.current, {
          center,
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        setStatus('');
        setMapReady(true);
        void markerLibrary;
      })
      .catch((error: Error) => {
        if (active) {
          setStatus(error.message);
          setMapError(true);
        }
      });
    return () => {
      active = false;
      revision.current = Math.max(revision.current, mountedRevision) + 1;
      if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
      mapPickListener.current?.remove();
    };
  }, [mapGeneration]);

  useEffect(() => {
    if (!mapReady) return;
    const current = ++pointRevision.current;
    const visiblePoint = candidate ?? point;
    if (visiblePoint && map.current) {
      const position = { lat: visiblePoint.latitude, lng: visiblePoint.longitude };
      map.current.setCenter(position);
      if (marker.current) marker.current.position = position;
      else
        void loadMaps()
          .then(async () => {
            const maps = (await bounded(
              (window as GoogleMapsWindow).google!.maps!.importLibrary('marker'),
              'Map marker setup',
            )) as MapsLibrary;
            if (current === pointRevision.current)
              marker.current = new maps.AdvancedMarkerElement!({
                map: map.current,
                position,
              });
          })
          .catch(() => {});
    } else if (marker.current) marker.current.position = null;
  }, [point, candidate, mapReady]);

  async function search(value: string) {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    onAddressChange(value);
    if (point?.source === 'map') onSelect({ ...point, address: value });
    else onSelect(null);
    setSuggestions([]);
    const current = ++revision.current;
    if (value.trim().length < 3) {
      setStatus('');
      return;
    }
    setStatus('Searching addresses…');
    setLookupError(false);
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      try {
        await loadMaps();
        const places = (await bounded(
          (window as GoogleMapsWindow).google!.maps!.importLibrary('places'),
          'Address search setup',
        )) as PlacesLibrary;
        session.current ??= new places.AutocompleteSessionToken();
        const response = await bounded(
          places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            sessionToken: session.current,
            includedRegionCodes: ['au'],
          }),
          'Address search',
        );
        if (current !== revision.current) return;
        const next = (response.suggestions ?? []).flatMap((item) =>
          item.placePrediction?.placeId
            ? [
                {
                  text: item.placePrediction.text?.toString() ?? '',
                  placeId: item.placePrediction.placeId,
                  toPlace: item.placePrediction.toPlace,
                },
              ]
            : [],
        );
        setSuggestions(next);
        setActiveSuggestion(0);
        setStatus(
          next.length
            ? `${next.length} address suggestions available.`
            : 'No address suggestions found. Select the location on the map.',
        );
      } catch {
        if (current === revision.current) {
          setLookupError(true);
          setStatus('Address search is unavailable. You can select the location on the map.');
        }
      }
    }, 300);
  }

  async function choose(prediction: Prediction) {
    const current = ++revision.current;
    onSelect(null);
    setSuggestions([]);
    setStatus('Confirming address…');
    setLookupError(false);
    try {
      await loadMaps();
      const place = prediction.toPlace();
      await bounded(
        place.fetchFields({ fields: ['formattedAddress', 'location', 'types'] }),
        'Address resolution',
      );
      if (current !== revision.current || !place.location)
        throw new Error('Address has no usable point.');
      const preciseTypes = new Set(['street_address', 'premise', 'subpremise', 'establishment']);
      if (!place.types?.some((type) => preciseTypes.has(type))) {
        setLookupError(false);
        setStatus(
          'This result identifies a street or area, not a confirmed incident point. Select the exact location on the map.',
        );
        return;
      }
      const selection = {
        address: place.formattedAddress || prediction.text,
        latitude: place.location.lat(),
        longitude: place.location.lng(),
        source: 'address' as const,
      };
      session.current = null;
      setCandidate(null);
      setMapMode(false);
      mapPickListener.current?.remove();
      mapPickListener.current = null;
      map.current?.setOptions({ draggableCursor: null });
      previousPoint.current = null;
      previousAddress.current = '';
      onAddressChange(selection.address);
      onSelect(selection);
      setStatus('Location confirmed.');
    } catch {
      if (current === revision.current) setLookupError(true);
      if (current === revision.current)
        setStatus('This address could not be resolved to a point. Select it on the map.');
    }
  }

  function enableMapPick() {
    if (mapMode || !mapReady || !map.current) return;
    revision.current++;
    previousPoint.current = point;
    previousAddress.current = address;
    onSelect(null);
    onAddressChange('');
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    setSuggestions([]);
    setMapMode(true);
    setCandidate(null);
    setStatus('Click the map or move its centre crosshair to choose the reported location.');
    if (!map.current) return;
    map.current.setOptions({ draggableCursor: 'crosshair' });
    mapPickListener.current?.remove();
    mapPickListener.current = map.current.addListener('click', (event) => {
      const location = event.latLng;
      if (location) {
        const candidatePoint = { latitude: location.lat(), longitude: location.lng() };
        setCandidate(candidatePoint);
        if (marker.current)
          marker.current.position = { lat: candidatePoint.latitude, lng: candidatePoint.longitude };
      }
    });
  }
  function selectMapCentre() {
    const centre = map.current?.getCenter();
    if (centre) {
      const candidatePoint = { latitude: centre.lat(), longitude: centre.lng() };
      setCandidate(candidatePoint);
      if (marker.current)
        marker.current.position = { lat: candidatePoint.latitude, lng: candidatePoint.longitude };
    }
  }
  function cancelMapPick() {
    // Cancellation also invalidates address work started while map picking was active.
    revision.current += 1;
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = null;
    setSuggestions([]);
    setActiveSuggestion(0);
    setLookupError(false);
    setMapMode(false);
    setCandidate(null);
    const restoredPoint = previousPoint.current;
    const restoredAddress = previousAddress.current;
    previousPoint.current = null;
    previousAddress.current = '';
    onAddressChange(restoredAddress);
    // Restore after the address callback, which can invalidate free-text address points.
    onSelect(restoredPoint);
    setStatus(restoredPoint ? 'Previous confirmed location restored.' : 'Map selection cancelled.');
    mapPickListener.current?.remove();
    mapPickListener.current = null;
    map.current?.setOptions({ draggableCursor: null });
  }
  async function confirmMapPoint() {
    if (!candidate) return;
    const current = ++revision.current;
    const value = { ...candidate, address: address.trim(), source: 'map' as const };
    onSelect(value);
    setCandidate(null);
    setMapMode(false);
    setStatus('Location pinned. Resolving an address…');
    mapPickListener.current?.remove();
    mapPickListener.current = null;
    map.current?.setOptions({ draggableCursor: null });
    try {
      const label = await bounded(
        reverseGeocode(value.latitude, value.longitude),
        'Address lookup',
      );
      if (current !== revision.current) return;
      if (label) {
        onAddressChange(label);
        onSelect({ ...value, address: label });
        setStatus('Map location confirmed with a resolved address.');
      } else
        setStatus(
          'Location is pinned. Enter an address or a clear location description to continue.',
        );
    } catch {
      if (current === revision.current) {
        setLookupError(true);
        setStatus(
          'Location is pinned. Address lookup failed; enter an address or a clear location description to continue.',
        );
      }
    }
  }
  async function retryLookup() {
    if (point?.source !== 'map') {
      void search(address);
      return;
    }
    const current = ++revision.current;
    setLookupError(false);
    setStatus('Retrying address lookup…');
    try {
      const label = await bounded(
        reverseGeocode(point.latitude, point.longitude),
        'Address lookup',
      );
      if (current !== revision.current) return;
      if (label) {
        onAddressChange(label);
        onSelect({ ...point, address: label });
        setStatus('Map location confirmed with a resolved address.');
      } else
        setStatus(
          'Location is pinned. Enter an address or a clear location description to continue.',
        );
    } catch {
      if (current === revision.current) {
        setLookupError(true);
        setStatus('Address lookup is unavailable. Enter a clear location description or retry.');
      }
    }
  }
  return (
    <section className="location-picker" aria-label="Reported location">
      <label>
        Reported address
        <input
          value={address}
          maxLength={250}
          autoComplete="off"
          onChange={(event) => {
            void search(event.target.value);
          }}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="address-suggestions"
          aria-activedescendant={
            suggestions[activeSuggestion] ? `address-suggestion-${activeSuggestion}` : undefined
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSuggestions([]);
              revision.current++;
              return;
            }
            if (!suggestions.length) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveSuggestion((index) => (index + 1) % suggestions.length);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveSuggestion((index) => (index + suggestions.length - 1) % suggestions.length);
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              void choose(suggestions[activeSuggestion]);
            }
          }}
        />
      </label>
      <p className="location-status" role="status">
        {status}
      </p>
      {suggestions.length > 0 && (
        <ul id="address-suggestions" className="address-suggestions" role="listbox">
          {suggestions.map((suggestion, index) => (
            <li id={`address-suggestion-${index}`} key={suggestion.placeId}>
              <button
                type="button"
                className="secondary"
                role="option"
                onClick={() => void choose(suggestion)}
              >
                {suggestion.text}
              </button>
            </li>
          ))}
        </ul>
      )}
      {mapError ? (
        <div className="map-error" role="status">
          <p>{status || 'The map is unavailable.'}</p>
          <button
            type="button"
            className="secondary"
            onClick={() => setMapGeneration((generation) => generation + 1)}
          >
            Retry map
          </button>
        </div>
      ) : (
        <div ref={mapElement} className="location-map" aria-label="Map for reported location" />
      )}
      {lookupError && (
        <button type="button" className="secondary" onClick={() => void retryLookup()}>
          Retry address lookup
        </button>
      )}
      <div className="location-map-actions">
        <button type="button" className="secondary" disabled={!mapReady} onClick={enableMapPick}>
          Select location on map
        </button>
        {mapMode && (
          <>
            <button type="button" className="secondary" onClick={selectMapCentre}>
              Choose map centre
            </button>
            <button type="button" disabled={!candidate} onClick={confirmMapPoint}>
              Use this location
            </button>
            <button type="button" className="secondary" onClick={cancelMapPick}>
              Cancel
            </button>
          </>
        )}
      </div>
      {point && (
        <p className="confirmed-location">
          Location confirmed ·{' '}
          <span className="mono">
            {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
          </span>
        </p>
      )}
    </section>
  );
}

export function OperationalMap({
  requests,
  selected,
  onSelect,
  onCreateLocation,
  draftLocation,
  canCreate,
}: {
  requests: OperationalRequestPin[];
  selected: string | null;
  onSelect: (id: string) => void;
  onCreateLocation: (point: LocationPoint) => void;
  draftLocation: LocationPoint | null;
  canCreate: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<GoogleMap | null>(null);
  const markers = useRef<
    Array<{
      map?: GoogleMap | null;
      position: unknown;
      title?: string;
      addListener?: (event: string, callback: () => void) => void;
    }>
  >([]);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [mapGeneration, setMapGeneration] = useState(0);
  const [pickMode, setPickMode] = useState(false);
  const [candidate, setCandidate] = useState<{ latitude: number; longitude: number } | null>(null);
  const pickListener = useRef<{ remove: () => void } | null>(null);
  const [pickStatus, setPickStatus] = useState('');
  const captureRevision = useRef(0);
  useEffect(() => {
    captureRevision.current += 1;
    return () => {
      captureRevision.current += 1;
    };
  }, [canCreate]);
  useEffect(() => {
    let active = true;
    setMapReady(false);
    setError('');
    map.current = null;
    void loadMaps()
      .then(async () => {
        const maps = (await bounded(
          (window as GoogleMapsWindow).google!.maps!.importLibrary('maps'),
          'Map loading',
        )) as MapsLibrary;
        if (!active || !element.current) return;
        map.current = new maps.Map(element.current, {
          center: { lat: -25.0, lng: 133.0 },
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        setMapReady(true);
      })
      .catch((cause: Error) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
      pickListener.current?.remove();
    };
  }, [mapGeneration]);
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!map.current || !mapReady) return;
      const library = (await bounded(
        (window as GoogleMapsWindow).google!.maps!.importLibrary('marker'),
        'Map marker setup',
      )) as MapsLibrary;
      if (!active) return;
      markers.current.forEach((marker) => {
        marker.map = null;
      });
      const colours = getComputedStyle(element.current ?? document.documentElement);
      const primary = colours.getPropertyValue('--civic-primary').trim();
      const secondary = colours.getPropertyValue('--civic-secondary').trim();
      const accent = colours.getPropertyValue('--civic-accent').trim();
      const surface = colours.getPropertyValue('--civic-surface').trim();
      const alert = colours.getPropertyValue('--status-alert').trim();
      markers.current = requests
        .filter(
          (request) => Number.isFinite(request.latitude) && Number.isFinite(request.longitude),
        )
        .map((request) => {
          const marker = new library.AdvancedMarkerElement!({
            map: map.current,
            position: { lat: request.latitude, lng: request.longitude },
            title: request.number,
            content: library.PinElement
              ? new library.PinElement({
                  background: request.id === selected ? accent : secondary,
                  borderColor: request.id === selected ? primary : surface,
                  glyphColor: surface,
                }).element
              : undefined,
          }) as (typeof markers.current)[number];
          marker.addListener?.('click', () => onSelect(request.id));
          return marker;
        });
      if (
        draftLocation &&
        Number.isFinite(draftLocation.latitude) &&
        Number.isFinite(draftLocation.longitude)
      ) {
        markers.current.push(
          new library.AdvancedMarkerElement!({
            map: map.current,
            position: { lat: draftLocation.latitude, lng: draftLocation.longitude },
            title: 'New service request location',
            content: library.PinElement
              ? new library.PinElement({
                  background: accent,
                  borderColor: primary,
                  glyphColor: surface,
                }).element
              : undefined,
          }) as (typeof markers.current)[number],
        );
      }
      if (candidate)
        markers.current.push(
          new library.AdvancedMarkerElement!({
            map: map.current,
            position: { lat: candidate.latitude, lng: candidate.longitude },
            title: 'Unconfirmed location candidate',
            content: library.PinElement
              ? new library.PinElement({
                  background: alert,
                  borderColor: primary,
                  glyphColor: primary,
                }).element
              : undefined,
          }) as (typeof markers.current)[number],
        );
    })().catch(() => setError('Request locations are temporarily unavailable on the map.'));
    return () => {
      active = false;
    };
  }, [mapReady, requests, selected, onSelect, draftLocation, candidate]);
  useEffect(() => {
    if (!mapReady || !map.current || pickMode) return;
    const activePin = requests.find((request) => request.id === selected);
    if (activePin) map.current.setCenter({ lat: activePin.latitude, lng: activePin.longitude });
    else if (draftLocation)
      map.current.setCenter({ lat: draftLocation.latitude, lng: draftLocation.longitude });
    else if (requests[0])
      map.current.setCenter({ lat: requests[0].latitude, lng: requests[0].longitude });
  }, [mapReady, requests, selected, draftLocation, pickMode]);
  function beginPick() {
    captureRevision.current += 1;
    setPickMode(true);
    setCandidate(null);
    setPickStatus('Click the map or choose its centre to place the new service request.');
    map.current?.setOptions({ draggableCursor: 'crosshair' });
    pickListener.current?.remove();
    pickListener.current =
      map.current?.addListener('click', (event) => {
        if (event.latLng)
          setCandidate({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
      }) ?? null;
  }
  function chooseCentre() {
    const centre = map.current?.getCenter();
    if (centre) setCandidate({ latitude: centre.lat(), longitude: centre.lng() });
  }
  function cancelPick() {
    captureRevision.current += 1;
    setPickMode(false);
    setCandidate(null);
    setPickStatus('');
    pickListener.current?.remove();
    pickListener.current = null;
    map.current?.setOptions({ draggableCursor: null });
  }
  async function confirmPick() {
    if (!candidate || !canCreate) return;
    const point = candidate;
    cancelPick();
    const revision = captureRevision.current;
    try {
      const address = await bounded(
        reverseGeocode(point.latitude, point.longitude),
        'Address lookup',
      );
      if (revision !== captureRevision.current) return;
      onCreateLocation({ ...point, address, source: 'map' });
    } catch {
      if (revision !== captureRevision.current) return;
      // Preserve the chosen point and let dispatch enter an explicit location description.
      onCreateLocation({ ...point, address: '', source: 'map' });
    }
  }
  return (
    <section className="operational-map panel" aria-labelledby="operational-map-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Operational view</p>
          <h2 id="operational-map-title">Service request map</h2>
        </div>
        {!pickMode ? (
          <button
            type="button"
            className="secondary"
            disabled={!mapReady || !canCreate}
            onClick={beginPick}
          >
            Select SR location on map
          </button>
        ) : (
          <div className="location-map-actions">
            <button type="button" className="secondary" onClick={chooseCentre}>
              Choose map centre
            </button>
            <button type="button" disabled={!candidate} onClick={() => void confirmPick()}>
              Use this location
            </button>
            <button type="button" className="secondary" onClick={cancelPick}>
              Cancel
            </button>
          </div>
        )}
        {pickStatus && (
          <span role="status" className="muted">
            {pickStatus}
          </span>
        )}
        <span className="muted">Showing {requests.length} loaded requests</span>
      </div>
      {error ? (
        <div className="map-error" role="status">
          <p>{error}</p>
          <p>The scoped queue and selected request remain available below.</p>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setMapReady(false);
              setMapGeneration((generation) => generation + 1);
            }}
          >
            Retry map
          </button>
        </div>
      ) : (
        <div
          ref={element}
          className="operational-map-canvas"
          aria-label="Map of loaded service requests"
        />
      )}
    </section>
  );
}
