import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchPokemonList, fetchPokemonDetails } from '../api/pokemonApi';
import Bookmark from './Bookmark';
import '../styles/pokedex.css';

const Pokedex = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookmarkedPokemon, setBookmarkedPokemon] = useState([]);

    const limit = 20;
    const maxPokemon = 151;
    const currentPage = parseInt(searchParams.get('page') || '1', 10) - 1;
    const searchQuery = searchParams.get('search') || '';
    
    // 검색어가 있을 때만 전체 포켓몬 데이터 가져오기
    // isLoading: isAllLoading <- 변수 이름을 변경(아래의 isLoading과 구분하기 위함)하기 위한 구조 분해 방식
    const { data: allPokemonList, isLoading: isAllLoading, isError: isAllError } = useQuery({
        queryKey: ['allPokemonList'],
        queryFn: async () => {
            const results = await fetchPokemonList({ limit: maxPokemon, offset: 0 });
            return Promise.all(results.map(fetchPokemonDetails));
        },
        enabled: !!searchQuery, // 검색어가 있을 때만 실행
    });
    
    // 현재 페이지의 포켓몬 데이터 가져오기
    // queryKey를 기반으로 데이터를 캐싱, 페이지네이션(limit, offset)에 따라 데이터 요청
    const { data: pokemonList, isLoading, isError } = useQuery({
        queryKey: ['pokemonList', { limit, offset: currentPage * limit }],
        queryFn: async ({ queryKey }) => {
            const [_key, { limit, offset }] = queryKey; // queryKey를 구조 분해하여 limit과 offset 값을 추출 -> api 요청에 사용
            const results = await fetchPokemonList({ limit, offset });
            return Promise.all(results.map(fetchPokemonDetails));
        },
        keepPreviousData: true, // 이전 데이터를 유지하여 화면 깜빡임 방지
        enabled: !searchQuery, // 검색어가 없을 때만 실행
    });    

    // 검색 결과 필터링
    const filteredPokemon = searchQuery 
        ? allPokemonList?.filter(p => p.name.includes(searchQuery) || 
        p.koreanName.includes(searchQuery) || 
        p.id.toString() === searchQuery) || [] : pokemonList;
    
    // 검색 결과 페이지네이션 처리
    const paginatedSearchResults = searchQuery
        ? filteredPokemon.slice(currentPage * limit, (currentPage + 1) * limit)
        : filteredPokemon;

    const totalPages = searchQuery ? Math.ceil((filteredPokemon?.length || 0) / limit) : Math.ceil(maxPokemon / limit);

    // 북마크 데이터 로드
    useEffect(() => {
        const storedBookmarks = JSON.parse(localStorage.getItem('bookmarkedPokemon')) || [];
        setBookmarkedPokemon(storedBookmarks);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchParams({ search: query, page: '1' }); // 객체로 전달되는 파라미터(검색 시 페이지 번호는 항상 1로 초기화됨)
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
                {paginatedSearchResults?.map(p => (
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
