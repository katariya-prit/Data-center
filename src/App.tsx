import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Router from "./Routes/Router";
import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider } from "./context/EditorContext";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <EditorProvider>
                    <Toaster />
                    <Router />
                </EditorProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;