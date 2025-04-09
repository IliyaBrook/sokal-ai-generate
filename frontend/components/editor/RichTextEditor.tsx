import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
} 

export const RichTextEditor = ({ content, onUpdate }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        codeBlock: {
          languageClassPrefix: 'language-',
          HTMLAttributes: {
            class: 'code-block',
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      ListItem,
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

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
        >
          Code
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          Bullet List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          Numbered List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
        >
          Quote
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
        >
          Code Block
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          Left
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          Center
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          Right
        </button>
       
      
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded"
        >
          Horizontal rule
        </button>
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="p-2 rounded"
        >
          Clear marks
        </button>
        <button
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="p-2 rounded"
        >
          Clear nodes
        </button>
      </div>

      
      <EditorContent
        editor={editor}
        className="prose max-w-none rich-text-editor-content"
      />

      <style jsx global>{`
        .rich-text-editor-content .code-block {
          background-color: #2d2d2d;
          color: #ccc;
          font-family: 'Courier New', Courier, monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
          font-size: 0.9rem;
          line-height: 1.5;
          tab-size: 2;
        }
        
        .rich-text-editor-content blockquote {
          border-left: 3px solid #ddd;
          padding-left: 1rem;
          color: #666;
          font-style: italic;
        }

        .rich-text-editor-content code:not(.code-block) {
          background-color: #f5f5f5;
          color: #e01e5a;
          font-family: 'Courier New', Courier, monospace;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
          font-weight: 500;
          border: 1px solid #eaeaea;
        }
      `}</style>
    </div>
  );
};
