/* global window -- Injected in the browser by Playwright. */
/* Browser-only Google Maps/Places fixture; all coordinates are synthetic. */
window.__CIVICMAPS_TEST_PREDICTION_CALLS__ = [];
const maps = {
  Map: class {
    center;
    listeners = new Map();
    constructor(element, options) {
      this.element = element;
      this.center = options.center;
      window.__civicmapsFakeMap = this;
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
  Geocoder: class {
    async geocode() {
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
  window.__civicmapsFakeMap?.listeners.get('click')?.({
    latLng: { lat: () => latitude, lng: () => longitude },
  });
