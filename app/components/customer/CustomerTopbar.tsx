const CustomerTopbar = () => {
    return (
      <header className="topbar product-topbar">
        <div className="topbar-left">
          <div className="logo">
            <span className="logo-icon">⬢</span>
            <span className="logo-text">RentalSys</span>
          </div>
  
          <span className="menu-icon">☰</span>
        </div>
  
        <div className="topbar-center">
          <input
            type="text"
            placeholder="Search"
            className="search-input"
          />
        </div>
  
        <div className="topbar-right">
          <span className="icon">🔔</span>
          <span className="icon">🛒</span>
          <span className="avatar">👤</span>
        </div>
      </header>
    );
  };
  
  export default CustomerTopbar;
  