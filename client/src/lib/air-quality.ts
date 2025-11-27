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
    aqi: number;
  }[];
  cityAverageAQI: number;
  cityMaxAQI: number;
}

// AQI Breakpoints (US EPA Standard for 1-hour where applicable or approximation)
// Units in the CSV appear to be ppb.
const BREAKPOINTS = {
  NO2: [ // 1-hour NO2 (ppb)
    { max: 53, aqiMax: 50 },
    { max: 100, aqiMax: 100 },
    { max: 360, aqiMax: 150 },
    { max: 649, aqiMax: 200 },
    { max: 1249, aqiMax: 300 },
    { max: 2049, aqiMax: 500 },
  ],
  SO2: [ // 1-hour SO2 (ppb)
    { max: 75, aqiMax: 50 },
    { max: 185, aqiMax: 100 },
    { max: 304, aqiMax: 150 },
    { max: 604, aqiMax: 200 },
    { max: 804, aqiMax: 300 }, // Adjusted for 1h
    { max: 1004, aqiMax: 500 },
  ],
  CO: [ // 8-hour CO (ppm) converted to ppb (x1000) approx
    { max: 4400, aqiMax: 50 },
    { max: 9400, aqiMax: 100 },
    { max: 12400, aqiMax: 150 },
    { max: 15400, aqiMax: 200 },
    { max: 30400, aqiMax: 300 },
    { max: 50400, aqiMax: 500 },
  ],
};

function calculateSubIndex(conc: number, pollutant: 'NO2' | 'SO2' | 'CO'): number {
  if (conc < 0) conc = 0; // Clamp negative values
  
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
    bpLow = bp.max + 0.01;
    aqiLow = bp.aqiMax + 1;
    i++;
  }
  return 500;
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return "Bonne";
  if (aqi <= 100) return "Modérée";
  if (aqi <= 150) return "Médiocre"; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return "Mauvaise"; // Unhealthy
  if (aqi <= 300) return "Très Mauvaise";
  return "Dangereuse";
}

export function getHealthAdvice(aqi: number) {
  if (aqi <= 50) {
    return {
      general: "La qualité de l'air est satisfaisante et ne présente que peu ou pas de risques.",
      sensitive: "Aucune mesure particulière nécessaire."
    };
  }
  if (aqi <= 100) {
    return {
      general: "La qualité de l'air est acceptable.",
      sensitive: "Les personnes inhabituellement sensibles devraient envisager de réduire les efforts prolongés en extérieur."
    };
  }
  if (aqi <= 150) {
    return {
      general: "Le grand public n'est probablement pas affecté.",
      sensitive: "Les personnes sensibles (enfants, asthmatiques) doivent réduire les exercices intenses en plein air."
    };
  }
  if (aqi <= 200) {
    return {
      general: "Tout le monde peut commencer à ressentir des effets sur la santé.",
      sensitive: "Évitez toute activité physique intense en extérieur."
    };
  }
  return {
    general: "Alerte sanitaire : risque d'effets graves pour tous.",
    sensitive: "Restez à l'intérieur et évitez toute activité physique."
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
            no2: number[];
            so2: number[];
            co: number[];
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
                
                // Clean Data: Handle strings, empty, or negative values
                if (typeof value === 'string') {
                  value = parseFloat(value);
                }
                
                // Skip NaNs
                if (isNaN(value)) return;

                // Clamp negative sensor readings to 0 for calculations
                if (value < 0) value = 0;

                if (!stationsMap.has(stationName)) {
                  stationsMap.set(stationName, { no2: [], so2: [], co: [] });
                }
                
                const stationData = stationsMap.get(stationName)!;

                if (header.includes("NO2")) stationData.no2.push(value);
                else if (header.includes("SO2")) stationData.so2.push(value);
                else if (header.includes("CO")) stationData.co.push(value);
              }
            });
          });

          const stationSummaries = Array.from(stationsMap.entries()).map(([name, values]) => {
            // Calculation Rule: 
            // For "Bulletin Quotidien", we often look at the worst hour (Max) or the daily average.
            // To be safe/conservative for public health, we use the MAX hourly value observed.
            
            const maxNO2 = values.no2.length ? Math.max(...values.no2) : 0;
            const maxSO2 = values.so2.length ? Math.max(...values.so2) : 0;
            const maxCO = values.co.length ? Math.max(...values.co) : 0;

            const avgNO2 = values.no2.length ? values.no2.reduce((a,b)=>a+b,0)/values.no2.length : 0;
            const avgSO2 = values.so2.length ? values.so2.reduce((a,b)=>a+b,0)/values.so2.length : 0;
            const avgCO = values.co.length ? values.co.reduce((a,b)=>a+b,0)/values.co.length : 0;

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

          // City average AQI (Average of station AQIs)
          const cityAvgAQI = Math.round(
            stationSummaries.reduce((acc, s) => acc + s.aqi, 0) / (stationSummaries.length || 1)
          );

          // City Max AQI (Worst station)
          const cityMaxAQI = Math.max(...stationSummaries.map(s => s.aqi));
          
          const dateStr = data[0].date ? data[0].date.split(' ')[0] : new Date().toLocaleDateString();

          resolve({
            date: dateStr,
            stations: stationSummaries,
            cityAverageAQI: cityAvgAQI,
            cityMaxAQI
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
