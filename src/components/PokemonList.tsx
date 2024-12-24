import { useQuery } from "@tanstack/react-query";
import PokemonCard from "./PokemonCard";
import { useState } from "react";
import { Input } from "antd";
import search from '../../public/assets/icons/fi-rr-search.svg'

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonDetailed {
  id: number;
  name: string;
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    front_shiny: string;
  };
  height:number;
  weight:number;
}

const PokemonList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const limit = 6;

  const { data: allPokemonData } = useQuery({
    queryKey: ["allPokemons"],
    queryFn: async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1000"
      );
      const data = await response.json();
      return data.results;
    },
  });


  const { data: allPokemonDetails, isLoading } = useQuery({
    queryKey: ["allPokemonDetails", allPokemonData],
    queryFn: async () => {
      if (!allPokemonData) return [];
      const details = await Promise.all(
        allPokemonData.map((pokemon: Pokemon) =>
          fetch(pokemon.url).then((res) => res.json())
        )
      );
      return details;
    },
    enabled: !!allPokemonData,
  });

  const allTypes = Array.from(
    new Set(
      allPokemonDetails?.flatMap((pokemon: PokemonDetailed) =>
        pokemon.types.map((t) => t.type.name)
      ) || []
    )
  );
  
  const filteredPokemon = allPokemonDetails?.filter(
    (pokemon: PokemonDetailed) => {
      const matchesSearch = pokemon.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTypes =
        selectedTypes.length === 0 ||
        pokemon.types.some((t) => selectedTypes.includes(t.type.name));
      return matchesSearch && matchesTypes;
    }
  );

  const totalPages = Math.ceil((filteredPokemon?.length || 0) / limit);
  const paginatedPokemon = filteredPokemon?.slice(
    (page - 1) * limit,
    page * limit
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  return (
    <div className="p-4 w-[1300px] flex flex-col items-center">
      <div className="mb-4 w-1/2">
      <p className="relative">
      <img src={search} alt="" className="absolute right-[15px] top-1/2 -translate-y-1/2 z-10" />
        <Input
          type="text"
          placeholder="Catch 'em all by searching here..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="w-full h-[45px] py-[15px] px-[30px] border rounded-xl input-search"
        />
      </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 w-1/2 justify-center">
        {allTypes.map((type) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`${type}-btn capitalize btn flex ${
              selectedTypes.includes(type)
                ? "bg-blue-me"
                : "bg-black"
            }`}
          >
            <img src={`../../public/assets/icons/${type}.svg`} alt="" />
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-me gap-0 [&>*]:m-0 [&>*]:p-0">
        {paginatedPokemon?.map((pokemon: PokemonDetailed) => (
          <PokemonCard
            key={pokemon.name}
            data={pokemon}
            isLoading={isLoading}
            error={null}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4 w-[1300px]">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="py-2 text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PokemonList;
