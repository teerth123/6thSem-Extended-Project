// App.js

import './App.css';
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import Login from '../component/Login';

function Home() {
  const nav = useNavigate();
  return (
    <div className='landingPage w-screen'>
      <div className='navBar flex justify-around w-screen bg-red-500 text-white p-4'>
        <button>Sign up</button>
        <button>Login</button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
