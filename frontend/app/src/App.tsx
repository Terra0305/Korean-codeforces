import './App.css';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Main from './components/Main';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './pages/SignupPage.tsx';
import Contest from './pages/Contest.tsx';
import CreateContest from './pages/admin/CreateContest.tsx';
import CreateProblem from './pages/admin/CreateProblem.tsx';
import Problem from './pages/Problem.tsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
              <Navbar />
              <Main />
            </>
          } />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/contest/:id" element={<Contest />} />
          <Route path="/admin/create-contest" element={<CreateContest />} />
          <Route path="/admin/create-problem" element={<CreateProblem />} />
          <Route path="/problem/:id" element={<Problem />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;