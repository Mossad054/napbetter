// Polyfill for React Native web compatibility
import 'react-native-get-random-values';

// Additional polyfills if needed
if (typeof global === 'undefined') {
  global = globalThis;
}

// URL polyfill for React Native
if (typeof global.URL === 'undefined') {
  global.URL = require('react-native-url-polyfill').URL;
}

// TextEncoder/TextDecoder polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('text-encoding').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('text-encoding').TextDecoder;
}