
  "use client";

import { useEffect, useState } from "react";

const Topbar = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  return (
    <header className="topbar">
      <input placeholder="Search" />

      <div className="icons">
        <button
          onClick={() => setDark(!dark)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
};

export default Topbar;
