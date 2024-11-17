import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import Bookmark from './Bookmark';
import '../styles/pokedex.css';

const Pokedex = () => {
    const [pokemon, setPokemon] = useState(null); 
    const [searchResults, setSearchResults] = useState([]); 
    const [searchParams, setSearchParams] = useSearchParams(); 
    const [bookmarkedPokemon, setBookmarkedPokemon] = useState([]);

    const limit = 20; 
    const maxPokemon = 151; 
    const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1; 
    const searchQuery = searchParams.get('search') || ''; 

    // 검색 여부에 따른 총 페이지 수 계산
    const totalPages = searchQuery
        ? Math.ceil(searchResults.length / limit) 
        : Math.ceil(maxPokemon / limit); 

    const fetchPokemon = async () => {
        try {
            if (searchQuery) {
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${maxPokemon}`);
                const results = response.data.results; 

                const detailedResults = await Promise.all(
                    results.map(async (pokemon) => { 
                        const pokemonResponse = await axios.get(pokemon.url);
                        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonResponse.data.id}`);
                        const koreanName = speciesResponse.data.names.find(name => name.language.name === 'ko');
                        return {
                            ...pokemonResponse.data,
                            koreanName: koreanName ? koreanName.name : pokemon.name,
                            sprites: pokemonResponse.data.sprites,
                            id: pokemonResponse.data.id,
                        };
                    })
                );

                const filteredResults = detailedResults.filter(p =>
                    (p.id <= maxPokemon) && 
                    (p.name.includes(searchQuery) || p.koreanName.includes(searchQuery) || p.id.toString() === searchQuery)
                );

                setSearchResults(filteredResults);
            } else {
                const offset = currentPage * limit;
                const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
                const results = response.data.results;

                const detailedPokemon = await Promise.all(
                    results.map(async (pokemon) => {
                        const pokemonResponse = await axios.get(pokemon.url);
                        const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonResponse.data.id}`);
                        const koreanName = speciesResponse.data.names.find(name => name.language.name === 'ko');
                        return {
                            ...pokemonResponse.data,
                            koreanName: koreanName ? koreanName.name : pokemon.name,
                            sprites: pokemonResponse.data.sprites,
                            id: pokemonResponse.data.id,
                        };
                    })
                );

                // 1세대 151번 뮤까지만
                setPokemon(detailedPokemon.filter(p => p.id <= maxPokemon));
            }
        } catch (error) {
            console.error('포켓몬 데이터를 가져오던 중 오류가 발생했습니다:', error);
        }
    };

    useEffect(() => {
        fetchPokemon();

        // localStorage에서 북마크 불러오기
        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPokemon')) || [];
        setBookmarkedPokemon(storedBookmarks);
    }, [currentPage, searchQuery]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchParams({ search: query, page: '1' }); // 객체로 전달되는 파라미터
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ search: searchQuery, page: (newPage + 1).toString() }); 
    };

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

    // 검색 결과 페이지네이션
    const paginatedSearchResults = searchResults.slice(currentPage * limit, (currentPage + 1) * limit);

    return (
        <div className='container'>
            <input type="text" placeholder="포켓몬 이름 또는 id를 입력하세요" value={searchQuery} onChange={handleSearch}/>
            <ul className="pokemon-grid">
                {searchQuery
                    ? paginatedSearchResults.map(p => (
                        <li key={p.id} className='pokemon-item'>
                            <h3><Link to={`/pokemon/${p.id}`}>#{p.id}. {p.koreanName} ({p.name})</Link></h3>
                            <Link to={`/pokemon/${p.id}`}><img src={p.sprites.front_default} alt={p.name} /></Link>
                            <button onClick={() => toggleBookmark(p)}>
                                {bookmarkedPokemon.some(bookmarked => bookmarked.id === p.id) ? '북마크 제거' : '북마크'}
                            </button>
                        </li>
                    ))
                    : pokemon?.map(p => (
                        <li key={p.id} className='pokemon-item'>
                            <h3><Link to={`/pokemon/${p.id}`}>#{p.id}. {p.koreanName} ({p.name})</Link></h3>
                            <Link to={`/pokemon/${p.id}`}><img src={p.sprites.front_default} alt={p.name} /></Link>
                            <button onClick={() => toggleBookmark(p)}>
                                {bookmarkedPokemon.some(bookmarked => bookmarked.id === p.id) ? '북마크 제거' : '북마크'}
                            </button>
                        </li>
                    ))}
            </ul>
            <div>
                <button onClick={() => handlePageChange(Math.max(currentPage - 1, 0))} disabled={currentPage === 0}>이전</button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage + 1 >= totalPages}>다음</button>
            </div>

            <Bookmark bookmarkedPokemon={bookmarkedPokemon} toggleBookmark={toggleBookmark} />
        </div>
    );
};

export default Pokedex;