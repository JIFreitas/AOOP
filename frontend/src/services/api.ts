import axios from 'axios';
import { Movie } from '../types/MovieTypes';
import { handleApiError, handleAndNotifyError } from './errorHandler';

const API_URL = 'http://localhost:5000/api';

export interface Comment {
  _id: string;
  name: string;
  email?: string;
  movie_id: string;
  text: string;
  rating?: number;
  date: string;
}

export interface NewComment {
  name: string;
  email?: string;
  movie_id: string;
  text: string;
  rating?: number;
}

export interface PaginatedResponse<T> {
  movies: T[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export enum SortOption {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  YEAR_ASC = 'year_asc',
  YEAR_DESC = 'year_desc',
  RATING_ASC = 'rating_asc',
  RATING_DESC = 'rating_desc'
}

export interface MovieFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: SortOption;
}

export const fetchMovies = async (params: MovieFilterParams = {}): Promise<PaginatedResponse<Movie>> => {
  const { page = 1, limit = 20, search = '', genre = '', sort = SortOption.TITLE_ASC } = params;
  try {
    const response = await axios.get(`${API_URL}/movies`, {
      params: {
        page,
        limit,
        search,
        genre,
        sort
      }
    });
    return response.data;
  } catch (error) {
    handleAndNotifyError(error);
    return {
      movies: [],
      totalPages: 0,
      currentPage: page,
      total: 0
    };
  }
};

export const fetchMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const response = await axios.get(`${API_URL}/movies/${id}`);
    return response.data;
  } catch (error) {
    handleAndNotifyError(error);
    return null;
  }
};

export const fetchGenres = async (): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/movies/genres`);
    return response.data;
  } catch (error) {
    handleAndNotifyError(error);
    return [];
  }
};

export const fetchCommentsByMovieId = async (movieId: string): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${API_URL}/comments/movie/${movieId}`);
    return response.data;
  } catch (error) {
    handleAndNotifyError(error);
    return [];
  }
};

export const addComment = async (comment: NewComment): Promise<Comment | null> => {
  try {
    const response = await axios.post(`${API_URL}/comments`, comment);
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
};