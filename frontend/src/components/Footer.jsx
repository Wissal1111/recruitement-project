import React from "react";
import "./Footer.css";
import { FaShareAlt, FaGlobe } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        {/* LEFT */}
        <div className="footer-left">
          <h2 className="logo">LUCIDCURATOR</h2>
          <p className="description">
            The sophisticated standard for research,
            feedback, and participant engagement in the
            modern digital era.
          </p>

          <div className="icons">
            <div className="icon-circle">
              <FaShareAlt />
            </div>
            <div className="icon-circle">
              <FaGlobe />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="footer-links">
          <div>
            <h4>PLATFORM</h4>
            <p>Features</p>
            <p>Pricing</p>
            <p>Security</p>
          </div>

          <div>
            <h4>COMPANY</h4>
            <p>About</p>
            <p>Contact</p>
            <p>Careers</p>
          </div>

          <div>
            <h4>SUPPORT</h4>
            <p>FAQ</p>
            <p>Help Center</p>
            <p>Status</p>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>© 2024 LUCIDCURATOR INTELLIGENCE. ALL RIGHTS RESERVED.</p>

        <div className="bottom-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;