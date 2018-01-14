import axios from 'axios';
import * as types from '../../constants/actionTypes';
import { TMDB_URL, TMDB_API_KEY } from '../../constants/api';
import {AsyncStorage} from 'react-native'
import { TOGGLE_FAVORITE } from '../../constants/actionTypes';
import * as movieListTypes from '../../constants/movieListTypes';

// GENRES
export function retrieveMoviesGenresSuccess(res) {
	return {
		type: types.RETRIEVE_MOVIES_GENRES_SUCCESS,
		moviesGenres: res.data
	};
}

export function retrieveMoviesGenres() {
	return function (dispatch) {
		return axios.get(`${TMDB_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`)
		.then(res => {
			dispatch(retrieveMoviesGenresSuccess(res));
		})
		.catch(error => {
			console.log(error); //eslint-disable-line
		});
	};
}

// POPULAR
export function retrievePopularMoviesSuccess(res) {
	return {
		type: types.RETRIEVE_POPULAR_MOVIES_SUCCESS,
		popularMovies: res.data
	};
}

//watchlist
export function retrieveWatchlistSuccess(res) {
	return {
		type: types.RETRIEVE_WATCHLIST_SUCCESS,
		watchlist: res
	};
}

export function retrievePopularMovies(page) {
	return function (dispatch) {
		return axios.get(`${TMDB_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`)
		.then(res => {
			dispatch(retrievePopularMoviesSuccess(res));
		})
		.catch(error => {
			console.log('Popular', error); //eslint-disable-line
		});
	};
}

// NOW PLAYING
export function retrieveNowPlayingMoviesSuccess(res) {
	return {
		type: types.RETRIEVE_NOWPLAYING_MOVIES_SUCCESS,
		nowPlayingMovies: res.data
	};
}

export function retrieveNowPlayingMovies(page) {
	return function (dispatch) {
		return axios.get(`${TMDB_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`)
		.then(res => {
			dispatch(retrieveNowPlayingMoviesSuccess(res));
		})
		.catch(error => {
			console.log('Now Playing', error); //eslint-disable-line
		});
	};
}

// MOVIES LIST
export function retrieveMoviesListSuccess(res) {
	return {
		type: types.RETRIEVE_MOVIES_LIST_SUCCESS,
		list: res.data
	};
}

export function retrieveMoviesList(type, page) {
	return function (dispatch) {
		switch(type) {
			case movieListTypes.WATCHLIST:
			return getMoviesFromWatchlist().then(list => {
				dispatch(retrieveWatchlistSuccess(list))
			})
			.catch(error => {
				console.log('Movies List', error); //eslint-disable-line
			})
			break;
			default:
			return axios.get(`${TMDB_URL}/movie/${type}?api_key=${TMDB_API_KEY}&page=${page}`)
			.then(res => {
				dispatch(retrieveMoviesListSuccess(res));
			})
			.catch(error => {
				console.log('Movies List', error); //eslint-disable-line
			});
				break;

		}


		
	};
}

// SEARCH RESULTS
export function retrieveMoviesSearchResultsSuccess(res) {
	return {
		type: types.RETRIEVE_MOVIES_SEARCH_RESULT_SUCCESS,
		searchResults: res.data
	};
}

export function retrieveMoviesSearchResults(query, page) {
	return function (dispatch) {
		return axios.get(`${TMDB_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`)
		.then(res => {
			dispatch(retrieveMoviesSearchResultsSuccess(res));
		})
		.catch(error => {
			console.log('Movies Search Results', error); //eslint-disable-line
		});
	};
}

// MOVIE DETAILS
export function retrieveMovieDetailsSuccess(res) {
	return {
		type: types.RETRIEVE_MOVIE_DETAILS_SUCCESS,
		details: res.data
	};
}

export function toggleFavorite(res) {
	return {
		type: types.TOGGLE_FAVORITE,
		movieId: res.movieId,
		isFavorite: res.isFavorite
	}
}

export function retrieveMovieDetails(movieId) {
	return function (dispatch) {
		return axios.get(`${TMDB_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=casts,images,videos`)
		.then(res => {
			isMovieInWatchlist(movieId).then(isFavorited => {
				var res2 = res
				res2.data.isFavorite = isFavorited
				dispatch(retrieveMovieDetailsSuccess(res2));
			})
			
		})
		.catch(error => {
			console.log('Movie Details', error); //eslint-disable-line
		});
	};
}

export async function isMovieInWatchlist(movie) {
	const storedMovie = await AsyncStorage.getItem("MOVIE::"+movie.id)
	return storedMovie !== undefined
	
}

export function addToWatchlist(movie) {
   return function(dispatch) {
	const movieTobeSaved = JSON.stringify({
		id: movie.id,
		movieId: movie.movieId,
		poster_path: movie.poster_path,
		original_title: movie.original_title,
		vote_average:movie.vote_average,
		release_date: movie.release_date,
		overview: movie.overview
	 });
	AsyncStorage.setItem("MOVIE::"+movie.id, movieTobeSaved , () => {
		dispatch(toggleFavorite({isFavorite: true, movieId: movie.id}))
	})
   }
	
}


export function removeFromWatchlist(movie) {
	AsyncStorage.removeItem("MOVIE::"+movie.id);
	return function(dispatch) {
		dispatch(toggleFavorite({isFavorite: false, movieId: movie.id}))
	}
	
}

async function getMoviesFromWatchlist() {
		const list = await AsyncStorage.getAllKeys();
		const movieIDs = list.filter((movieId)=> { return movieId.indexOf("MOVIE::") == 0});
		console.log("moviesIds ::" + movieIDs);
		let allMovies = await AsyncStorage.multiGet(movieIDs);
		return allMovies;//.map(movieString => JSON.parse(movieString))
}