const fetchPokemons = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
  );
  return response.json();
};

export default fetchPokemons;