import React, { useState, useEffect } from "react";
import PokemonDetails from "./PokemonDetails"; // Import the PokemonDetails component

const PokemonList = () => {
  const [pokemons, setPokemons] = useState([]);  // State for list of Pokémon
  const [selectedPokemon, setSelectedPokemon] = useState(null);  // State for selected Pokémon

  // Fetch Pokémon list when the component mounts
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=10")  // Adjust limit as needed
      .then((res) => res.json())
      .then((data) => setPokemons(data.results));
  }, []);

  // Function to handle clicking a Pokémon
  const handlePokemonClick = async (pokemonUrl) => {
    const res = await fetch(pokemonUrl);  // Fetch details for clicked Pokémon
    const data = await res.json();
    setSelectedPokemon(data);  // Set selected Pokémon data
  };

  return (
    <div>
      <h1>Pokémon List</h1>
      <div className="pokemon-list">
        {pokemons.map((pokemon, index) => (
          <div
            key={index}
            className="pokemon-item"
            onClick={() => handlePokemonClick(pokemon.url)}  // Set click handler
            style={{ cursor: "pointer", marginBottom: "10px" }}
          >
            {pokemon.name}
          </div>
        ))}
      </div>
      
      {/* Conditionally render PokemonDetails if a Pokémon is selected */}
      {selectedPokemon && <PokemonDetails pokemon={selectedPokemon} />}
    </div>
  );
};

export default PokemonList;