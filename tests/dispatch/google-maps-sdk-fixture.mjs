/* global window, document -- Injected in the browser by Playwright. */
/* Browser-only Google Maps/Places fixture; all coordinates are synthetic. */
window.__CIVICMAPS_TEST_PREDICTION_CALLS__ = [];
window.__civicmapsFakeMaps = [];
const maps = {
  Map: class {
    center;
    listeners = new Map();
    constructor(element, options) {
      this.element = element;
      this.center = options.center;
      window.__civicmapsFakeMap = this;
      window.__civicmapsFakeMaps.push(this);
    }
    setCenter(value) {
      this.center = value;
    }
    getCenter() {
      return { lat: () => this.center.lat, lng: () => this.center.lng };
    }
    setOptions() {}
    addListener(event, callback) {
      this.listeners.set(event, callback);
      return { remove: () => this.listeners.delete(event) };
    }
  },
  AdvancedMarkerElement: class {
    constructor(options) {
      Object.assign(this, options);
    }
    addListener(event, callback) {
      this.onClick = callback;
    }
  },
  PinElement: class {
    constructor(options) {
      this.element = document.createElement('span');
      this.element.className = 'synthetic-map-pin';
      this.element.dataset.background = options.background;
    }
  },
  Geocoder: class {
    async geocode({ location }) {
      if (location.lat > -37.801) return { results: [] };
      return { results: [{ formatted_address: 'Synthetic map location, Melbourne VIC' }] };
    }
  },
};
const places = {
  AutocompleteSessionToken: class {},
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: async ({ input }) => {
      window.__CIVICMAPS_TEST_PREDICTION_CALLS__.push(input);
      if (input.startsWith('Slow ')) await new Promise((resolve) => setTimeout(resolve, 800));
      if (input === 'Hanging address query') return new Promise(() => {});
      return {
        suggestions: [
          {
            placePrediction: {
              placeId: 'synthetic-place',
              text: { toString: () => input },
              toPlace: () => ({
                fetchFields: async () => {},
                formattedAddress: input,
                location: { lat: () => -37.814, lng: () => 144.963 },
                types: input.startsWith('Street only') ? ['route'] : ['street_address'],
              }),
            },
          },
        ],
      };
    },
  },
};
window.google = {
  maps: {
    importLibrary: async (name) => (name === 'maps' ? maps : name === 'places' ? places : maps),
  },
};
window.__civicmapsFakeMapClick = (latitude, longitude) =>
  window.__civicmapsFakeMaps.forEach((map) =>
    map.listeners.get('click')?.({
      latLng: { lat: () => latitude, lng: () => longitude },
    }),
  );
