import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopNavBar.css';
import Sandwitch from '../../assets/icons/Sandwitch';

export default function TopNavBar() {
  const [list, setList] = useState("Features");
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="navbar">
        {/* LEFT (mobile logo + sandwich) */}
        <div className="mobile-menu-logo">
          <div
            className="sandwitch"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <Sandwitch />
          </div>
          <h1 className="logo">LucidCurator</h1>
        </div>

        {/* DESKTOP MENU */}
        <ul className="nav-elements">
          <Link>
            <li
              className={list === "Features" ? "selected-element" : ""}
              onClick={() => setList("Features")}
            >
              Features
            </li>
          </Link>

          <Link>
            <li
              className={list === "Methodology" ? "selected-element" : ""}
              onClick={() => setList("Methodology")}
            >
              Methodology
            </li>
          </Link>

          <Link>
            <li
              className={list === "Showcase" ? "selected-element" : ""}
              onClick={() => setList("Showcase")}
            >
              Showcase
            </li>
          </Link>

          <Link>
            <li
              className={list === "Pricing" ? "selected-element" : ""}
              onClick={() => setList("Pricing")}
            >
              Pricing
            </li>
          </Link>
        </ul>

        {/* DESKTOP BUTTONS */}
        <div className="btns">
          <button
            className="btn transparent"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>

          <button
            className="btn linear"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {openMenu && (
        <div className="mobile-menu">
          <ul>
            <li onClick={() => { setList("Features"); setOpenMenu(false); }}>
              Features
            </li>
            <li onClick={() => { setList("Methodology"); setOpenMenu(false); }}>
              Methodology
            </li>
            <li onClick={() => { setList("Showcase"); setOpenMenu(false); }}>
              Showcase
            </li>
            <li onClick={() => { setList("Pricing"); setOpenMenu(false); }}>
              Pricing
            </li>
          </ul>
        </div>
      )}
    </>
  );
}