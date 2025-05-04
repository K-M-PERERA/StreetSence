// Polyfill ReadableStream
const { ReadableStream } = require('web-streams-polyfill/ponyfill');
global.ReadableStream = ReadableStream;
beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
// Polyfill TextEncoder / TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Register jest-dom matchers (like toBeInTheDocument)
require('@testing-library/jest-dom');
