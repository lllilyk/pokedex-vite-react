import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchPokemonDetails } from '../api/pokemonApi';

const PokemonDetail = () => {
    const { id } = useParams();

    const { data: pokemon, isLoading, isError } = useQuery(['pokemonDetail', id], () => fetchPokemonDetails({ url: `https://pokeapi.co/api/v2/pokemon/${id}` }));

    if (isLoading) return <p>로딩 중...</p>;
    if (isError) return <p>데이터를 가져오는 중 오류가 발생했습니다.</p>;

    const types = pokemon.types.map(type => type.type.name).join(', ');
    const stats = pokemon.stats.map(stat => (
        <li key={stat.stat.name}>
            {stat.stat.name}: {stat.base_stat}
        </li>
    ));

    return (
        <div className='container'>
            <h3>#{pokemon.id}</h3>
            <h1>{pokemon.koreanName}</h1>
            <img src={pokemon.sprites.front_default} alt={pokemon.koreanName} />
            <p>타입: {types}</p>
            <p>분류: {pokemon.genus}</p>
            <p>능력치:</p>
            <ul>{stats}</ul>
        </div>
    );
};

export default PokemonDetail;
