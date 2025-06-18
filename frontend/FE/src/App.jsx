import './App.css';
import {Routes, Route, BrowserRouter , useNavigate} from "react-router-dom"
import Login from '../component/Login';

function Home() {
  const nav = useNavigate()
  return (
    <>
      <h1>home page</h1>
       <button onClick={()=>{nav("/login")}}>Login</button>
    </>
  );
}

export default App;

function App(){
  
  return(
    <>
      <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<Login/>}/>
          </Routes>
      </BrowserRouter>  
    </>
  )
}