import { useState, useEffect } from 'react'
import axios from 'axios'
import './Pokenav.css'
import Header from './Header.jsx'

function Pokenav({ onReturn, initialPokemon = '' }) {
  const [value, setValue] = useState(null)
  const [species, setSpecies] = useState(null)
  const [pokemon, setPokemon] = useState(initialPokemon)

  function fetchPokemon(query) {
    if (!query) return
    const q = query.toLowerCase().trim()
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${q}`)
      .then((response) => {
        setValue(response.data)
        return axios.get(response.data.species.url)
      })
      .then((speciesResponse) => {
        setSpecies(speciesResponse.data)
      })
      .catch((error) => {
        console.error('Error fetching Pokemon:', error)
      })
  }

  useEffect(() => {
    if (initialPokemon) {
      setPokemon(initialPokemon)
      fetchPokemon(initialPokemon)
    }
  }, [initialPokemon])

  function handleBtn() {
    fetchPokemon(pokemon)
  }

  function handleInputChange(event) {
    setPokemon(event.target.value)
  }

  function getGenderSymbols(genderRate) {
    if (genderRate === undefined || genderRate === null) {
      return <span className="dash">-</span>
    }
    if (genderRate === -1) {
      return <span className="gender-genderless">None</span>
    }
    if (genderRate === 0) {
      return <span className="gender-male">Male</span>
    }
    if (genderRate === 8) {
      return <span className="gender-female">Female</span>
    }
    return (
      <>
        <span className="gender-male">Male</span>
        <span className="gender-female">Female</span>
      </>
    )
  }

  const description = species?.flavor_text_entries
    ?.find((entry) => entry.language.name === 'en')
    ?.flavor_text?.replace(/[\f\n\r\t]/g, ' ')

  const idFormatted = value?.id ? String(value.id).padStart(3, '0') : ''

  return (
    <div className="pokedex-app">
      <div className="pokedex-frame">
        <Header onNavigate={onReturn} />
        <div className="pokedex-screen">
          <div className="screen-upper">
            <div className="artwork-display">
              {value?.id ? (
                <img
                  className="pokemon-artwork"
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value.id}.png`}
                  alt={value?.name || 'Pokemon'}
                />
              ) : (
                <div className="artwork-placeholder"></div>
              )}
            </div>

            <div className="info-cards">
              <div className="name-card">
                <div className="id-banner">
                  <span className="id-number">Pokemon ID: {idFormatted}</span>
                  {value?.name && (
                    <span className="pokemon-name-tag">{value.name.toUpperCase()}</span>
                  )}
                </div>

                <div className="btn">
                  <input
                    type="text"
                    value={pokemon}
                    onChange={handleInputChange}
                    placeholder="Search Pokemon"
                    onKeyDown={(e) => e.key === 'Enter' && handleBtn()}
                  />
                  <button onClick={handleBtn}>Fetch Pokemon</button>
                </div>
              </div>

              <div className="middle-row">
                <div className="gender-card">
                  <div className="gender-tab"></div>
                  <div className="gender-icons">
                    {getGenderSymbols(species?.gender_rate)}
                  </div>
                </div>

                <div className="types-row">
                  {value?.types && value.types.length > 0 ? (
                    value.types.map((t, idx) => (
                      <div key={idx} className={`type-pill ${t.type.name}-type`}>
                        {t.type.name.toUpperCase()}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="type-pill empty"></div>
                      <div className="type-pill empty"></div>
                    </>
                  )}
                </div>
              </div>

              <div className="ht-wt-card">
                <div className="stat-row">
                  <span className="stat-label">Height: </span>
                  <span className="stat-val">
                    {value?.height !== undefined ? `${value.height / 10} m` : ''}
                  </span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-row">
                  <span className="stat-label">Weight: </span>
                  <span className="stat-val">
                    {value?.weight !== undefined ? `${value.weight / 10} kg` : ''}
                  </span>
                </div>
              </div>

              <div className="description-card">
                <div className="desc-bar-left"></div>
                <div className="desc-text">
                  <p>{description || ''}</p>
                </div>
                <div className="desc-bar-right"></div>
              </div>
            </div>
          </div>

          <div className="view-all-container">
            <button className="view-all-btn" onClick={onReturn}>
              <span className="view-all-title">View All Pokemon</span>
              <span className="view-all-subtitle">(Pokedex)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pokenav