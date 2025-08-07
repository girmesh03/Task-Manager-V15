const allowedOrigins = [
  "http://localhost:3000", // React development server
  "http://localhost:4000", // Express server (for same-origin requests)
  "http://localhost:5173", // Vite development server
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
  "http://127.0.0.1:5173",
  // Add production domains when deployed
  // "https://yourdomain.com",
];

export default allowedOrigins;
