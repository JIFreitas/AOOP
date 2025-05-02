import { ImdbRating } from './ImdbTypes';
import { TomatoesRating } from './TomatoesTypes';
import { Awards } from './AwardsTypes';

export interface Movie {
  _id: string;
  title: string;
  plot: string;
  fullplot?: string;
  type: string;
  year: number;
  runtime?: number;
  released?: string;
  poster?: string;
  genres: string[];
  imdb?: ImdbRating;
  tomatoes?: TomatoesRating;
  metacritic?: number;
  awards?: Awards;
  countries?: string[];
  languages?: string[];
  directors?: string[];
  cast?: string[];
  num_mflix_comments?: number;
  lastupdated?: string;
}