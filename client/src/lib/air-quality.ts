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
  aqi: number;
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
}

// EPA AQI Breakpoints - Updated May 2024
// Reference: https://document.airnow.gov/technical-assistance-document-for-the-reporting-of-daily-air-quailty.pdf
//
// IMPORTANT: Input units from Pulsonic/air quality sensors:
// - NO2, SO2: ppb (standard for AQ sensors)
// - CO: ppb (sensors typically report ppb, EPA uses ppm - we convert internally)
// - O3: ppb (sensors typically report ppb, EPA uses ppm - we convert internally)
// - PM2.5, PM10: µg/m³ (standard)
//
// Breakpoints below are in the SENSOR UNITS (ppb for gases except PM)

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
  // CO: 8-hour average - CONVERTED TO PPB (EPA ppm * 1000)
  // EPA uses ppm: 0-4.4, 4.5-9.4, 9.5-12.4, 12.5-15.4, 15.5-30.4, 30.5-50.4
  // In ppb: 0-4400, 4500-9400, 9500-12400, 12500-15400, 15500-30400, 30500-50400
  // Truncate to integer (ppb)
  CO: [
    { cLow: 0, cHigh: 4400, iLow: 0, iHigh: 50 },
    { cLow: 4500, cHigh: 9400, iLow: 51, iHigh: 100 },
    { cLow: 9500, cHigh: 12400, iLow: 101, iHigh: 150 },
    { cLow: 12500, cHigh: 15400, iLow: 151, iHigh: 200 },
    { cLow: 15500, cHigh: 30400, iLow: 201, iHigh: 300 },
    { cLow: 30500, cHigh: 50400, iLow: 301, iHigh: 500 },
  ],
  // O3: 8-hour average - CONVERTED TO PPB (EPA ppm * 1000)
  // EPA uses ppm: 0-0.054, 0.055-0.070, 0.071-0.085, 0.086-0.105, 0.106-0.200, 0.201-0.604
  // In ppb: 0-54, 55-70, 71-85, 86-105, 106-200, 201-604
  // Truncate to integer (ppb)
  O3: [
    { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
    { cLow: 55, cHigh: 70, iLow: 51, iHigh: 100 },
    { cLow: 71, cHigh: 85, iLow: 101, iHigh: 150 },
    { cLow: 86, cHigh: 105, iLow: 151, iHigh: 200 },
    { cLow: 106, cHigh: 200, iLow: 201, iHigh: 300 },
    { cLow: 201, cHigh: 604, iLow: 301, iHigh: 500 },
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

// EPA Truncation Rules - adapted for ppb input
function truncateConcentration(value: number, pollutant: keyof typeof BREAKPOINTS): number {
  if (value < 0) return 0;
  
  switch (pollutant) {
    case 'PM25':
      // Truncate to 1 decimal place
      return Math.floor(value * 10) / 10;
    case 'PM10':
    case 'NO2':
    case 'SO2':
    case 'CO':
    case 'O3':
      // Truncate to integer (all gas pollutants in ppb)
      return Math.floor(value);
    default:
      return Math.floor(value);
  }
}

// EPA AQI Formula: I = [(I_high - I_low) / (C_high - C_low)] * (C - C_low) + I_low
function calculateSubIndex(rawConcentration: number, pollutant: keyof typeof BREAKPOINTS): number {
  // Truncate per EPA rules
  const truncatedConc = truncateConcentration(rawConcentration, pollutant);
  
  if (truncatedConc < 0) return 0;
  
  const breakpoints = BREAKPOINTS[pollutant];
  
  // Find the appropriate breakpoint range
  for (const bp of breakpoints) {
    if (truncatedConc >= bp.cLow && truncatedConc <= bp.cHigh) {
      // Apply EPA formula
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (truncatedConc - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }
  
  // If concentration exceeds highest breakpoint, extrapolate
  const lastBp = breakpoints[breakpoints.length - 1];
  if (truncatedConc > lastBp.cHigh) {
    const slope = (lastBp.iHigh - lastBp.iLow) / (lastBp.cHigh - lastBp.cLow);
    const extrapolated = lastBp.iHigh + slope * (truncatedConc - lastBp.cHigh);
    return Math.round(Math.min(extrapolated, 999));
  }
  
  return 0;
}

// Get the truncated concentration used for AQI (for display consistency)
function getTruncatedForDisplay(rawValue: number, pollutant: keyof typeof BREAKPOINTS): number {
  return truncateConcentration(rawValue, pollutant);
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
            // Get maximum concentrations for each pollutant (raw values from CSV)
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
            
            // Sort by AQI descending to find the main pollutant
            pollutantData.sort((a, b) => b.aqi - a.aqi);
            const mainPollutantInfo = pollutantData[0];
            
            // Use truncated concentration for display consistency
            const mainPollutantConcentration = getTruncatedForDisplay(
              mainPollutantInfo.rawConc, 
              mainPollutantInfo.key
            );

            return {
              name,
              maxNO2, maxSO2, maxCO, maxO3, maxPM25, maxPM10,
              mainPollutant: mainPollutantInfo.name,
              mainPollutantConcentration,
              aqi,
              aqiBreakdown
            };
          });

          // Sort stations by AQI (highest first) for consistent display
          stationSummaries.sort((a, b) => b.aqi - a.aqi);

          // Calculate city-level statistics
          const cityAvgAQI = Math.round(
            stationSummaries.reduce((acc, s) => acc + s.aqi, 0) / (stationSummaries.length || 1)
          );

          const cityMaxAQI = Math.max(...stationSummaries.map(s => s.aqi));
          
          // Find the critical station (the one with maximum AQI)
          const criticalStationData = stationSummaries.find(s => s.aqi === cityMaxAQI);
          const criticalStation = criticalStationData?.name || '';
          const criticalPollutant = criticalStationData?.mainPollutant || 'PM10';
          const criticalConcentration = criticalStationData?.mainPollutantConcentration || 0;
          
          // Extract date from first row
          const dateStr = data[0].date ? data[0].date.split(' ')[0] : new Date().toLocaleDateString('fr-FR');

          resolve({
            date: dateStr,
            stations: stationSummaries,
            cityAverageAQI: cityAvgAQI,
            cityMaxAQI,
            criticalStation,
            criticalPollutant,
            criticalConcentration
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
