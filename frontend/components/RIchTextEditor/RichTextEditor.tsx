import "./RichTextEditor.scss";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useState } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common, all } from "lowlight";
import dynamic from 'next/dynamic';

import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import typescript from 'highlight.js/lib/languages/typescript'

// const lowlight = createLowlight(common);
const lowlight = createLowlight(all);
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

import "highlight.js/styles/atom-one-dark.css";

interface RichTextEditorProps {
  content: string;
  onUpdate: (content: string) => void;
}

// Создаем компонент с отключенным SSR
const RichTextEditorWithNoSSR = ({ content, onUpdate }: RichTextEditorProps) => {
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
        // Убрать listItem из StarterKit, так как мы импортируем его отдельно
        listItem: false,
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
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

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
    </div>
  );
};

export const RichTextEditor = dynamic(
  () => Promise.resolve(RichTextEditorWithNoSSR),
  { ssr: false }
);
