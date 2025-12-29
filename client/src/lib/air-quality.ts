import Papa from 'papaparse';

export interface AirQualityRecord {
  timestamp: string;
  date: Date;
  stations: {
    [stationName: string]: {
      NO2: number;
      SO2: number;
      CO: number;
      O3: number;
      PM25: number;
      PM10: number;
    };
  };
}

export interface StationSummary {
  name: string;
  maxNO2: number;
  maxSO2: number;
  maxCO: number;
  maxO3: number;
  maxPM25: number;
  maxPM10: number;
  mainPollutant: string;
  mainPollutantConcentration: number;
  mainPollutantUnit: string;
  aqi: number;
  severityRatio: number; // How much the main pollutant exceeds its max breakpoint (for tie-breaking)
  aqiBreakdown: {
    NO2: number;
    SO2: number;
    CO: number;
    O3: number;
    PM25: number;
    PM10: number;
  };
}

export interface DailySummary {
  date: string;
  stations: StationSummary[];
  cityAverageAQI: number;
  cityMaxAQI: number;
  criticalStation: string;
  criticalPollutant: string;
  criticalConcentration: number;
  criticalUnit: string;
}

// EPA AQI Breakpoints - Updated May 2024
// Reference: https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf
//
// Units per EPA specification:
// - NO2: ppb (1-hour average)
// - SO2: ppb (1-hour average)  
// - CO: ppm (8-hour average)
// - O3: ppm (8-hour average)
// - PM2.5: µg/m³ (24-hour average)
// - PM10: µg/m³ (24-hour average)

const BREAKPOINTS = {
  // NO2: 1-hour average (ppb) - Truncate to integer
  NO2: [
    { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
    { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
    { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
    { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
    { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
  ],
  // SO2: 1-hour average (ppb) - Truncate to integer
  SO2: [
    { cLow: 0, cHigh: 35, iLow: 0, iHigh: 50 },
    { cLow: 36, cHigh: 75, iLow: 51, iHigh: 100 },
    { cLow: 76, cHigh: 185, iLow: 101, iHigh: 150 },
    { cLow: 186, cHigh: 304, iLow: 151, iHigh: 200 },
    { cLow: 305, cHigh: 604, iLow: 201, iHigh: 300 },
    { cLow: 605, cHigh: 1004, iLow: 301, iHigh: 500 },
  ],
  // CO: 8-hour average (ppm) - Truncate to 1 decimal (0.1 ppm)
  CO: [
    { cLow: 0, cHigh: 4.4, iLow: 0, iHigh: 50 },
    { cLow: 4.5, cHigh: 9.4, iLow: 51, iHigh: 100 },
    { cLow: 9.5, cHigh: 12.4, iLow: 101, iHigh: 150 },
    { cLow: 12.5, cHigh: 15.4, iLow: 151, iHigh: 200 },
    { cLow: 15.5, cHigh: 30.4, iLow: 201, iHigh: 300 },
    { cLow: 30.5, cHigh: 50.4, iLow: 301, iHigh: 500 },
  ],
  // O3: 8-hour average (ppm) - Truncate to 3 decimals (0.001 ppm)
  O3: [
    { cLow: 0, cHigh: 0.054, iLow: 0, iHigh: 50 },
    { cLow: 0.055, cHigh: 0.070, iLow: 51, iHigh: 100 },
    { cLow: 0.071, cHigh: 0.085, iLow: 101, iHigh: 150 },
    { cLow: 0.086, cHigh: 0.105, iLow: 151, iHigh: 200 },
    { cLow: 0.106, cHigh: 0.200, iLow: 201, iHigh: 300 },
    { cLow: 0.201, cHigh: 0.604, iLow: 301, iHigh: 500 },
  ],
  // PM2.5: 24-hour average (µg/m³) - Updated May 2024 - Truncate to 1 decimal
  PM25: [
    { cLow: 0, cHigh: 9.0, iLow: 0, iHigh: 50 },
    { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
    { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
    { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
    { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
    { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500 },
  ],
  // PM10: 24-hour average (µg/m³) - Truncate to integer
  PM10: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
    { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
    { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
    { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
    { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
  ]
};

// Unit information for each pollutant
const POLLUTANT_UNITS: Record<keyof typeof BREAKPOINTS, string> = {
  NO2: 'ppb',
  SO2: 'ppb',
  CO: 'ppm',
  O3: 'ppm',
  PM25: 'µg/m³',
  PM10: 'µg/m³'
};

// Convert sensor data to EPA units
// Pulsonic/air quality sensors typically output ALL gas concentrations in ppb
// EPA requires: CO in ppm, O3 in ppm, NO2 in ppb, SO2 in ppb
// This function ALWAYS converts CO and O3 from ppb to ppm (divide by 1000)
function convertSensorToEPA(value: number, pollutant: keyof typeof BREAKPOINTS): number {
  if (value <= 0) return 0;
  
  switch (pollutant) {
    case 'CO':
      // Pulsonic sensors output CO in ppb
      // EPA breakpoints are in ppm, so divide by 1000
      return value / 1000;
    case 'O3':
      // Pulsonic sensors output O3 in ppb
      // EPA breakpoints are in ppm, so divide by 1000
      return value / 1000;
    default:
      // NO2, SO2: already in ppb (EPA native unit)
      // PM2.5, PM10: already in µg/m³ (EPA native unit)
      return value;
  }
}

// EPA Truncation Rules - EXACT per specification
function truncateForEPA(value: number, pollutant: keyof typeof BREAKPOINTS): number {
  if (value < 0) return 0;
  
  switch (pollutant) {
    case 'O3':
      // Truncate to 3 decimal places (0.001 ppm)
      return Math.floor(value * 1000) / 1000;
    case 'CO':
    case 'PM25':
      // Truncate to 1 decimal place (0.1 ppm for CO, 0.1 µg/m³ for PM2.5)
      return Math.floor(value * 10) / 10;
    case 'PM10':
    case 'NO2':
    case 'SO2':
      // Truncate to integer
      return Math.floor(value);
    default:
      return Math.floor(value);
  }
}

// EPA AQI Formula: I = [(I_high - I_low) / (C_high - C_low)] * (C - C_low) + I_low
function calculateSubIndex(rawConcentration: number, pollutant: keyof typeof BREAKPOINTS): number {
  // Convert sensor data to EPA units
  const converted = convertSensorToEPA(rawConcentration, pollutant);
  
  // Truncate per EPA rules
  const truncated = truncateForEPA(converted, pollutant);
  
  if (truncated < 0) return 0;
  
  const breakpoints = BREAKPOINTS[pollutant];
  
  // Find the appropriate breakpoint range
  for (const bp of breakpoints) {
    if (truncated >= bp.cLow && truncated <= bp.cHigh) {
      // Apply EPA formula
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (truncated - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }
  
  // If concentration exceeds highest breakpoint, cap at 500 (EPA standard)
  // EPA AQI scale is 0-500; values above are reported as ">500" or simply 500
  const lastBp = breakpoints[breakpoints.length - 1];
  if (truncated > lastBp.cHigh) {
    return 500; // Cap at maximum AQI per EPA specification
  }
  
  return 0;
}

// Get the truncated concentration in EPA units (for display consistency)
function getTruncatedInEPAUnits(rawValue: number, pollutant: keyof typeof BREAKPOINTS): number {
  const converted = convertSensorToEPA(rawValue, pollutant);
  return truncateForEPA(converted, pollutant);
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return "Bonne";
  if (aqi <= 100) return "Modérée";
  if (aqi <= 150) return "Peu Saine GS";
  if (aqi <= 200) return "Peu Saine";
  if (aqi <= 300) return "Très Peu Saine";
  return "Dangereuse";
}

export function getHealthAdvice(aqi: number) {
  if (aqi <= 50) {
    return {
      general: "La qualité de l'air est satisfaisante.",
      sensitive: "Aucune mesure particulière."
    };
  }
  if (aqi <= 100) {
    return {
      general: "Qualité acceptable.",
      sensitive: "Réduire les efforts prolongés en cas de symptômes."
    };
  }
  if (aqi <= 150) {
    return {
      general: "Peu de risques pour le grand public.",
      sensitive: "Réduire les activités intenses en plein air."
    };
  }
  if (aqi <= 200) {
    return {
      general: "Éviter toute activité physique en extérieur.",
      sensitive: "Rester à l'intérieur."
    };
  }
  if (aqi <= 300) {
    return {
      general: "Alerte Rouge : Suspension de tout effort physique en extérieur.",
      sensitive: "Confinement Sanitaire : Isolement intérieur strict exigé."
    };
  }
  return {
    general: "URGENCE : Éviter absolument toute exposition extérieure.",
    sensitive: "URGENCE : Rester confiné à l'intérieur."
  };
}

export const parseCSV = (file: File): Promise<DailySummary | null> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          if (!data || data.length === 0) {
            resolve(null);
            return;
          }

          const stationsMap = new Map<string, {
            no2: number[]; so2: number[]; co: number[];
            o3: number[]; pm25: number[]; pm10: number[];
          }>();

          const headers = Object.keys(data[0]);
          const stationRegex = /\((.*?)\)/;

          data.forEach(row => {
            if (!row.date) return;

            headers.forEach(header => {
              const match = header.match(stationRegex);
              if (match) {
                const stationName = match[1];
                let value = row[header];
                
                if (typeof value === 'string') value = parseFloat(value);
                if (isNaN(value)) return;
                if (value < 0) value = 0;

                if (!stationsMap.has(stationName)) {
                  stationsMap.set(stationName, { 
                    no2: [], so2: [], co: [], o3: [], pm25: [], pm10: [] 
                  });
                }
                
                const stationData = stationsMap.get(stationName)!;

                if (header.includes("NO2")) stationData.no2.push(value);
                else if (header.includes("SO2")) stationData.so2.push(value);
                else if (header.includes("CO")) stationData.co.push(value);
                else if (header.includes("O3")) stationData.o3.push(value);
                else if (header.includes("PM2.5")) stationData.pm25.push(value);
                else if (header.includes("PM10")) stationData.pm10.push(value);
              }
            });
          });

          // Process each station
          const stationSummaries: StationSummary[] = Array.from(stationsMap.entries()).map(([name, values]) => {
            // Get maximum concentrations for each pollutant (raw sensor values)
            const maxNO2 = values.no2.length ? Math.max(...values.no2) : 0;
            const maxSO2 = values.so2.length ? Math.max(...values.so2) : 0;
            const maxCO = values.co.length ? Math.max(...values.co) : 0;
            const maxO3 = values.o3.length ? Math.max(...values.o3) : 0;
            const maxPM25 = values.pm25.length ? Math.max(...values.pm25) : 0;
            const maxPM10 = values.pm10.length ? Math.max(...values.pm10) : 0;

            // Calculate AQI sub-indices for each pollutant
            const aqiNO2 = calculateSubIndex(maxNO2, 'NO2');
            const aqiSO2 = calculateSubIndex(maxSO2, 'SO2');
            const aqiCO = calculateSubIndex(maxCO, 'CO');
            const aqiO3 = calculateSubIndex(maxO3, 'O3');
            const aqiPM25 = calculateSubIndex(maxPM25, 'PM25');
            const aqiPM10 = calculateSubIndex(maxPM10, 'PM10');

            // Create breakdown object
            const aqiBreakdown = {
              NO2: aqiNO2,
              SO2: aqiSO2,
              CO: aqiCO,
              O3: aqiO3,
              PM25: aqiPM25,
              PM10: aqiPM10
            };

            // The overall AQI is the MAXIMUM of all sub-indices
            const aqi = Math.max(aqiNO2, aqiSO2, aqiCO, aqiO3, aqiPM25, aqiPM10);
            
            // Determine the main pollutant (the one with highest AQI)
            type PollutantKey = keyof typeof BREAKPOINTS;
            const pollutantData: { name: string; aqi: number; rawConc: number; key: PollutantKey }[] = [
              { name: 'NO2', aqi: aqiNO2, rawConc: maxNO2, key: 'NO2' },
              { name: 'SO2', aqi: aqiSO2, rawConc: maxSO2, key: 'SO2' },
              { name: 'CO', aqi: aqiCO, rawConc: maxCO, key: 'CO' },
              { name: 'O3', aqi: aqiO3, rawConc: maxO3, key: 'O3' },
              { name: 'PM2.5', aqi: aqiPM25, rawConc: maxPM25, key: 'PM25' },
              { name: 'PM10', aqi: aqiPM10, rawConc: maxPM10, key: 'PM10' },
            ];
            
            // Sort by AQI descending, then by raw concentration descending (for tie-breaking)
            // This ensures that when multiple pollutants are at AQI=500, 
            // the one with the highest concentration is identified as critical
            pollutantData.sort((a, b) => {
              if (b.aqi !== a.aqi) {
                return b.aqi - a.aqi; // Higher AQI first
              }
              // If AQI is equal (both at 500), compare by how much they exceed their max breakpoint
              // Calculate severity ratio: how many times over the max breakpoint
              const getExceedanceRatio = (conc: number, key: typeof a.key): number => {
                const bps = BREAKPOINTS[key];
                const maxConc = bps[bps.length - 1].cHigh;
                const truncatedConc = truncateForEPA(convertSensorToEPA(conc, key), key);
                return truncatedConc / maxConc; // Ratio of concentration to max breakpoint
              };
              const ratioA = getExceedanceRatio(a.rawConc, a.key);
              const ratioB = getExceedanceRatio(b.rawConc, b.key);
              return ratioB - ratioA; // Higher ratio (more severe) first
            });
            const mainPollutantInfo = pollutantData[0];
            
            // Get truncated concentration in EPA units for display
            const mainPollutantConcentration = getTruncatedInEPAUnits(
              mainPollutantInfo.rawConc, 
              mainPollutantInfo.key
            );
            
            const mainPollutantUnit = POLLUTANT_UNITS[mainPollutantInfo.key];
            
            // Calculate severity ratio for station-level tie-breaking
            // This is how much the main pollutant exceeds its max breakpoint
            const bps = BREAKPOINTS[mainPollutantInfo.key];
            const maxBreakpointConc = bps[bps.length - 1].cHigh;
            const severityRatio = mainPollutantConcentration / maxBreakpointConc;

            return {
              name,
              maxNO2, maxSO2, maxCO, maxO3, maxPM25, maxPM10,
              mainPollutant: mainPollutantInfo.name,
              mainPollutantConcentration,
              mainPollutantUnit,
              aqi,
              severityRatio,
              aqiBreakdown
            };
          });

          // Sort stations by AQI first, then by severity ratio (for tie-breaking when AQI=500)
          // This ensures the station with the most extreme pollution is ranked first
          stationSummaries.sort((a, b) => {
            if (b.aqi !== a.aqi) {
              return b.aqi - a.aqi; // Higher AQI first
            }
            // If AQI is equal (both at 500), compare severity ratios
            return b.severityRatio - a.severityRatio; // Higher severity first
          });

          // Calculate city-level statistics
          const cityAvgAQI = Math.round(
            stationSummaries.reduce((acc, s) => acc + s.aqi, 0) / (stationSummaries.length || 1)
          );

          const cityMaxAQI = Math.max(...stationSummaries.map(s => s.aqi));
          
          // The critical station is now the FIRST one after sorting (highest AQI, then highest severity)
          const criticalStationData = stationSummaries[0];
          const criticalStation = criticalStationData?.name || '';
          const criticalPollutant = criticalStationData?.mainPollutant || 'PM10';
          const criticalConcentration = criticalStationData?.mainPollutantConcentration || 0;
          const criticalUnit = criticalStationData?.mainPollutantUnit || 'µg/m³';
          
          // Extract date from first row
          const dateStr = data[0].date ? data[0].date.split(' ')[0] : new Date().toLocaleDateString('fr-FR');

          resolve({
            date: dateStr,
            stations: stationSummaries,
            cityAverageAQI: cityAvgAQI,
            cityMaxAQI,
            criticalStation,
            criticalPollutant,
            criticalConcentration,
            criticalUnit
          });

        } catch (err) {
          console.error("Error processing data", err);
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};
