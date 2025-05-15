
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { isSupabaseConnected } from './lib/supabaseClient'
import { toast } from './hooks/use-toast'
import { Toaster } from './components/ui/toaster'

// Check if Supabase is connected
if (!isSupabaseConnected()) {
  console.warn('Supabase is not connected. The app will use in-memory storage instead of persisting data.')
  
  // We'll display this toast after the app renders
  setTimeout(() => {
    toast({
      title: "⚠️ Supabase Not Connected",
      description: "To persist data, connect to Supabase using the green Supabase button in the top right corner.",
      variant: "warning",
      duration: 10000 // Show for 10 seconds
    })
  }, 1000)
}

const root = createRoot(document.getElementById("root")!)

root.render(
  <>
    <App />
    <Toaster />
  </>
)
