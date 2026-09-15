import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Router from "./Routes/Router";
import { ThemeProvider } from "./context/ThemeContext";
import { DragDropProvider } from "./system/drag-drop/DragDropContext";
import { SearchGuidProvider } from "./system/searchGuid";
import { SyncProvider } from "./system/sync/SyncContext";

function App() {
    // navu: OS/browser no NATIVE right-click menu SAMPUN app mate block karo.
    // Aa global safety-net chhe — jya pan koi component ma local
    // onContextMenu handler chhuti jay, native menu kadi nahi khule.
    // Custom glass-style ContextMenu (system/EXTinformation) alag thi
    // potana onContextMenu handlers thi khule chhe — e aathi affect nathi thatu.
    useEffect(() => {
        const preventNativeContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener("contextmenu", preventNativeContextMenu);
        return () => document.removeEventListener("contextmenu", preventNativeContextMenu);
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <SyncProvider>
                    <DragDropProvider>
                        <SearchGuidProvider>
                            <Toaster />
                            <Router />
                        </SearchGuidProvider>
                    </DragDropProvider>
                </SyncProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;