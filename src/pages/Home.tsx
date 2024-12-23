import { useQuery } from "@tanstack/react-query";
import PokemonCard from "../components/PokemonCard";
import { useState } from "react";
import { Input } from "antd";
import { Search } from "lucide-react";

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
}

const Home = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const limit = 6;

  // Fetch all Pokemon
  const { data: allPokemonData, isLoading: isLoadingAll } = useQuery({
    queryKey: ["allPokemons"],
    queryFn: async () => {
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1000"
      );
      const data = await response.json();
      return data.results;
    },
  });

  // Fetch details for all Pokemon
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

  // Get unique types from all Pokemon
  const allTypes = Array.from(
    new Set(
      allPokemonDetails?.flatMap((pokemon: PokemonDetailed) =>
        pokemon.types.map((t) => t.type.name)
      ) || []
    )
  );

  // Filter Pokemon based on search term and selected types
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

  // Calculate pagination
  const totalPages = Math.ceil((filteredPokemon?.length || 0) / limit);
  const paginatedPokemon = filteredPokemon?.slice(
    (page - 1) * limit,
    page * limit
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="p-4">
      {/* Add search input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search Pokemon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
          prefix={<Search />}
        />
      </div>

      {/* Add type filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {allTypes.map((type) => (
          // <button
          //   key={type}
          //   onClick={() => toggleType(type)}
          //   className={`px-3 py-1 rounded ${
          //     selectedTypes.includes(type)
          //       ? "bg-blue-500 text-white"
          //       : "bg-gray-200"
          //   }`}
          // >
          //   {type}
          // </button>
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`${type}-btn capitalize btn flex ${
              selectedTypes.includes(type)
                ? "bg-black text-white"
                : "bg-gray-700"
            }`}
          >
            <img src={`../../public/assets/icons/${type}.svg`} alt="" />
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {paginatedPokemon?.map((pokemon: PokemonDetailed) => (
          <PokemonCard
            key={pokemon.name}
            data={pokemon}
            isLoading={isLoading}
            error={null}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="py-2">
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

export default Home;
