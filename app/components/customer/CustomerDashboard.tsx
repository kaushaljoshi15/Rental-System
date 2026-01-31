import CustomerSidebar from "./CustomerSidebar";
import CustomerTopbar from "./CustomerTopbar";

const products = [
    { name: "DSLR Camera", price: "$25/day", stock: true },
    { name: "HD Projector", price: "$40/day", stock: true },
    { name: "Lawn Mower", price: "$15/hour", stock: true },
    { name: "Macbook Pro", price: "$80/day", stock: true },
    { name: "Power Drill", price: "$10/day", stock: true },
    { name: "Lens Kit", price: "$12/day", stock: false },
    { name: "Electric Scooter", price: "$15/hour", stock: true },
    { name: "Gaming Laptop", price: "$45/day", stock: true },
];

const CustomerDashboard = () => {
    return (
    <>
            <CustomerTopbar />

            <div className="dashboard-layout product-page">
                <CustomerSidebar />

                <main className="dashboard-main">
                    <div className="product-header">
                        <h2>Product Listing</h2>

                        <select>
                            <option>Most Popular</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                    </div>

                    <section className="product-grid">
                        {products.map((p, i) => (
                            <div className="product-card" key={i}>
                                <div className="product-image" />

                                <h4>{p.name}</h4>
                                <p className="price">{p.price}</p>

                                <span className={p.stock ? "in-stock" : "out-stock"}>
                                    {p.stock ? "In Stock" : "Out of Stock"}
                                </span>

                                <button disabled={!p.stock}>Rent Now</button>
                            </div>
                        ))}
                    </section>

                    <div className="pagination">
                        <button>Prev</button>
                        <button className="active">1</button>
                        <button>2</button>
                        <button>3</button>
                        <button>Next</button>
                    </div>

                </main>
            </div>
        </>
    );
}

export default CustomerDashboard;

