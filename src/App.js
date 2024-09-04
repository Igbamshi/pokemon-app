import { useEffect, useState } from "react";
import Pokemonthumnails from "./component/pokemonthumbnails";
import PokemonPopUp from "./component/pokemonpopup";
import { useInView } from "react-intersection-observer";
import typeColors from "./component/PopupBg";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch } from "@fortawesome/free-solid-svg-icons";

function App() {
  const[allpokenmons, setallpokemons] = useState([])
  const[loadmore, setloadmore] = useState("https://pokeapi.co/api/v2/pokemon?limit=20")
  const[selectedPokemon, setSelectedPokemon] = useState(null)
  const[loading, setLoading]=useState(false)
  const[searchQuery, setSearchQuery]= useState("")

  const {ref,inView}= useInView({
    triggerOnce:false,
    threshold:1.0
  })

  const getallpokemons = async () => {
    if (loading) return; // Prevent multiple requests

    setLoading(true);
    try {
      const res = await fetch(loadmore);
      const data = await res.json();
      setloadmore(data.next);

      // Fetch details for each Pokémon
      const newPokemons = await Promise.all(
        data.results.map(async (pokemon) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
          return res.json();
        })
      );

      setallpokemons((currentList) => {
        // Filter out Pokémon that are already in the current list
        const newPokemonsFiltered = newPokemons.filter((newPokemon) =>
          !currentList.some((currentPokemon) => currentPokemon.id === newPokemon.id)
        );

        // Combine the current list with new Pokémon and sort
        const updatedList = [...currentList, ...newPokemonsFiltered].sort((a, b) => a.id - b.id);

        return updatedList;
      });
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getallpokemons(); // Initial load
  }, []);

  useEffect(() => {
    if (inView && !loading) {
      getallpokemons(); // Load more when scrolled to bottom
    }
  }, [inView, loading]);

  const handlePokemonClick = (pokemon) => {
    const priimarytype= pokemon.types[0].type.name;
    const backgroundColor =typeColors[priimarytype] || "#ffffff"
    setSelectedPokemon({...pokemon, backgroundColor});
  };

  const handlepokemonpop = () => {
    setSelectedPokemon(null);
  };

  const filteredPokemons = allpokenmons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app-container">
      <h1>POKEMON</h1>
      <input
        type="text"
        placeholder="Search Pokémon"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      {/* <button className="search-button" onClick={() => console.log("Search clicked!")}>
        <FontAwesomeIcon icon={faSearch}/>
        </button> */}
      <div className="pokemon-container">
        <div className="all-container">
          {filteredPokemons.map((pokemon,index) => (
            <Pokemonthumnails
            id={pokemon.id}
            name={pokemon.name}
            image={pokemon.sprites.other.dream_world.front_default}
            type={pokemon.types[0].type.name}
            key={pokemon.id}
            onClick={()=> handlePokemonClick(pokemon)}
            />
          ))}
        </div>
        <div
          ref={ref}
          style={{
            height: '1px',
            background: 'transparent',
            margin: '10px 0',
          }}
        ></div>
         {loading && <div className="loading">Loading...</div>}
      </div>
      {selectedPokemon   && <PokemonPopUp pokemon={selectedPokemon} onClose={handlepokemonpop}/>}
    </div>
  );
}

export default App;
