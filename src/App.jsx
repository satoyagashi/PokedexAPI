import axios from 'axios'
import './App.css'
import { useState } from 'react'

function App(){
    const[value, setValue] = useState()
    const[pokemon, setPokemon] = useState()
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`

    function handleBtn(){
      axios.get(url).then((response)=> {
        setValue(response.data)
      })
    }

    function handleInputChange(event) {
      setPokemon(event.target.value)
    }

    return(
      <>
      <div className="container">
        <div className="btn">
          <input type="text" value={pokemon} onChange={handleInputChange} placeholder='Input Pokemon'/>
          <button onClick={handleBtn}>
            Fetch Pokemon
          </button>
        </div>
        <br></br>
        <div className="display">
          <br></br> 
          <p>Pokemon Name: {value?.name}</p>
          <p>Pokemon ID: {value?.id}</p>
          <br></br> <br></br>
          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value?.id}.png`}></img>
        </div>
      </div>
      </>
    )
}

export default App