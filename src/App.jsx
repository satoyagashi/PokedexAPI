import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Card from './Card'
import Pokenav from './Pokenav'
import './App.css'

const PAGE_SIZE = 16
const TOTAL_POKEMON = 1302

const POKEMON_TYPES = [
  'all',
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'dark',
  'fairy'
]

function getPokemonId(url) {
  if (!url) return 0
  const parts = url.split('/').filter(Boolean)
  return parseInt(parts[parts.length - 1], 10) || 0
}

function App() {
  const [view, setView] = useState('list')
  const [selectedPokemon, setSelectedPokemon] = useState('')
  const [allPokemon, setAllPokemon] = useState([])
  const [pageData, setPageData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)
  const [loadingType, setLoadingType] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('id-asc')
  const [typeCache, setTypeCache] = useState({})

  useEffect(() => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}&offset=0`)
      .then((res) => {
        setAllPokemon(res.data.results)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching Pokémon list:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (selectedType === 'all') return
    if (typeCache[selectedType]) return

    setLoadingType(true)
    axios
      .get(`https://pokeapi.co/api/v2/type/${selectedType}`)
      .then((res) => {
        const typePokemon = res.data.pokemon.map((entry) => entry.pokemon)
        setTypeCache((prev) => ({ ...prev, [selectedType]: typePokemon }))
        setLoadingType(false)
      })
      .catch((err) => {
        console.error(`Error fetching ${selectedType} type Pokémon:`, err)
        setLoadingType(false)
      })
  }, [selectedType, typeCache])

  const sortedPokemon = useMemo(() => {
    const baseList =
      selectedType === 'all' ? allPokemon : typeCache[selectedType] || []

    const query = searchInput.trim().toLowerCase()
    const filtered = baseList.filter((p) => {
      if (!query) return true
      const id = getPokemonId(p.url)
      return p.name.toLowerCase().includes(query) || String(id) === query
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'id-asc') {
        return getPokemonId(a.url) - getPokemonId(b.url)
      }
      if (sortBy === 'id-desc') {
        return getPokemonId(b.url) - getPokemonId(a.url)
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name)
      }
      return 0
    })
  }, [allPokemon, selectedType, typeCache, searchInput, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedPokemon.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchInput, selectedType, sortBy])

  useEffect(() => {
    if (sortedPokemon.length === 0) {
      setPageData([])
      return
    }

    const start = (currentPage - 1) * PAGE_SIZE
    const slice = sortedPokemon.slice(start, start + PAGE_SIZE)

    setLoadingPage(true)
    Promise.all(slice.map((p) => axios.get(p.url)))
      .then((responses) => {
        setPageData(responses.map((r) => r.data))
        setLoadingPage(false)
      })
      .catch((err) => {
        console.error('Error fetching page details:', err)
        setLoadingPage(false)
      })
  }, [sortedPokemon, currentPage])

  function handleSearchSubmit() {
    if (!searchInput.trim()) return
    const query = searchInput.trim().toLowerCase()
    const matched =
      sortedPokemon.find(
        (p) =>
          p.name.toLowerCase() === query ||
          String(getPokemonId(p.url)) === query
      ) || sortedPokemon[0]

    setSelectedPokemon(matched ? matched.name : searchInput.trim())
    setView('pokenav')
  }

  function handleCardClick(name) {
    setSelectedPokemon(name)
    setView('pokenav')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearchSubmit()
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function buildPageNumbers() {
    const pages = []
    const delta = 2

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  if (view === 'pokenav') {
    return (
      <Pokenav
        initialPokemon={selectedPokemon}
        onReturn={() => setView('list')}
      />
    )
  }

  const isContentLoading = loading || loadingType

  return (
    <div className="pokemon-list-page">
      <div className="list-topbar">
        <div className="topbar-left">
          <button
            className="return-btn"
            onClick={() => {
              setSelectedPokemon('')
              setView('pokenav')
            }}
          >
            Pokenav
          </button>
        </div>
        <div className="topbar-center">
          <div className="list-search">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Pokémon or ID…"
            />
            <button onClick={handleSearchSubmit}>Fetch Pokémon</button>
          </div>
        </div>
        <div className="topbar-right">
          <span className="header-brand">Sato&apos;s Pokedex</span>
        </div>
      </div>

      <div className="list-title-container">
        <h1 className="list-title">Pokedex</h1>
      </div>

      <div className="list-controls-bar">
        <div className="controls-group">
          <label htmlFor="type-filter" className="control-label">
            Type:
          </label>
          <select
            id="type-filter"
            className="control-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {POKEMON_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all'
                  ? 'All Types'
                  : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="controls-group">
          <label htmlFor="sort-by" className="control-label">
            Sort by:
          </label>
          <select
            id="sort-by"
            className="control-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="id-asc">ID: Low to High</option>
            <option value="id-desc">ID: High to Low</option>
            <option value="name-asc">Name: A – Z</option>
            <option value="name-desc">Name: Z – A</option>
          </select>
        </div>

        {(searchInput || selectedType !== 'all') && (
          <button
            className="reset-filters-btn"
            onClick={() => {
              setSearchInput('')
              setSelectedType('all')
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {isContentLoading ? (
        <p className="list-status">Loading Pokémon…</p>
      ) : sortedPokemon.length === 0 ? (
        <div className="no-results-container">
          <p className="no-results-text">No Pokémon found matching your filters.</p>
          <button
            className="reset-filters-btn"
            onClick={() => {
              setSearchInput('')
              setSelectedType('all')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className={`pokemon-grid${loadingPage ? ' loading' : ''}`}>
            {loadingPage
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="card card-skeleton" />
                ))
              : pageData.map((p) => (
                  <Card
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    image={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`}
                    types={p.types}
                    onClick={() => handleCardClick(p.name)}
                  />
                ))}
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {buildPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  className={`page-btn${p === currentPage ? ' active' : ''}`}
                  key={p}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="page-btn"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>

          <p className="page-info">
            Page {currentPage} of {totalPages} &nbsp;·&nbsp; {sortedPokemon.length} Pokémon
          </p>
        </>
      )}
    </div>
  )
}

export default App
