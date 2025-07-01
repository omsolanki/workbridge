# WorkBridge Client

## Debug Tool Configuration

The application includes a configurable debug tool that can be toggled on/off using environment variables.

### How to Enable/Disable Debug Tool

1. **Create a `.env` file** in the client directory (if it doesn't exist)
2. **Add the following line** to your `.env` file:

```bash
# Enable debug tool
VITE_DEBUG_MODE=true

# Disable debug tool
VITE_DEBUG_MODE=false
```

### Debug Tool Features

When enabled, the debug tool appears as a small gear icon in the bottom-right corner of the screen. Click it to expand and view:

- Token status in localStorage and Redux
- Authentication state
- User information
- Loading states
- Error messages
- Test buttons for API calls

### Environment Variables

| Variable          | Description               | Default                     |
| ----------------- | ------------------------- | --------------------------- |
| `VITE_DEBUG_MODE` | Enable/disable debug tool | `false`                     |
| `VITE_API_URL`    | API base URL              | `http://localhost:5001/api` |

### Development vs Production

- **Development**: Set `VITE_DEBUG_MODE=true` for debugging
- **Production**: Set `VITE_DEBUG_MODE=false` or remove the variable entirely

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env file as needed
```

3. Start development server:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
