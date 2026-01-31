const CustomerSidebar = () => {
    return (
      <aside className="sidebar product-sidebar">
        <h4 className="sidebar-title">Category</h4>
        <ul>
          <li>Cameras <span>6</span></li>
          <li>Projectors <span>4</span></li>
          <li>Laptops <span>5</span></li>
          <li>Tools <span>3</span></li>
        </ul>
  
        <h4 className="sidebar-title">Price Range</h4>
        <input type="range" />
        <div className="price-range">
          <span>$10</span>
          <span>$100</span>
        </div>
  
        <h4 className="sidebar-title">Rental Duration</h4>
        <label><input type="radio" name="duration" /> Hourly</label>
        <label><input type="radio" name="duration" /> Daily</label>
        <label><input type="radio" name="duration" defaultChecked /> Weekly</label>
        <label><input type="radio" name="duration" /> Custom</label>
      </aside>
    );
  };
  
  export default CustomerSidebar;
  