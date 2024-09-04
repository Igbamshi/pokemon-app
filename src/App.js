import { useEffect, useState } from "react";
import Pokemonthumnails from "./component/pokemonthumbnails";
import PokemonPopUp from "./component/pokemonpopup";
import { useInView } from "react-intersection-observer";
import typeColors from "./component/PopupBg";

function App() {
  const [allpokenmons, setallpokemons] = useState([]);
  const [loadmore, setloadmore] = useState("https://pokeapi.co/api/v2/pokemon?limit=20");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { ref, inView } = useInView({ triggerOnce: false, threshold: 1.0 });

  const getallpokemons = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { next, results } = await (await fetch(loadmore)).json();
      setloadmore(next);
      const newPokemons = await Promise.all(
        results.map(pokemon => fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`).then(res => res.json()))
      );
      setallpokemons(currentList => {
        const newPokemonsFiltered = newPokemons.filter(newPokemon =>
          !currentList.some(currentPokemon => currentPokemon.id === newPokemon.id)
        );
        return [...currentList, ...newPokemonsFiltered].sort((a, b) => a.id - b.id);
      });
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getallpokemons();
  }, []);

  useEffect(() => {
    if (inView && !loading) getallpokemons();
  }, [inView, loading]);

  const handlePokemonClick = pokemon => {
    const priimarytype = pokemon.types[0].type.name;
    setSelectedPokemon({ ...pokemon, backgroundColor: typeColors[priimarytype] || "#ffffff" });
  };

  const filteredPokemons = allpokenmons.filter(pokemon =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <h1>POKEMON</h1>
      <input
        type="text"
        placeholder="Search Pokémon"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      <div className="pokemon-container">
        <div className="all-container">
          {filteredPokemons.map(pokemon => (
            <Pokemonthumnails
              id={pokemon.id}
              name={pokemon.name}
              image={pokemon.sprites.other.dream_world.front_default}
              type={pokemon.types[0].type.name}
              key={pokemon.id}
              onClick={() => handlePokemonClick(pokemon)}
            />
          ))}
        </div>
        <div
          ref={ref}
          style={{ height: '1px', background: 'transparent', margin: '10px 0' }}
        />
        {loading && <div className="loading">Loading...</div>}
      </div>
      {selectedPokemon && <PokemonPopUp pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />}
    </div>
  );
}

export default App;