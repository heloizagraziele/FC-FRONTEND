import React, { useState, useContext, useRef, useEffect } from 'react'; 
import './Navbar.css';

import logo from '../Assets/good_dreams_logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { Link, useNavigate } from 'react-router-dom'; 
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/nav_dropdown.png';

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { getTotalCartItems } = useContext(ShopContext);
    const menuRef = useRef();
    const navigate = useNavigate(); 
  
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState(null);

    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem('token');
            const name = localStorage.getItem('customerName');
            const id = localStorage.getItem('customerId');

            if (token && name && id) {
                setIsLoggedIn(true);
                setCustomerName(name);
                setCustomerId(id);
            } else {
                setIsLoggedIn(false);
                setCustomerName('');
                setCustomerId(null);
            }
        };


        checkLoginStatus();

        window.addEventListener('storage', checkLoginStatus);
        window.addEventListener('localStorageChange', checkLoginStatus);

 
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            window.removeEventListener('localStorageChange', checkLoginStatus);
        };
    }, []); 


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerId');
        localStorage.removeItem('customerEmail'); 

        window.dispatchEvent(new Event('localStorageChange')); 

        alert("Você foi desconectado.");
        navigate('/login');
    };

    const dropdown_toggle = (e) => {
        menuRef.current.classList.toggle('nav-menu-visible');
        e.target.classList.toggle('open');
    };

    return (
        <div className='navbar'>
            <div className="nav-logo">
                <Link style={{textDecoration: 'none'}} to='/'>
                    <img src={logo} alt="" />
                    <p>Good Dreams</p>
                </Link>
            </div>
            <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="" />
            <ul ref={menuRef} className="nav-menu">
                <li onClick={() => { setMenu("shop") }}><Link style={{ textDecoration: 'none' }} to='/'>home</Link>{menu === "shop" ? <hr /> : <></>}</li>
                <li onClick={() => { setMenu("winter") }}><Link style={{ textDecoration: 'none' }} to='/shop'>products</Link>{menu === "winter" ? <hr /> : <></>}</li>
            </ul>

            <div className="nav-login-cart">
                {isLoggedIn ? (
                    
                    <>
                        <button onClick={() => navigate(`/profile`)} className="profile-button">
                            Olá, {customerName.split(' ')[0]} 
                        </button>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </>
                ) : (
                    
                    <Link to='/login'>
                        <button>Login</button>
                    </Link>
                )}
                <Link to='/cart'><img src={cart_icon} alt="" /></Link>
                <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
        </div>
    );
};

export default Navbar;