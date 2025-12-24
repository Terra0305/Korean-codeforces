import './App.css';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';

function App() {
  return (
    <AuthProvider>
      <Navbar />
    </AuthProvider>
  );
}

export default App;