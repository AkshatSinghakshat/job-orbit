import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

export default function ProtectedCodeEditor() {
  const editorRef = useRef(null);
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState("");

  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    const showWarning = () => {
      setViolations((count) => count + 1);
      setWarning("Copy-paste allowed nahi hai. Code khud type karo.");
    };

    // Block Ctrl/Cmd + C, V and X inside Monaco.
    editor.onKeyDown((event) => {
      const browserEvent = event.browserEvent;
      const isShortcut = browserEvent.ctrlKey || browserEvent.metaKey;
      const key = browserEvent.key.toLowerCase();

      if (isShortcut && ["c", "v", "x"].includes(key)) {
        browserEvent.preventDefault();
        browserEvent.stopPropagation();
        showWarning();
      }
    });

    const domNode = editor.getDomNode();
    if (!domNode) return;

    // Disable Monaco's right-click menu.
    editor.updateOptions({ contextmenu: false });

    // Block clipboard events inside the editor.
    const blockClipboard = (event) => {
      event.preventDefault();
      event.stopPropagation();
      showWarning();
    };

    domNode.addEventListener("copy", blockClipboard, true);
    domNode.addEventListener("cut", blockClipboard, true);
    domNode.addEventListener("paste", blockClipboard, true);
    domNode.addEventListener("contextmenu", blockClipboard, true);

    // Keep cleanup available when the editor is disposed.
    editor.onDidDispose(() => {
      domNode.removeEventListener("copy", blockClipboard, true);
      domNode.removeEventListener("cut", blockClipboard, true);
      domNode.removeEventListener("paste", blockClipboard, true);
      domNode.removeEventListener("contextmenu", blockClipboard, true);
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-3">
        <span className="font-semibold text-white">CodeArena Editor</span>
        <span className="text-sm text-amber-400">
          Violations: {violations}
        </span>
      </div>

      {warning && (
        <div
          role="alert"
          className="bg-red-900/40 px-4 py-3 text-sm text-red-300"
        >
          {warning}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setWarning("")}
          >
            Dismiss
          </button>
        </div>
      )}

      <Editor
        height="400px"
        defaultLanguage="javascript"
        defaultValue="// Yahan apna code likho"
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          contextmenu: false,
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}