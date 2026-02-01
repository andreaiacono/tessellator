import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/Layout/AppLayout';
import './App.css';

function App() {
  return (
    <>
      <AppLayout />
      <Toaster position="top-right" />
    </>
  );
}

export default App;
