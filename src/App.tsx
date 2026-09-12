import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Router from "./Routes/Router";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Router />
    </AuthProvider>
  );
}

export default App;