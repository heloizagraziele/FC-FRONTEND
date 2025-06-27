import React from 'react';
import './CSS/LoginSignup.css';
import { useNavigate } from 'react-router-dom'; // <--- Importe useNavigate

const LoginSignup = () => {
  const navigate = useNavigate(); // <--- Inicialize useNavigate

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>Sign Up</h1>
        <div className="loginsignup-fields">
          <input type="text" placeholder='your name'/>
          <input type="text" placeholder='email address'/>
          <input type="password" placeholder='password'/>
        </div>
        <button>Continue</button>
        <p className="loginsignup-login">
          Already have an account? 
          <span 
            onClick={() => navigate('/login')} // <--- Adicione o onClick aqui
            style={{ cursor: 'pointer', textDecoration: 'underline' }} // <--- Opcional: Adiciona estilo para indicar que é clicável
          >
            Login here!
          </span>
        </p>
        <di className="loginsignup-agree">
          <input type="checkbox" name="" id=""/>
          <p>By continue, i agree to the terms of use privacy & policy.</p>
        </di>
        </div>
      
    </div>
  );
};

export default LoginSignup;