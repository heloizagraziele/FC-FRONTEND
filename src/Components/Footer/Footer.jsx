import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <div className='footer'>
        <div className="footer-logo">
            <p>SHOPPER</p>
        </div>
        <ul className="footer-links">
            <li>Company</li>
            <li>Products</li>
            <li>About</li>
            <li>Contact</li>
        </ul>
        <div className="footer-social-icon">
            <div className="footer-icons-container">
            </div>
            <div className="footer-icons-container">
            </div>
        </div>
        <div className="footer-copyright">
            <hr/>
            <p>Copyrigth @ 2025 - All Right Reserved</p>
        </div>
    </div>
  )
}

export default Footer
