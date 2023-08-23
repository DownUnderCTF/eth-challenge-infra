import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Home from './components/Home'

const queryClient = new QueryClient()

function App() {

  return (
    <QueryClientProvider client={queryClient} >
      <Home />
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} limit={5} />
    </QueryClientProvider>
  )
}

export default App

