import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import upperCaseFirstLetter from "../functions/upperCaseFirstLetter";

const fetchPokemons = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/pikachu");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const PokemonList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["pokemons"],
    queryFn: fetchPokemons,
  });
  const [activeCard, setActiveCard] = useState(false);

  const handleFlip = () => {
    setActiveCard(!activeCard);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  console.log(data);

  return (
    <>
      <main>
        <div className="h-screen centered">
          <div
            onClick={handleFlip}
            className={`relative card ${activeCard ? "cardFlip" : ""}`}
          >
            <div className={`front card ${data.types[0].type.name}`}>
                <h1 className="text-4xl text-center text-white pt-16">{upperCaseFirstLetter(data.name)}</h1>
                <p className="text-center text-white font-light">#{data.id}</p>
            </div>
            <div
              className={`absolute top-0 back card ${data.types[0].type.name}-reverse`}
            ></div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PokemonList;
