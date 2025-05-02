export interface RatingStats {
  rating: number;
  numReviews: number;
  meter?: number;
}

export interface TomatoesRating {
  website?: string;
  viewer: RatingStats;
  dvd?: string;
  critic: RatingStats;
  boxOffice?: string;
  consensus?: string;
  rotten?: number;
  production?: string;
  lastUpdated: string;
  fresh?: number;
}