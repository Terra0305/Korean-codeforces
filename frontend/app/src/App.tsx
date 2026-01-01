import './App.css';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage.tsx';
import Contest from './pages/Contest.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navbar />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/contest/:id" element={<Contest />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;