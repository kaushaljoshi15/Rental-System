import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        {/* Stats */}
        <section className="stats-grid">
          <StatCard title="Total Revenue" value="$854,320" extra="📈" />
          <StatCard title="Most Rented Products" value="DSLR Camera" sub="x1200" />
          <StatCard title="Active Vendors" value="156" />
          <StatCard title="Overall Utilization" value="78%" />
        </section>

        {/* Analytics */}
        <section className="analytics">
          <div className="analytics-header">
            <h2>Global Analytics</h2>
            <button>Export</button>
          </div>

          <div className="analytics-grid">
            <div className="chart-box">
              <h3>Quarterly Order Trends</h3>
              <div className="chart-placeholder">
                {/* Chart library can be plugged here */}
                Line Chart Area
              </div>
            </div>

            <div className="side-cards">
              <div className="vendor-card">
                <h4>Vendor Performance</h4>
                <p>Vendor A — $120,500</p>
                <p>Vendor B — $98,120</p>
              </div>

              <div className="vendor-card">
                <h4>Top Rented Products</h4>
                <p>DSLR Camera</p>
              </div>
            </div>
          </div>
        </section>

        {/* Orders */}
        <section className="orders">
          <h2>Recent Orders</h2>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Vendor</th>
                <th>Start Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>DSLR Camera</td>
                <td>1</td>
                <td>250 times</td>
                <td>250 times</td>
                <td>Ongoing</td>
              </tr>
              <tr>
                <td>HD Projector</td>
                <td>12</td>
                <td>180 times</td>
                <td>180 times</td>
                <td>Completed</td>
              </tr>
            </tbody>
          </table>

          <button className="download-btn">Download Report</button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
