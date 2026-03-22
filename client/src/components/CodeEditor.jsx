import Editor from '@monaco-editor/react';

const LANG_MAP = {
  "Python 3": "python",
  "JavaScript": "javascript",
  "Java": "java",
  "C++": "cpp",
};

export default function CodeEditor({ value, onChange, language, height }) {
  const monacoLang = LANG_MAP[language] || "python";

  const handleMount = (editor, monaco) => {
    // Define custom dark theme matching the app's color scheme
    monaco.editor.defineTheme('leetbattle', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'bd93f9', fontStyle: 'bold' },
        { token: 'string', foreground: '50fa7b' },
        { token: 'number', foreground: 'ffd32a' },
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'type', foreground: 'ffb86c' },
        { token: 'variable', foreground: '8be9fd' },
        { token: 'function', foreground: 'e8e8f4' },
        { token: 'delimiter', foreground: 'a09bc6' },
      ],
      colors: {
        'editor.background': '#080810',
        'editor.foreground': '#e8e8f4',
        'editor.lineHighlightBackground': '#0f0f1a',
        'editor.selectionBackground': '#2a2a4a',
        'editorCursor.foreground': '#a29bfe',
        'editorLineNumber.foreground': '#3a3a5c',
        'editorLineNumber.activeForeground': '#a29bfe',
        'editor.inactiveSelectionBackground': '#1a1a2e',
        'editorIndentGuide.background': '#1a1a2e',
        'editorIndentGuide.activeBackground': '#2a2a4a',
        'editorBracketMatch.background': '#2a2a4a',
        'editorBracketMatch.border': '#a29bfe',
      },
    });
    monaco.editor.setTheme('leetbattle');
  };

  return (
    <Editor
      height={height || "100%"}
      language={monacoLang}
      value={value}
      onChange={(val) => onChange(val || '')}
      onMount={handleMount}
      theme="leetbattle"
      loading={
        <div style={{ padding: 20, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Loading editor...
        </div>
      }
      options={{
        fontSize: 13,
        fontFamily: "'Space Mono', 'Fira Code', 'Consolas', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always',
        autoIndent: 'full',
        formatOnPaste: true,
        suggest: { showKeywords: true, showSnippets: true },
        quickSuggestions: true,
        wordWrap: 'on',
        padding: { top: 14 },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  );
}
