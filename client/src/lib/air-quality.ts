import Papa from 'papaparse';

export interface AirQualityRecord {
  timestamp: string;
  date: Date;
  stations: {
    [stationName: string]: {
      NO2: number;
      SO2: number;
      CO: number;
    };
  };
}

export interface DailySummary {
  date: string;
  stations: {
    name: string;
    maxNO2: number;
    maxSO2: number;
    maxCO: number;
    avgNO2: number;
    avgSO2: number;
    avgCO: number;
    mainPollutant: 'NO2' | 'SO2' | 'CO';
    aqi: number; // Simplified max index
  }[];
  cityAverageAQI: number;
}

// Simplified AQI breakpoints (Generic/EPA-ish for demo purposes)
// Using ppb for all
const BREAKPOINTS = {
  NO2: [
    { max: 53, aqiMax: 50 },
    { max: 100, aqiMax: 100 },
    { max: 360, aqiMax: 150 },
    { max: 649, aqiMax: 200 },
    { max: 1249, aqiMax: 300 },
    { max: 2049, aqiMax: 500 },
  ],
  SO2: [
    { max: 35, aqiMax: 50 },
    { max: 75, aqiMax: 100 },
    { max: 185, aqiMax: 150 },
    { max: 304, aqiMax: 200 },
    { max: 604, aqiMax: 300 },
    { max: 1004, aqiMax: 500 },
  ],
  CO: [ // converted from ppm to ppb roughly (1 ppm = 1000 ppb)
    { max: 4400, aqiMax: 50 },
    { max: 9400, aqiMax: 100 },
    { max: 12400, aqiMax: 150 },
    { max: 15400, aqiMax: 200 },
    { max: 30400, aqiMax: 300 },
    { max: 50400, aqiMax: 500 },
  ],
};

function calculateSubIndex(conc: number, pollutant: 'NO2' | 'SO2' | 'CO'): number {
  const breakpoints = BREAKPOINTS[pollutant];
  let i = 0;
  let bpLow = 0;
  let aqiLow = 0;
  
  while (i < breakpoints.length) {
    const bp = breakpoints[i];
    if (conc <= bp.max) {
      const aqiRange = bp.aqiMax - aqiLow;
      const concRange = bp.max - bpLow;
      return Math.round(((aqiRange * (conc - bpLow)) / concRange) + aqiLow);
    }
    bpLow = bp.max + 0.01; // approximate next step
    aqiLow = bp.aqiMax + 1;
    i++;
  }
  return 500; // Off chart
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "hsl(150 60% 45%)"; // Good - Green
  if (aqi <= 100) return "hsl(45 90% 55%)"; // Moderate - Yellow
  if (aqi <= 150) return "hsl(30 90% 60%)"; // Unhealthy for Sensitive - Orange
  if (aqi <= 200) return "hsl(0 70% 60%)"; // Unhealthy - Red
  if (aqi <= 300) return "hsl(280 50% 50%)"; // Very Unhealthy - Purple
  return "hsl(300 40% 30%)"; // Hazardous - Maroon
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return "Bonne";
  if (aqi <= 100) return "Modérée";
  if (aqi <= 150) return "Mauvaise pour les sensibles";
  if (aqi <= 200) return "Mauvaise";
  if (aqi <= 300) return "Très Mauvaise";
  return "Dangereuse";
}

export const parseCSV = (file: File): Promise<DailySummary | null> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true, // tries to convert numbers
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          if (!data || data.length === 0) {
            resolve(null);
            return;
          }

          // Map columns to cleaner structure
          // The CSV headers are complex like "NO2 quantity[ppb] (ML_BKO_Qualité_Air_1)"
          // We need to extract station names and pollutant types.
          
          const stationsMap = new Map<string, {
            no2: number[];
            so2: number[];
            co: number[];
          }>();

          const headers = Object.keys(data[0]);
          
          // Identify stations
          // Regex to find station name inside parentheses
          const stationRegex = /\((.*?)\)/;

          data.forEach(row => {
            if (!row.date) return;

            headers.forEach(header => {
              const match = header.match(stationRegex);
              if (match) {
                const stationName = match[1];
                const value = row[header];
                
                // Handle parsing issues (sometimes "Empty" or strings in CSV)
                const numValue = typeof value === 'number' ? value : parseFloat(value);
                if (isNaN(numValue)) return;

                if (!stationsMap.has(stationName)) {
                  stationsMap.set(stationName, { no2: [], so2: [], co: [] });
                }
                
                const stationData = stationsMap.get(stationName)!;

                if (header.includes("NO2")) stationData.no2.push(numValue);
                else if (header.includes("SO2")) stationData.so2.push(numValue);
                else if (header.includes("CO")) stationData.co.push(numValue);
              }
            });
          });

          // Calculate daily stats
          const stationSummaries = Array.from(stationsMap.entries()).map(([name, values]) => {
            const maxNO2 = Math.max(...values.no2, 0);
            const maxSO2 = Math.max(...values.so2, 0);
            const maxCO = Math.max(...values.co, 0);

            const avgNO2 = values.no2.reduce((a,b)=>a+b,0) / (values.no2.length || 1);
            const avgSO2 = values.so2.reduce((a,b)=>a+b,0) / (values.so2.length || 1);
            const avgCO = values.co.reduce((a,b)=>a+b,0) / (values.co.length || 1);

            // Calculate AQI based on MAX values (standard practice is max hourly or 8hr avg, using max hourly for simplified prototype)
            const aqiNO2 = calculateSubIndex(maxNO2, 'NO2');
            const aqiSO2 = calculateSubIndex(maxSO2, 'SO2');
            const aqiCO = calculateSubIndex(maxCO, 'CO');

            const aqi = Math.max(aqiNO2, aqiSO2, aqiCO);
            let mainPollutant: 'NO2' | 'SO2' | 'CO' = 'NO2';
            if (aqiSO2 >= aqiNO2 && aqiSO2 >= aqiCO) mainPollutant = 'SO2';
            if (aqiCO >= aqiNO2 && aqiCO >= aqiSO2) mainPollutant = 'CO';

            return {
              name,
              maxNO2, maxSO2, maxCO,
              avgNO2, avgSO2, avgCO,
              mainPollutant,
              aqi
            };
          });

          const cityAvgAQI = Math.round(
            stationSummaries.reduce((acc, s) => acc + s.aqi, 0) / (stationSummaries.length || 1)
          );
          
          // Get date from first row
          const dateStr = data[0].date ? data[0].date.split(' ')[0] : new Date().toLocaleDateString();

          resolve({
            date: dateStr,
            stations: stationSummaries,
            cityAverageAQI: cityAvgAQI
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
