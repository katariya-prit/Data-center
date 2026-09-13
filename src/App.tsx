import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Router from "./Routes/Router";
import { ThemeProvider } from "./context/ThemeContext";
import { EditorProvider } from "./context/EditorContext";
import { DragDropProvider } from "./system/drag-drop/DragDropContext";
import { SearchGuidProvider } from "./system/searchGuid"; // 👈 અહીંથી SpotlightSearch કાઢી નાખ્યું

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <EditorProvider>
                    <DragDropProvider>
                        <SearchGuidProvider>
                            <Toaster />
                            <Router />
                        </SearchGuidProvider>
                    </DragDropProvider>
                </EditorProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;