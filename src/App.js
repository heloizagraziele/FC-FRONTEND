import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import AddressForm from './Components/AddressForm/AddressForm';
import woman_banner from './Components/Assets/woman_banner.png';
import Payment from './Components/Payment/Payment';

// IMPORTAÇÃO DO CONTEXTO
import ShopContextProvider from './Context/ShopContext';
import Login from './Pages/Login';
import Profile from './Pages/Profile';

function App() {
  return (
    // PROVIDER ENVOLVENDO TODA A APLICAÇÃO
    <ShopContextProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/shop' element={<ShopCategory category="winter" />} />
          <Route path="/product" element={<Product />}>
            <Route path=':productId' element={<Product />} />
          </Route>
          <Route path='/cart' element={<Cart />} />
          <Route path='/signup' element={<LoginSignup />} />
          <Route path='/login' element={<Login/>} />
          <Route path='/profile/addresses' element={<AddressForm/>}/>
          <Route path='/checkout' element={<Payment/>} />
          <Route path='/profile' element={<Profile/>} />
        </Routes>
       { /*<Footer />*/}
      </BrowserRouter>
    </ShopContextProvider>
  );
}

export default App;
