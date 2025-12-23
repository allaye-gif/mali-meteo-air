# AirQuality Bamako - Bulletin Generator

## Overview

This is an air quality bulletin generator application for Bamako, Mali. The application allows users to upload CSV data from air quality monitoring stations, processes the data to calculate Air Quality Index (AQI) values, and generates professional PDF-ready bulletins with health recommendations.

The system parses pollutant data (NO2, SO2, CO, O3, PM2.5, PM10) from multiple monitoring stations, calculates AQI using EPA breakpoints, and presents the results in a printable bulletin format with color-coded status indicators and health advice.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables for soft color palette
- **PDF Generation**: Uses browser's native print functionality (`window.print()`) for PDF export

### Backend Architecture
- **Runtime**: Node.js with Express
- **Development Server**: Vite dev server with HMR proxied through Express
- **Production Build**: Vite builds static assets, esbuild bundles server code
- **Web Scraping**: Puppeteer integration exists for fetching data from Pulsonic platform (external air quality data source)

### Data Processing
- **CSV Parsing**: PapaParse library for client-side CSV parsing
- **AQI Calculation**: Custom implementation in `client/src/lib/air-quality.ts` using US EPA breakpoints
- **Station Data**: Supports multiple monitoring stations (BKO_Qualité_Air_1, LASSA, SOTUBA, BAMAKO-UNIVERSITE)

### Key Design Decisions

1. **Client-side CSV processing**: The application processes CSV files entirely in the browser, reducing server load and enabling offline functionality after initial page load.

2. **Print-based PDF generation**: Rather than using a complex PDF library, the app leverages CSS print media queries and `window.print()` for PDF export, simplifying the implementation.

3. **Soft color palette**: The UI uses HSL color values explicitly for compatibility with html2canvas, with a warm, professional aesthetic suitable for official government bulletins.

4. **In-memory storage**: The backend uses in-memory storage (`MemStorage` class) for user data, suitable for development but would need database integration for production.

## External Dependencies

### Database
- **Drizzle ORM**: Configured for PostgreSQL with Neon serverless driver
- **Schema**: Currently defines a simple users table in `shared/schema.ts`
- **Note**: Database is configured but may not be actively provisioned; the `DATABASE_URL` environment variable is required for database operations

### Third-Party Services
- **Pulsonic Platform**: External air quality data source (app.pulsonic.com) - Puppeteer-based scraping endpoint exists at `/api/pulsoweb/fetch`
- **Google Fonts**: Inter and Outfit font families loaded from Google Fonts CDN

### Key npm Packages
- `papaparse`: CSV parsing
- `html2canvas` / `jspdf`: PDF generation capabilities (though print is primary method)
- `puppeteer`: Headless browser for web scraping
- `axios` / `cheerio`: HTTP requests and HTML parsing for scraping
- `zod`: Schema validation
- `date-fns`: Date manipulation

### Environment Requirements
- Node.js >= 18
- Chromium (required for Puppeteer web scraping functionality)
- `DATABASE_URL` environment variable for database operations