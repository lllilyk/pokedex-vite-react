import axios from 'axios';

// 공통 API 호출 함수
const fetchFromApi = async (url) => {
    const response = await axios.get(url);
    return response.data;
};

// 포켓몬 목록
export const fetchPokemonList = async ({ limit, offset }) => {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    return await fetchFromApi(url).then(data => data.results);
};

// 포켓몬 상세 데이터
export const fetchPokemonDetails = async (pokemon) => {
    const pokemonData = await fetchFromApi(pokemon.url);
    const speciesData = await fetchPokemonSpecies(pokemonData.id);

    return {
        ...pokemonData,
        ...speciesData,
        sprites: pokemonData.sprites,
        id: pokemonData.id,
    };
};

// 포켓몬 종 데이터
export const fetchPokemonSpecies = async (id) => {
    const speciesData = await fetchFromApi(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const koreanGenus = speciesData.genera.find(genus => genus.language.name === 'ko')?.genus;
    const koreanName = speciesData.names.find(name => name.language.name === 'ko')?.name;

    return {
        genus: koreanGenus || speciesData.name,
        koreanName: koreanName || speciesData.name,
    };
};