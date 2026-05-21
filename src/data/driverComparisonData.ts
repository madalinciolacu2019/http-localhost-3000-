export interface DriverStats {
  id: string;
  name: string;
  era: string;
  titles: number;
  wins: number;
  poles: number;
  podiums: number;
  winPercentage: number;
  image: string;
  team: string;
  color: string;
}

export const driverData: DriverStats[] = [
  {
    id: 'senna',
    name: 'Ayrton Senna',
    era: '1984-1994',
    titles: 3,
    wins: 41,
    poles: 65,
    podiums: 80,
    winPercentage: 25.5,
    team: 'McLaren Honda',
    color: '#fef100',
    image: '/assets/drivers/senna.png'
  },
  {
    id: 'schumacher',
    name: 'Michael Schumacher',
    era: '1991-2012',
    titles: 7,
    wins: 91,
    poles: 68,
    podiums: 155,
    winPercentage: 29.7,
    team: 'Scuderia Ferrari',
    color: '#E10600',
    image: '/assets/drivers/schumacher.png'
  },
  {
    id: 'verstappen',
    name: 'Max Verstappen',
    era: '2015-Present',
    titles: 4,
    wins: 71,
    poles: 48,
    podiums: 111,
    winPercentage: 33.6,
    team: 'Red Bull Racing',
    color: '#0600EF',
    image: '/assets/drivers/verstappen.png'
  },
  {
    id: 'hamilton',
    name: 'Lewis Hamilton',
    era: '2007-Present',
    titles: 7,
    wins: 105,
    poles: 104,
    podiums: 201,
    winPercentage: 30.2,
    team: 'Mercedes-AMG / Ferrari',
    color: '#00D2BE',
    image: '/assets/drivers/hamilton.png'
  },
  {
    id: 'leclerc',
    name: 'Charles Leclerc',
    era: '2018-Present',
    titles: 0,
    wins: 8,
    poles: 27,
    podiums: 42,
    winPercentage: 5.6,
    team: 'Scuderia Ferrari',
    color: '#FF1801',
    image: '/assets/drivers/leclerc.png'
  },
  {
    id: 'norris',
    name: 'Lando Norris',
    era: '2019-Present',
    titles: 0,
    wins: 11,
    poles: 16,
    podiums: 30,
    winPercentage: 8.8,
    team: 'McLaren',
    color: '#FF8700',
    image: '/assets/drivers/norris.png'
  },
  {
    id: 'alonso',
    name: 'Fernando Alonso',
    era: '2001-Present',
    titles: 2,
    wins: 32,
    poles: 22,
    podiums: 106,
    winPercentage: 8.2,
    team: 'Aston Martin',
    color: '#006F62',
    image: '/assets/drivers/alonso.png'
  }
];
