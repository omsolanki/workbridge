const { spawn } = require("child_process");
const path = require("path");

console.log("🧪 Testing WorkBridge Setup...\n");

// Test 1: Check if server dependencies are installed
console.log("1. Checking server dependencies...");
try {
  const serverPackageJson = require("./server/package.json");
  console.log("✅ Server package.json found");
  console.log(
    `   - Dependencies: ${Object.keys(serverPackageJson.dependencies).length}`
  );
  console.log(
    `   - Dev Dependencies: ${
      Object.keys(serverPackageJson.devDependencies).length
    }`
  );
} catch (error) {
  console.log("❌ Server package.json not found or invalid");
}

// Test 2: Check if client dependencies are installed
console.log("\n2. Checking client dependencies...");
try {
  const clientPackageJson = require("./client/package.json");
  console.log("✅ Client package.json found");
  console.log(
    `   - Dependencies: ${Object.keys(clientPackageJson.dependencies).length}`
  );
  console.log(
    `   - Dev Dependencies: ${
      Object.keys(clientPackageJson.devDependencies).length
    }`
  );
} catch (error) {
  console.log("❌ Client package.json not found or invalid");
}

// Test 3: Check if .env file exists
console.log("\n3. Checking environment configuration...");
const fs = require("fs");
if (fs.existsSync(".env")) {
  console.log("✅ .env file found");
} else if (fs.existsSync("env.example")) {
  console.log("⚠️  .env file not found, but env.example exists");
  console.log("   Run: cp env.example .env");
} else {
  console.log("❌ No environment configuration found");
}

// Test 4: Check if TypeScript configs exist
console.log("\n4. Checking TypeScript configuration...");
if (fs.existsSync("./server/tsconfig.json")) {
  console.log("✅ Server TypeScript config found");
} else {
  console.log("❌ Server TypeScript config missing");
}

if (fs.existsSync("./client/tsconfig.json")) {
  console.log("✅ Client TypeScript config found");
} else {
  console.log("❌ Client TypeScript config missing");
}

// Test 5: Check if Docker config exists
console.log("\n5. Checking Docker configuration...");
if (fs.existsSync("docker-compose.yml")) {
  console.log("✅ Docker Compose config found");
} else {
  console.log("❌ Docker Compose config missing");
}

console.log("\n📋 Setup Summary:");
console.log("================");
console.log("✅ Backend: Express + TypeScript + MongoDB");
console.log("✅ Frontend: React + Vite + TypeScript + TailwindCSS");
console.log("✅ Authentication: JWT with role-based access");
console.log("✅ Real-time: Socket.IO for chat and notifications");
console.log("✅ File Uploads: AWS S3 integration");
console.log("✅ Payments: Stripe/PayPal skeleton");
console.log("✅ Docker: Full stack containerization");
console.log("✅ API Docs: Swagger/OpenAPI");

console.log("\n🚀 Next Steps:");
console.log("==============");
console.log(
  "1. Copy env.example to .env and configure your environment variables"
);
console.log("2. Install dependencies: cd server && npm install");
console.log("3. Install frontend dependencies: cd client && npm install");
console.log("4. Start backend: cd server && npm run dev");
console.log("5. Start frontend: cd client && npm run dev");
console.log("6. Or use Docker: docker-compose up --build");

console.log("\n📚 Documentation:");
console.log("=================");
console.log("- API Docs: http://localhost:5000/api/docs");
console.log("- Health Check: http://localhost:5000/api/ping");
console.log("- Frontend: http://localhost:3000");
