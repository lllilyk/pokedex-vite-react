import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/pokedex.css';

const PokemonDetail = () => {
    const { id } = useParams();
    const [pokemonDetail, setPokemonDetail] = useState(null);
    const [pokemonSpecies, setPokemonSpecies] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
            setPokemonDetail(response.data);

            const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            const koreanGenus = speciesResponse.data.genera.find(genus => genus.language.name === 'ko')?.genus;
            const koreanName = speciesResponse.data.names.find(name => name.language.name === 'ko')?.name;

            setPokemonSpecies({
                genus: koreanGenus || 'N/A',
                name: koreanName || response.data.name, 
            });
        };

        fetchDetail();
    }, [id]);

    if (!pokemonDetail || !pokemonSpecies) {
        return <p>로딩중</p>;
    }

    const types = pokemonDetail.types.map(type => type.type.name).join(', ');
    const stats = pokemonDetail.stats.map(stat => (
        <li key={stat.stat.name}>
            {stat.stat.name} : {stat.base_stat}
        </li>
    ));

    return (
        <div className='container'>
            <h3>#{id}</h3>
            <h1>{pokemonSpecies.name}</h1>
            <img src={pokemonDetail.sprites.front_default} alt={pokemonSpecies.name} />
            <p>타입: {types}</p>
            <p>분류: {pokemonSpecies.genus}</p>
            <p>능력치:</p>
            <ul>{stats}</ul>
        </div>
    );
};

export default PokemonDetail;
