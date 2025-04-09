import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import { useEffect } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
const lowlight = createLowlight(common);

import "highlight.js/styles/atom-one-dark.css";

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

export const RichTextEditor = ({ content, onUpdate }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      ListItem,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const languages = [
    { value: "", label: "plain" },
    { value: "css", label: "CSS" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "json", label: "JSON" },
    { value: "python", label: "Python" },
    { value: "php", label: "PHP" },
    { value: "c", label: "C" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "shell", label: "Shell" },
    { value: "sql", label: "SQL" },
  ];

  const getActiveButtonStyles = (buttonName: string, attributes?: {}) =>
    `p-2 rounded cursor-pointer border border-gray-300 ${editor.isActive(buttonName, attributes) ? "bg-black text-white" : ""}`;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={getActiveButtonStyles("codeBlock")}
        >
          Code
        </button>

        <div className="flex items-center ml-1 mr-1">
          <select
            className="p-2 rounded border cursor-pointer hover:border-gray-400"
            onChange={(e) => {
              if (editor.isActive("codeBlock")) {
                editor
                  .chain()
                  .focus()
                  .updateAttributes("codeBlock", {
                    language: e.target.value,
                  })
                  .run();
              }
            }}
            value={
              editor.isActive("codeBlock")
                ? editor.getAttributes("codeBlock").language || ""
                : ""
            }
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={getActiveButtonStyles("bold")}
        >
          Bold
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={getActiveButtonStyles("heading", { level: 1 })}
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={getActiveButtonStyles("heading", { level: 2 })}
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={getActiveButtonStyles("heading", { level: 3 })}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={getActiveButtonStyles("italic")}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={getActiveButtonStyles("strike")}
        >
          Strike
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={getActiveButtonStyles("bulletList")}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={getActiveButtonStyles("orderedList")}
        >
          Numbered List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={getActiveButtonStyles("blockquote")}
        >
          Quote
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={getActiveButtonStyles("textAlign", { textAlign: "left" })}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={getActiveButtonStyles("textAlign", {
            textAlign: "center",
          })}
        >
          Center
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={getActiveButtonStyles("textAlign", { textAlign: "right" })}
        >
          Right
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={getActiveButtonStyles("horizontalRule")}
        >
          Horizontal rule
        </button>
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className={getActiveButtonStyles("unsetAllMarks")}
        >
          Clear marks
        </button>
        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className={getActiveButtonStyles("clearNodes")}
        >
          Clear nodes
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="prose max-w-none rich-text-editor-content"
      />

      {/* glob style */}
    </div>
  );
};
