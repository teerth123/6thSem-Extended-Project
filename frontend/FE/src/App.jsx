import './App.css';
import './index.css'
import {Routes, Route, BrowserRouter , useNavigate} from "react-router-dom"
import Login from '../component/Login';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import DirectoryPage from './pages/DirectoryPage';
import MessagingPage from './pages/MessagingPage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';


function App(){
  
  return(
    <>
      <BrowserRouter>
          <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path='/pfp' element={<ProfilePage/>}/>
            <Route path='/home' element={<DirectoryPage/>}/>
            <Route path='/msg' element={<MessagingPage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/signup' element={<SignupPage/>}/>

          </Routes>
      </BrowserRouter>  
    </>
  )
}

export default App;
