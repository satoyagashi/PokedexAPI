
import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from './Card'
import './Pokedex.css'

const PAGE_SIZE = 16
const TOTAL_POKEMON = 1302

function Pokedex({ onReturn, onSearch }) {
  const [allPokemon, setAllPokemon] = useState([])  
  const [pageData, setPageData] = useState([])        
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingPage, setLoadingPage] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  const totalPages = Math.ceil(allPokemon.length / PAGE_SIZE)

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
    if (allPokemon.length === 0) return

    const start = (currentPage - 1) * PAGE_SIZE
    const slice = allPokemon.slice(start, start + PAGE_SIZE)

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
  }, [allPokemon, currentPage])

  function handleSearchSubmit() {
    if (!searchInput.trim()) return
    onSearch(searchInput.trim())
    onReturn()
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

  return (
    <div className="pokemon-list-page">
      <div className="list-topbar">
        <div className="topbar-left">
          <button className="return-btn" onClick={onReturn}>
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
              placeholder="Search Pokémon…"
            />
            <button onClick={handleSearchSubmit}>Fetch Pokémon</button>
          </div>
        </div>
        <div className="topbar-right"></div>
      </div>

      {loading ? (
        <p className="list-status">Loading Pokémon…</p>
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
                  />
                ))}
          </div>

          <div className="pagination">
            <button className="page-btn" onClick={() => goToPage(currentPage - 1)}disabled={currentPage === 1}>
               Previous
            </button>

            {buildPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="page-ellipsis">
                  …
                </span>
              ) : (
                <button className={`page-btn${p === currentPage ? ' active' : ''}`} key={p} nClick={() => goToPage(p)}>
                  {p}
                </button>
              )
            )}

            <button lassName="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next 
            </button>
          </div>

          <p className="page-info">
            Page {currentPage} of {totalPages} &nbsp;·&nbsp; {allPokemon.length} Pokémon
          </p>
        </>
      )}
    </div>
  )
}

export default Pokedex
