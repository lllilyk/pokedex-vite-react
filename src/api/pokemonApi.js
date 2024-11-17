import axios from 'axios'

// 포켓몬 목록
export const fetchPokemonList = async ({ limit, offset }) => {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    return response.data.results;
};

// 포켓몬 상세 데이터
export const fetchPokemonDetails = async (pokemon) => {
    const pokemonResponse = await axios.get(pokemon.url);
    const speciesResponse = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonResponse.data.id}`);
    const koreanName = speciesResponse.data.names.find(name => name.language.name === 'ko');
    return {
        ...pokemonResponse.data,
        koreanName: koreanName ? koreanName.name : pokemon.name,
        sprites: pokemonResponse.data.sprites,
        id: pokemonResponse.data.id,
    };
};

// 검색어를 기반으로 포켓몬 필터링
export const filterPokemon = (pokemonList, searchQuery, maxPokemon) => {
    return pokemonList.filter(p => 
        (p.id <= maxPokemon) && 
        (p.name.includes(searchQuery) || p.koreanName.includes(searchQuery) || p.id.toString() === searchQuery)
    );
}