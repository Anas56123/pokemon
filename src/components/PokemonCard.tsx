import { useState, useEffect } from "react";

interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_shiny: string;
  };
}

interface Stat {
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  url: string;
}

const PokemonCard = ({ data, isLoading, error }: {
  data: Pokemon;
  isLoading: boolean;
  error: Error | null;
}) => {
  const [activeCard, setActiveCard] = useState(false);
  const [stats, setStats] = useState<Stat | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${data.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const statsData = await response.json();
        setStats(statsData);
      } catch (err) {
        setStatsError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [data.id]);

  const handleFlip = () => {
    setActiveCard(!activeCard);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;

  console.log(data);

  return (
    <>
        <div className="min-h-fit flex items-center justify-center py-8">
          <div className="flex items-center justify-center">
            <div
              onClick={handleFlip}
              className={`relative card ${activeCard ? "cardFlip" : ""}`}
            >
              <div className={`front card ${data.types[0].type.name}`}>
                  <h1 className="text-4xl font-montserrat font-extrabold capitalize text-center text-white pt-16">{data.name}</h1>
                  <p className="text-center text-white font-montserrat font-light">#{data.id}</p>
                  <img src={`../../public/assets/${data.types[0].type.name}_background.png`} alt="" />
                  <img src={data.sprites.front_shiny} alt="" className="pokemon-img" />
                  <div className={`flex justify-center gap-3 absolute bottom-[5%] right-1/2 translate-x-1/2 w-full`}>
                    {data.types.map((type: { type: { name: string } }) => (
                    <div className={`${type.type.name}-btn capitalize btn bg-black flex`}><img src={`../../public/assets/icons/${type.type.name}.svg`} alt="" />{type.type.name}</div>
                  ))}
                  </div>
              </div>
              <div
                className={`absolute top-0 back card ${data.types[0].type.name}-reverse`}
              >
                <h1 className={`font-montserrat text-3xl text-center font-bold text-${data.types[0].type.name} pt-12`}>
                  Base Stats
                </h1>
                <div className="flex flex-col gap-4 p-8">
                  {stats?.stats.map((stat) => {
                    const howManySlots = Math.round((stat.base_stat * 15)/100) >= 15 ? 15 : Math.round((stat.base_stat * 15)/100)
                    const howManySlotsLeft = 15 - howManySlots
                    const activeSlots = genarateSlots(howManySlots, data)
                    const emptySlots = genarateEmptySlots(howManySlotsLeft, data)
                    return (
                    <div key={stat.stat.name} className="flex items-center gap-2">
                      <div className="flex items-center justify-between w-1/3">
                        <span className="font-montserrat font-medium capitalize text-white">{stat.stat.name == 'special-attack'? 'Sp. Atk' :stat.stat.name == 'special-defense'? 'Sp. Def' : stat.stat.name == 'hp'? 'HP' : stat.stat.name}</span>
                        <span className="font-montserrat font-bold text-white">{stat.base_stat}</span>
                      </div>
                      <div className="flex gap-1">
                      {activeSlots}
                      {emptySlots}
                      </div>
                    </div>
                  )})}
                  <div className="flex items-center h-32">
                    <div className=" border-r border-white pr-10 p-block-15-px">
                      <p className="font-montserrat font-medium text-white">Height: {data.height /10} m</p>
                      <p className="font-montserrat font-medium text-white">Weight: {data.weight /10} kg</p>
                    </div>
                    <div className="flex gap-2 pl-3">{data.types.map((type: { type: { name: string } }) => (
                    <div className={`${type.type.name}-btn capitalize btn flex`}><img src={`../../public/assets/icons/${type.type.name}.svg`} alt="" /></div>
                  ))}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export default PokemonCard;

const genarateSlots = (howManySlots:number, data:any) => {
  const x = []
for(let i=0 ; i < howManySlots;i++){
  x.push(<div className={`slot slot-${data.types[0].type.name}`}></div>)
}
return x
}

  const genarateEmptySlots = (howManySlotsLeft:number, data:any ) => {
  const x = []
for(let e=0 ; e < howManySlotsLeft;e++){
  x.push(<div className={`slot slot-${data.types[0].type.name}-empty`}></div>)
}
return x
}