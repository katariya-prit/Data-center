
import CodeEditor from "./core/CodeEditor";
import { EditorProvider } from "../../context/EditorContext";

export default function CodeEditorApp() {
  return (
    <EditorProvider diskId={""} children={undefined}>
      <div className="h-full w-full overflow-hidden bg-[#151721]">
        <CodeEditor />
      </div>
    </EditorProvider>
  );
}