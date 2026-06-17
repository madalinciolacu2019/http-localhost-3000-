import { NextResponse } from 'next/server';

// Note: In a production app, we would fetch from a real weather API (e.g., OpenWeatherMap)
// using the track coordinates (e.g. Silverstone, Monza).
// Here, we simulate the F1 track weather for the feature.
export async function GET() {
  // Simulate a 30% chance of rain (Full Wet conditions)
  const isRaining = Math.random() < 0.3;
  
  return NextResponse.json({
    track: 'Silverstone',
    condition: isRaining ? 'Rain' : 'Dry',
    temperature: isRaining ? '18°C' : '28°C',
    discountActive: isRaining,
    discountPercentage: isRaining ? 15 : 0
  });
}
