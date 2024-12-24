import PokemonList from "../components/PokemonList";
import title from '../../public/assets/Frame 200.png'
import pokemonImg from '../../public/assets/Group 1244831162.png'

export const Home = () => {
  return (
    <div className="flex flex-col gap-4 items-center my-4">
      <img src={title} alt=""/>
      <img src={pokemonImg} alt=""/>
      <PokemonList />
    </div>
  )
}

export default Home;