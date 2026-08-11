/**
 * Utility functions for parsing and handling location URLs and coordinates
 * Supports Google Maps, OpenStreetMap, and direct coordinate formats
 */

/**
 * Parse coordinates from various URL formats
 * @param {string} url - The URL to parse
 * @returns {Object} - Object with lat and lng properties, or empty object if not found
 */
export function parseCoordinatesFromUrl(url) {
  if (!url) return {};

  try {
    const str = String(url).trim();

    // Direct coordinate format: "lat,lng" or "lat, lng"
    const directMatch = str.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lng = parseFloat(directMatch[2]);
      if (!isNaN(lat) && !isNaN(lng) && isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }

    // Google Maps URL patterns
    const googleMapsPatterns = [
      // Standard Google Maps: @lat,lng,zoom
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Google Maps with query parameter: ?q=lat,lng
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Google Maps with ll parameter: ll=lat,lng
      /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Google Maps with destination parameter: destination=lat,lng
      /[?&]destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      // Google Maps embed format: !1d{lng}!2d{lat}
      /!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/,
    ];

    for (const pattern of googleMapsPatterns) {
      const match = str.match(pattern);
      if (match) {
        let lat, lng;
        // Handle embed format where order is reversed
        if (pattern.toString().includes('!1d') && pattern.toString().includes('!2d')) {
          lng = parseFloat(match[1]);
          lat = parseFloat(match[2]);
        } else {
          lat = parseFloat(match[1]);
          lng = parseFloat(match[2]);
        }
        
        if (!isNaN(lat) && !isNaN(lng) && isValidCoordinate(lat, lng)) {
          return { lat, lng };
        }
      }
    }

    // OpenStreetMap URL patterns
    const osmPatterns = [
      // OSM standard: #map=zoom/lat/lng
      /#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/,
      // OSM with lat/lon parameters: lat=...&lon=...
      /[?&]lat=(-?\d+\.?\d*)[&]lon=(-?\d+\.?\d*)/,
      // OSM with ml parameter: ml=lat,lng
      /[?&]ml=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    ];

    for (const pattern of osmPatterns) {
      const match = str.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng) && isValidCoordinate(lat, lng)) {
          return { lat, lng };
        }
      }
    }

    return {};
  } catch (error) {
    console.error('Error parsing coordinates from URL:', error);
    return {};
  }
}

/**
 * Validate if coordinates are within valid ranges
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
function isValidCoordinate(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Generate OpenStreetMap URL from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (default: 16)
 * @returns {string} - OpenStreetMap URL
 */
export function generateOSMUrl(lat, lng, zoom = 16) {
  if (!lat || !lng) return '';
  return `https://www.openstreetmap.org/#map=${zoom}/${lat}/${lng}`;
}

/**
 * Generate Google Maps URL from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - Google Maps URL
 */
export function generateGoogleMapsUrl(lat, lng) {
  if (!lat || !lng) return '';
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Get current browser GPS location
 * @returns {Promise<Object>} - Promise resolving to { lat, lng } or rejecting with error
 */
export function getCurrentGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
