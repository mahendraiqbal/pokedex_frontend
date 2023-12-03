import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "tailwindcss/tailwind.css";

function Home() {
  const [modalPokedexNumber, setModalPokedexNumber] = useState(null);
  const [pokemonData, setPokemonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const endOfListRef = useRef(null);

  const openModal = (pokedexNumber) => {
    setModalPokedexNumber(pokedexNumber);
  };

  const closeModal = () => {
    setModalPokedexNumber(null);
  };

  const fetchData = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/pokemon?offset=${offset}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setPokemonData((prevData) => [...prevData, ...data]);
        setOffset((prevOffset) => prevOffset + limit);
      } else {
        console.error(
          `Failed to fetch Pokemon data. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error during data fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (modalPokedexNumber !== null) {
      renderChart();
    }
  }, [modalPokedexNumber, pokemonData]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 200) {
        fetchData();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchData]);

  const renderChart = () => {
    const selectedPokemon = pokemonData.find(
      (pokemon) => pokemon.pokedex_number === modalPokedexNumber
    );

    if (!selectedPokemon) {
      return;
    }

    const chartData = {
      labels: [
        "HP",
        "Attack",
        "Defense",
        "Special Attack",
        "Special Defense",
        "Speed",
      ],
      datasets: [
        {
          label: selectedPokemon.name,
          data: [
            selectedPokemon.hp,
            selectedPokemon.attack,
            selectedPokemon.defense,
            selectedPokemon.sp_attack,
            selectedPokemon.sp_defense,
            selectedPokemon.speed,
          ],
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      scales: {
        r: {
          beginAtZero: true,
        },
      },
    };

    const ctx = document.getElementById("statsChart").getContext("2d");
    new Chart(ctx, {
      type: "radar",
      data: chartData,
      options: chartOptions,
    });
  };

  return (
    <div className="container mx-auto my-8">
      <h2 className="text-3xl font-bold mb-4">Home of Pokemon</h2>
      <ul className="space-y-2">
        {pokemonData.map((pokemon) => (
          <li
            key={pokemon.id}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded"
            onClick={() => openModal(pokemon.pokedex_number)}
          >
            {pokemon.name}
          </li>
        ))}
      </ul>

      {modalPokedexNumber !== null && (
        <div className="modal p-4 bg-white border rounded absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h3 className="text-2xl font-bold mb-2">
            Modal for Pokemon {modalPokedexNumber}
          </h3>

          <canvas id="statsChart" width="400" height="200"></canvas>

          {pokemonData.map((pokemon) =>
            pokemon.pokedex_number === modalPokedexNumber ? (
              <div key={pokemon.id}>
                <p className="text-lg font-semibold text-black">
                  Pokedex Number: {pokemon.pokedex_number}
                </p>
                <p className="text-lg text-black">Name: {pokemon.name}</p>
                <p className="text-lg text-black">HP: {pokemon.hp}</p>
                <p className="text-lg text-black">Attack: {pokemon.attack}</p>
                <p className="text-lg text-black">Defense: {pokemon.defense}</p>
                <p className="text-lg text-black">
                  Special Attack: {pokemon.sp_attack}
                </p>
                <p className="text-lg text-black">
                  Special Defense: {pokemon.sp_defense}
                </p>
                <p className="text-lg text-black">Speed: {pokemon.speed}</p>
              </div>
            ) : null
          )}

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
            onClick={closeModal}
          >
            Close Modal
          </button>
        </div>
      )}
      <div ref={endOfListRef}></div>
    </div>
  );
}

export default Home;
