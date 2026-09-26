import './Header.css';

function Header({ onNavigate }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <button className="header-nav-btn" onClick={onNavigate}>
          Pokedex
        </button>
      </div>
      <div className="header-right">
        <span className="header-brand">Sato&apos;s Pokedex</span>
      </div>
    </header>
  )
}

export default Header