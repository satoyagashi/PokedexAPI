import './Header.css';

function Header({ onNavigate }) {
  return (
    <header className="site-header">
      <div className="info">
        <button className="header-nav-btn" onClick={onNavigate}>
          Pokedex
        </button>
      </div>
    </header>
  )
}

export default Header