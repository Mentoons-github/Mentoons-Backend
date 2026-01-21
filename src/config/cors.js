module.exports = {
  origin: [
    "https://mentoons.com",
    "https://www.mentoons.com",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:3001",
    "https://mentoons-website-h28kgxm3i-mentoons-projects.vercel.app",
    "https://mentoons-website-j1ndxqhpf-mentoons-projects.vercel.app",
    "https://mentormahesh.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: [
    "Cross-Origin-Opener-Policy",
    "Cross-Origin-Resource-Policy",
    "Access-Control-Allow-Origin",
  ],
  credentials: true,
};
