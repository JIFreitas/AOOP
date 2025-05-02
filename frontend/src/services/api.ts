import axios from 'axios';
import { Movie } from '../types/MovieTypes';

const API_URL = 'http://localhost:5000/api';

// Interface para o objeto Comment
export interface Comment {
  _id: string;
  movieId: string;
  name: string;
  text: string;
  rating: number;
  date: string;
}

// Funções para interagir com a API de filmes
export const fetchMovies = async (): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/movies`);
        return response.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const fetchMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const response = await axios.get(`${API_URL}/movies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie ${id}:`, error);
    return null;
  }
};

// Funções para interagir com a API de comentários
export const fetchCommentsByMovieId = async (movieId: string): Promise<Comment[]> => {
  try {
    const response = await axios.get(`${API_URL}/comments/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for movie ${movieId}:`, error);
    return [];
  }
};

export const addComment = async (comment: Omit<Comment, '_id' | 'date'>): Promise<Comment | null> => {
  try {
    const response = await axios.post(`${API_URL}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};