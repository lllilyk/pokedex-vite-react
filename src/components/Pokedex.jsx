import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonDetails, filterPokemon } from '../api/pokemonApi';
import Bookmark from './Bookmark';
import '../styles/pokedex.css';

const Pokedex = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookmarkedPokemon, setBookmarkedPokemon] = useState([]);

    const limit = 20;
    const maxPokemon = 151;
    const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const searchQuery = searchParams.get('search') || '';
    
    // React Query로 데이터 패칭
    // const { data, isLoading, isError } = useQuery(queryKey, fetchFunction, options);
    const { data: pokemonList, isLoading, isError } = useQuery(
        ['pokemonList', { limit, offset: currentPage * limit }],
        async ({ queryKey }) => {
            const [_key, { limit, offset }] = queryKey; // 구조 분해 시의 변수_React의 쿼리 식별자: _key = 'pokemonList'
            const results = await fetchPokemonList({ limit, offset }).then((data) => data.filter((pokemon, index) => index + offset < 151));
            return Promise.all(results.map(fetchPokemonDetails));
        },
        { keepPreviousData: true, // queryKey가 변경되어도 새 데이터가 로드될 때까지 이전 데이터 유지
            enabled: currentPage >= 0
        }
    );

    // 검색 결과 필터링
    const filteredPokemon = searchQuery ? filterPokemon(pokemonList || [], searchQuery, maxPokemon) : pokemonList;
    // ReactQuery의 useQuery가 데이터를 아직 로드하지 않아서 pokemonList가 undefined일 경우에 빈배열[]을 사용하도록 해서 오류 발생을 방지함.

    const totalPages = searchQuery ? Math.ceil((filteredPokemon?.length || 0) / limit) : Math.ceil(maxPokemon / limit);


    // 북마크 데이터 로드
    useEffect(() => {
        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPokemon')) || [];
        setBookmarkedPokemon(storedBookmarks);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchParams({ search: query, page: '1' });// 객체로 전달되는 파라미터
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

    if (isLoading) { return <p>로딩 중...</p>; }

    if (isError) { return <p>데이터를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>; }

    return (
        <div className='container'>
            <input type="text" placeholder="포켓몬 이름 또는 id를 입력하세요" value={searchQuery} onChange={handleSearch}
            />
            <ul className="pokemon-grid">
                {filteredPokemon?.map(p => (
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
