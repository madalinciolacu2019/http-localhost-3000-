export interface F1Race {
  round: number;
  name: string;
  location: string;
  track: string;
  startDate: string; // "YYYY-MM-DD" (usually Friday, or Wednesday/Thursday for special schedules)
  endDate: string;   // "YYYY-MM-DD" (usually Sunday, or Saturday for special schedules)
  streamUrl: string;
  airTemp: number;
  trackTemp: number;
  humidity: number;
  chanceOfRain: number;
  fastestLap: string;
  isNightRace?: boolean;
}

export const f1Races: F1Race[] = [
  {
    round: 1,
    name: "Australian Grand Prix",
    location: "Melbourne, Australia",
    track: "Albert Park Circuit",
    startDate: "2026-03-06",
    endDate: "2026-03-08",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 24,
    trackTemp: 38,
    humidity: 50,
    chanceOfRain: 20,
    fastestLap: "1:20.123 (LEC)"
  },
  {
    round: 2,
    name: "Chinese Grand Prix",
    location: "Shanghai, China",
    track: "Shanghai International Circuit",
    startDate: "2026-03-13",
    endDate: "2026-03-15",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 16,
    trackTemp: 22,
    humidity: 75,
    chanceOfRain: 60,
    fastestLap: "1:34.982 (HAM)"
  },
  {
    round: 3,
    name: "Japanese Grand Prix",
    location: "Suzuka, Japan",
    track: "Suzuka International Racing Course",
    startDate: "2026-03-27",
    endDate: "2026-03-29",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 19,
    trackTemp: 28,
    humidity: 60,
    chanceOfRain: 30,
    fastestLap: "1:30.551 (VER)"
  },
  {
    round: 4,
    name: "Bahrain Grand Prix",
    location: "Sakhir, Bahrain",
    track: "Bahrain International Circuit",
    startDate: "2026-04-10",
    endDate: "2026-04-12",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 29,
    trackTemp: 42,
    humidity: 30,
    chanceOfRain: 0,
    fastestLap: "1:32.114 (NOR)",
    isNightRace: true
  },
  {
    round: 5,
    name: "Saudi Arabian Grand Prix",
    location: "Jeddah, Saudi Arabia",
    track: "Jeddah Corniche Circuit",
    startDate: "2026-04-17",
    endDate: "2026-04-19",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 31,
    trackTemp: 39,
    humidity: 40,
    chanceOfRain: 0,
    fastestLap: "1:30.824 (RUS)",
    isNightRace: true
  },
  {
    round: 6,
    name: "Miami Grand Prix",
    location: "Miami, United States",
    track: "Miami International Autodrome",
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 28,
    trackTemp: 45,
    humidity: 65,
    chanceOfRain: 40,
    fastestLap: "1:29.332 (VER)"
  },
  {
    round: 7,
    name: "Canadian Grand Prix",
    location: "Montreal, Canada",
    track: "Circuit Gilles Villeneuve",
    startDate: "2026-05-22",
    endDate: "2026-05-24",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 18,
    trackTemp: 26,
    humidity: 55,
    chanceOfRain: 15,
    fastestLap: "1:13.442 (PIA)"
  },
  {
    round: 8,
    name: "Monaco Grand Prix",
    location: "Monte Carlo, Monaco",
    track: "Circuit de Monaco",
    startDate: "2026-06-05",
    endDate: "2026-06-07",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 22,
    trackTemp: 34,
    humidity: 45,
    chanceOfRain: 10,
    fastestLap: "1:12.981 (LEC)"
  },
  {
    round: 9,
    name: "Spanish Grand Prix",
    location: "Barcelona, Spain",
    track: "Circuit de Barcelona-Catalunya",
    startDate: "2026-06-12",
    endDate: "2026-06-14",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 26,
    trackTemp: 41,
    humidity: 50,
    chanceOfRain: 5,
    fastestLap: "1:16.892 (VER)"
  },
  {
    round: 10,
    name: "Austrian Grand Prix",
    location: "Spielberg, Austria",
    track: "Red Bull Ring",
    startDate: "2026-06-26",
    endDate: "2026-06-28",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 23,
    trackTemp: 36,
    humidity: 40,
    chanceOfRain: 25,
    fastestLap: "1:07.452 (NOR)"
  },
  {
    round: 11,
    name: "British Grand Prix",
    location: "Silverstone, Great Britain",
    track: "Silverstone Circuit",
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 20,
    trackTemp: 28,
    humidity: 70,
    chanceOfRain: 50,
    fastestLap: "1:28.990 (HAM)"
  },
  {
    round: 12,
    name: "Belgian Grand Prix",
    location: "Spa-Francorchamps, Belgium",
    track: "Circuit de Spa-Francorchamps",
    startDate: "2026-07-17",
    endDate: "2026-07-19",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 17,
    trackTemp: 22,
    humidity: 80,
    chanceOfRain: 80,
    fastestLap: "1:46.223 (VER)"
  },
  {
    round: 13,
    name: "Hungarian Grand Prix",
    location: "Mogyoród, Hungary",
    track: "Hungaroring",
    startDate: "2026-07-24",
    endDate: "2026-07-26",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 32,
    trackTemp: 52,
    humidity: 35,
    chanceOfRain: 10,
    fastestLap: "1:18.520 (LEC)"
  },
  {
    round: 14,
    name: "Dutch Grand Prix",
    location: "Zandvoort, Netherlands",
    track: "Circuit Zandvoort",
    startDate: "2026-08-21",
    endDate: "2026-08-23",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 21,
    trackTemp: 30,
    humidity: 60,
    chanceOfRain: 35,
    fastestLap: "1:12.003 (NOR)"
  },
  {
    round: 15,
    name: "Italian Grand Prix",
    location: "Monza, Italy",
    track: "Autodromo Nazionale Monza",
    startDate: "2026-09-04",
    endDate: "2026-09-06",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 28,
    trackTemp: 44,
    humidity: 45,
    chanceOfRain: 5,
    fastestLap: "1:21.042 (HAM)"
  },
  {
    round: 16,
    name: "Madrid Grand Prix",
    location: "Madrid, Spain",
    track: "Madrid Street Circuit",
    startDate: "2026-09-11",
    endDate: "2026-09-13",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 25,
    trackTemp: 38,
    humidity: 40,
    chanceOfRain: 10,
    fastestLap: "1:19.456 (RUS)"
  },
  {
    round: 17,
    name: "Azerbaijan Grand Prix",
    location: "Baku, Azerbaijan",
    track: "Baku City Circuit",
    startDate: "2026-09-24", // Starts Thursday
    endDate: "2026-09-26",   // Ends Saturday
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 23,
    trackTemp: 33,
    humidity: 50,
    chanceOfRain: 15,
    fastestLap: "1:43.004 (LEC)"
  },
  {
    round: 18,
    name: "Singapore Grand Prix",
    location: "Marina Bay, Singapore",
    track: "Marina Bay Street Circuit",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 30,
    trackTemp: 36,
    humidity: 85,
    chanceOfRain: 45,
    fastestLap: "1:36.230 (NOR)",
    isNightRace: true
  },
  {
    round: 19,
    name: "United States Grand Prix",
    location: "Austin, United States",
    track: "Circuit of the Americas",
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 24,
    trackTemp: 35,
    humidity: 45,
    chanceOfRain: 20,
    fastestLap: "1:37.452 (VER)"
  },
  {
    round: 20,
    name: "Mexican Grand Prix",
    location: "Mexico City, Mexico",
    track: "Autódromo Hermanos Rodríguez",
    startDate: "2026-10-30",
    endDate: "2026-11-01",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 22,
    trackTemp: 37,
    humidity: 35,
    chanceOfRain: 10,
    fastestLap: "1:18.991 (PIA)"
  },
  {
    round: 21,
    name: "São Paulo Grand Prix",
    location: "São Paulo, Brazil",
    track: "Autódromo José Carlos Pace (Interlagos)",
    startDate: "2026-11-06",
    endDate: "2026-11-08",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 23,
    trackTemp: 32,
    humidity: 70,
    chanceOfRain: 60,
    fastestLap: "1:10.824 (VER)"
  },
  {
    round: 22,
    name: "Las Vegas Grand Prix",
    location: "Las Vegas, United States",
    track: "Las Vegas Strip Circuit",
    startDate: "2026-11-19", // Starts Thursday
    endDate: "2026-11-21",   // Ends Saturday
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 14,
    trackTemp: 18,
    humidity: 30,
    chanceOfRain: 5,
    fastestLap: "1:34.909 (NOR)",
    isNightRace: true
  },
  {
    round: 23,
    name: "Qatar Grand Prix",
    location: "Lusail, Qatar",
    track: "Lusail International Circuit",
    startDate: "2026-11-27",
    endDate: "2026-11-29",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 27,
    trackTemp: 35,
    humidity: 50,
    chanceOfRain: 0,
    fastestLap: "1:24.331 (VER)",
    isNightRace: true
  },
  {
    round: 24,
    name: "Abu Dhabi Grand Prix",
    location: "Yas Island, Abu Dhabi",
    track: "Yas Marina Circuit",
    startDate: "2026-12-04",
    endDate: "2026-12-06",
    streamUrl: "https://f1tv.formula1.com/",
    airTemp: 26,
    trackTemp: 31,
    humidity: 55,
    chanceOfRain: 0,
    fastestLap: "1:26.111 (LEC)",
    isNightRace: true
  }
];

export const parseLocalDate = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds);
};

export const getActiveRace = (now: Date = new Date()): F1Race | null => {
  for (const race of f1Races) {
    const start = parseLocalDate(race.startDate, "00:00:00");
    const end = parseLocalDate(race.endDate, "23:59:59");
    if (now >= start && now <= end) {
      return race;
    }
  }
  return null;
};

export const getNextRace = (now: Date = new Date()): F1Race | null => {
  const sorted = [...f1Races].sort((a, b) => {
    return parseLocalDate(a.startDate, "00:00:00").getTime() - parseLocalDate(b.startDate, "00:00:00").getTime();
  });
  
  for (const race of sorted) {
    const start = parseLocalDate(race.startDate, "00:00:00");
    if (start > now) {
      return race;
    }
  }
  return null;
};
