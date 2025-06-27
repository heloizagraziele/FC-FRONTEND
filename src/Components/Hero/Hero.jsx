import React from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow_icon.png';
import hero_image from '../Assets/hero_image.png';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>I'M GLAD YOU'RE HERE</h2>
        <div>
          <div className="hero-hand-icon">
            <p>Hello!</p>
          </div>
          <p>Ready to have a</p>
          <p>good night's sleep?</p>
        </div>
      </div>
    </div>
  );
};

export default Hero
