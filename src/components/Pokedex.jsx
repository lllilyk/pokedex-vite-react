import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Bookmark from './Bookmark';
import '../styles/pokedex.css';

const Pokedex = () => {
    const [pokemon, setPokemon] = useState(null);
    const [allPokemon, setAllPokemon] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [bookmarkedPokemon, setBookmarkedPokemon] = useState([]); 
    const limit = 20;
    const maxPokemon = 151;
    const maxPage = Math.ceil(maxPokemon / limit) - 1;

    const fetchPokemonDetails = async (pokemonArray) => {
        return await Promise.all(
            pokemonArray.map(async (pokemon) => {
                const pokemonResponse = await axios.get(pokemon.url);
                const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonResponse.data.id}`);
                const koreanName = speciesResponse.data.names.find(name => name.language.name === 'ko');
                return {
                    ...pokemonResponse.data,
                    koreanName: koreanName ? koreanName.name : pokemon.name,
                    sprites: pokemonResponse.data.sprites,
                    id: pokemonResponse.data.id
                };
            })
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 모든 포켓몬 목록 불러오기
                const allResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${maxPokemon}`);
                const allResults = allResponse.data.results;
                const allPokemonList = await fetchPokemonDetails(allResults);
                setAllPokemon(allPokemonList);

                // 페이지별 포켓몬 데이터 가져오기
                const offset = page * limit;
                const adjustedLimit = page === maxPage ? maxPokemon % limit || limit : limit;

                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${adjustedLimit}&offset=${offset}`);
                const results = response.data.results;
                const pokemonList = await fetchPokemonDetails(results);
                setPokemon(pokemonList);
            } catch (error) {
                console.error('error: ', error);
            }
        };

        fetchData();

        // localStorage에서 북마크 불러오기
        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPokemon')) || [];
        setBookmarkedPokemon(storedBookmarks);

    }, [page]);

    // 검색
    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredPokemon = allPokemon.filter(p => p.name.includes(searchQuery) || p.koreanName.includes(searchQuery) || p.id.toString() === searchQuery);

    const toggleBookmark = (selectedPokemon) => {
        let updatedBookmarks = [...bookmarkedPokemon];
        if (bookmarkedPokemon.some(p => p.id === selectedPokemon.id)) {
            updatedBookmarks = updatedBookmarks.filter(p => p.id !== selectedPokemon.id);
        } else {
            updatedBookmarks.push(selectedPokemon);
        }
        setBookmarkedPokemon(updatedBookmarks);
        localStorage.setItem('bookmarkedPokemon', JSON.stringify(updatedBookmarks));
    };

    return (
        <div className='container'>
            <input type="text" placeholder="포켓몬 이름 또는 id를 입력하세요" value={searchQuery} onChange={handleSearch} />
            {searchQuery ? (
                <ul className="pokemon-grid">
                    {filteredPokemon.map(p => (
                        <li key={p.id} className='pokemon-item'>
                            <h3>
                                <Link to={`/pokemon/${p.id}`}>#{p.id}.{p.koreanName} ({p.name})</Link>
                            </h3>
                            <Link to={`/pokemon/${p.id}`}>
                                <img src={p.sprites.front_default} alt={p.name} />
                            </Link>
                            <button onClick={() => toggleBookmark(p)}>
                                {bookmarkedPokemon.some(bookmarked => bookmarked.id === p.id) ? '북마크 제거' : '북마크'}
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                pokemon ? (
                    <ul className="pokemon-grid">
                        {pokemon.map(p => (
                            <li key={p.id} className='pokemon-item'>
                                <h3>
                                    <Link to={`/pokemon/${p.id}`}>#{p.id}. {p.koreanName} ({p.name})</Link>
                                </h3>
                                <Link to={`/pokemon/${p.id}`}>
                                    <img src={p.sprites.front_default} alt={p.name} />
                                </Link>
                                <button onClick={() => toggleBookmark(p)}>
                                    {bookmarkedPokemon.some(bookmarked => bookmarked.id === p.id) ? '북마크 제거' : '북마크'}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>로딩중</p>
                )
            )}

            <div>
                <button onClick={() => setPage(page => Math.max(page - 1, 0))} disabled={page === 0}>
                    이전
                </button>
                <button onClick={() => setPage(page => (page < maxPage ? page + 1 : page))} disabled={page >= maxPage}>
                    다음
                </button>
            </div>

            <Bookmark bookmarkedPokemon={bookmarkedPokemon} toggleBookmark={toggleBookmark} />
        </div>
    );
};

export default Pokedex;