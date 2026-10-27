import { useEffect, useRef, useState } from 'react';

type Point = { address: string; latitude: number; longitude: number; source?: 'address' | 'map' };
type Prediction = {
  text: string;
  placeId: string;
  toPlace: () => {
    fetchFields: (options: unknown) => Promise<void>;
    formattedAddress?: string;
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
function loadMaps(): Promise<void> {
  if (loader) return loader;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if ((window as GoogleMapsWindow).google?.maps?.importLibrary) return Promise.resolve();
  if (!key) return Promise.reject(new Error('Google Maps is not configured for this runtime.'));
  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-civicmaps-google]');
    const script = existing ?? document.createElement('script');
    const timer = window.setTimeout(
      () =>
        reject(
          new Error('Google Maps did not load. Check the runtime key and referrer restrictions.'),
        ),
      12000,
    );
    script.dataset.civicmapsGoogle = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
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

  useEffect(() => {
    let active = true;
    const mountedRevision = revision.current;
    void loadMaps()
      .then(async () => {
        const maps = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
          'maps',
        )) as MapsLibrary;
        (await (window as GoogleMapsWindow).google!.maps!.importLibrary('places')) as PlacesLibrary;
        const markerLibrary = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
          'marker',
        )) as MapsLibrary;
        if (!active || !mapElement.current) return;
        const center = { lat: -37.8136, lng: 144.9631 };
        map.current = new maps.Map(mapElement.current, {
          center,
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        void markerLibrary;
      })
      .catch((error: Error) => {
        if (active) setStatus(error.message);
      });
    return () => {
      active = false;
      if (revision.current === mountedRevision) revision.current = mountedRevision + 1;
      if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
      mapPickListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    const current = ++pointRevision.current;
    if (point && map.current) {
      const position = { lat: point.latitude, lng: point.longitude };
      map.current.setCenter(position);
      if (marker.current) marker.current.position = position;
      else
        void loadMaps()
          .then(async () => {
            const maps = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
              'marker',
            )) as MapsLibrary;
            if (current === pointRevision.current)
              marker.current = new maps.AdvancedMarkerElement!({
                map: map.current,
                position,
              });
          })
          .catch(() => {});
    } else if (marker.current) marker.current.position = null;
  }, [point]);

  async function search(value: string) {
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
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      try {
        await loadMaps();
        const places = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
          'places',
        )) as PlacesLibrary;
        session.current ??= new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: value,
          sessionToken: session.current,
          includedRegionCodes: ['au'],
        });
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
        if (current === revision.current)
          setStatus('Address search is unavailable. You can select the location on the map.');
      }
    }, 300);
  }

  async function choose(prediction: Prediction) {
    const current = ++revision.current;
    setSuggestions([]);
    setStatus('Confirming address…');
    try {
      await loadMaps();
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress', 'location'] });
      if (current !== revision.current || !place.location)
        throw new Error('Address has no usable point.');
      const selection = {
        address: place.formattedAddress || prediction.text,
        latitude: place.location.lat(),
        longitude: place.location.lng(),
        source: 'address' as const,
      };
      session.current = null;
      onAddressChange(selection.address);
      onSelect(selection);
      setStatus('Location confirmed.');
    } catch {
      if (current === revision.current)
        setStatus('This address could not be resolved to a point. Select it on the map.');
    }
  }

  function enableMapPick() {
    revision.current++;
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
      if (location) setCandidate({ latitude: location.lat(), longitude: location.lng() });
    });
  }
  function selectMapCentre() {
    const centre = map.current?.getCenter();
    if (centre) setCandidate({ latitude: centre.lat(), longitude: centre.lng() });
  }
  function cancelMapPick() {
    setMapMode(false);
    setCandidate(null);
    setStatus(point ? 'Previous confirmed location restored.' : 'Map selection cancelled.');
    mapPickListener.current?.remove();
    mapPickListener.current = null;
    map.current?.setOptions({ draggableCursor: null });
  }
  async function confirmMapPoint() {
    if (!candidate) return;
    const current = ++revision.current;
    const value = { ...candidate, address: address.trim(), source: 'map' as const };
    onSelect(value);
    setMapMode(false);
    setStatus('Location pinned. Resolving an address…');
    mapPickListener.current?.remove();
    mapPickListener.current = null;
    map.current?.setOptions({ draggableCursor: null });
    try {
      await loadMaps();
      const geocoding = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
        'geocoding',
      )) as GeocodingLibrary;
      const response = await new geocoding.Geocoder().geocode({
        location: { lat: value.latitude, lng: value.longitude },
      });
      if (current !== revision.current) return;
      const label = response.results[0]?.formatted_address;
      if (label) {
        onAddressChange(label);
        onSelect({ ...value, address: label });
        setStatus('Map location confirmed with a resolved address.');
      } else
        setStatus(
          'Location is pinned. Enter an address or a clear location description to continue.',
        );
    } catch {
      if (current === revision.current)
        setStatus(
          'Location is pinned. Address lookup failed; enter an address or a clear location description to continue.',
        );
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
      <div ref={mapElement} className="location-map" aria-label="Map for reported location" />
      <div className="location-map-actions">
        <button type="button" className="secondary" onClick={enableMapPick}>
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
}: {
  requests: OperationalRequestPin[];
  selected: string | null;
  onSelect: (id: string) => void;
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
  useEffect(() => {
    let active = true;
    void loadMaps()
      .then(async () => {
        const maps = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
          'maps',
        )) as MapsLibrary;
        if (!active || !element.current) return;
        map.current = new maps.Map(element.current, {
          center: { lat: -37.8136, lng: 144.9631 },
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
    };
  }, []);
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!map.current || !mapReady) return;
      const library = (await (window as GoogleMapsWindow).google!.maps!.importLibrary(
        'marker',
      )) as MapsLibrary;
      if (!active) return;
      markers.current.forEach((marker) => {
        marker.map = null;
      });
      markers.current = requests
        .filter(
          (request) => Number.isFinite(request.latitude) && Number.isFinite(request.longitude),
        )
        .map((request) => {
          const marker = new library.AdvancedMarkerElement!({
            map: map.current,
            position: { lat: request.latitude, lng: request.longitude },
            title: request.number,
          }) as (typeof markers.current)[number];
          marker.addListener?.('click', () => onSelect(request.id));
          return marker;
        });
      const activePin = requests.find((request) => request.id === selected);
      if (activePin) map.current.setCenter({ lat: activePin.latitude, lng: activePin.longitude });
    })().catch(() => setError('Request locations are temporarily unavailable on the map.'));
    return () => {
      active = false;
    };
  }, [mapReady, requests, selected, onSelect]);
  return (
    <section className="operational-map panel" aria-labelledby="operational-map-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Operational view</p>
          <h2 id="operational-map-title">Service request map</h2>
        </div>
        <span className="muted">Showing {requests.length} loaded requests</span>
      </div>
      {error ? (
        <div className="map-error" role="status">
          <p>{error}</p>
          <p>The scoped queue and selected request remain available below.</p>
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
