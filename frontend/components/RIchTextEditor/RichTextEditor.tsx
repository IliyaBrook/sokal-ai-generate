import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import dynamic from "next/dynamic";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "./RichTextEditor.scss";

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import {
  default as ts,
  default as typescript,
} from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

const lowlight = createLowlight(all);
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);
lowlight.register("typescript", typescript);

import "highlight.js/scss/atom-one-dark.scss";

export interface RichTextEditorRef {
  updateContent: (newContent: string) => void;
  getEditor: () => Editor | null;
}

interface RichTextEditorProps {
  content: string;
  onUpdate?: (content: string) => void;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const RichTextEditorWithNoSSR = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(({ content, onUpdate, editable, onFocus, onBlur }, ref) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const prevContentRef = useRef<string>(content);

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
      if (onUpdate && typeof onUpdate === "function") {
        onUpdate(editor.getHTML());
      }
    },
    onFocus: () => {
      if (onFocus) {
        onFocus();
      }
    },
    onBlur: () => {
      if (onBlur) {
        onBlur();
      }
    },
    editable: editable,
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(!!editable);
    }
  }, [editor, editable]);

  useImperativeHandle(
    ref,
    () => ({
      updateContent: (newContent: string) => {
        if (editor && newContent !== prevContentRef.current) {
          const currentSelection = editor.state.selection;
          const isFocused = editor.isFocused;
          const currentPos = currentSelection.$from.pos;

          const hasSelection = !currentSelection.empty;
          const selectionStart = hasSelection ? currentSelection.from : null;
          const selectionEnd = hasSelection ? currentSelection.to : null;

          editor.commands.setContent(newContent, false);
          prevContentRef.current = newContent;

          if (isFocused) {
            editor.commands.focus();

            if (
              hasSelection &&
              selectionStart !== null &&
              selectionEnd !== null
            ) {
              editor.commands.setTextSelection({
                from: Math.min(selectionStart, editor.state.doc.content.size),
                to: Math.min(selectionEnd, editor.state.doc.content.size),
              });
            } else if (currentPos) {
              const safePos = Math.min(
                currentPos,
                editor.state.doc.content.size
              );
              editor.commands.setTextSelection(safePos);
            }
          }
        }
      },
      getEditor: () => editor,
    }),
    [editor]
  );

  useEffect(() => {
    if (editor && content !== prevContentRef.current) {
      prevContentRef.current = content;
      const editorHtml = editor.getHTML();
      if (content !== editorHtml) {
        const isFocused = editor.isFocused;
        const currentSelection = editor.state.selection;
        editor.commands.setContent(content, false);
        if (isFocused) {
          editor.commands.focus();
          if (!currentSelection.empty) {
            editor.commands.setTextSelection({
              from: Math.min(
                currentSelection.from,
                editor.state.doc.content.size
              ),
              to: Math.min(currentSelection.to, editor.state.doc.content.size),
            });
          }
        }
      }
    }
  }, [editor, content]);
  RichTextEditorWithNoSSR.displayName = 'RichTextEditorWithNoSSR';
  
  
  if (!editor) {
    return null;
  }

  const getActiveButtonStyles = (buttonName: string, attributes?: Record<string, any>) =>
    `p-2 rounded cursor-pointer border border-gray-300 ${editor.isActive(buttonName, attributes) ? "bg-black text-white" : ""}`;

  return (
    <div className="border rounded-lg p-4" ref={editorContainerRef}>
      {editable && (
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
            className={getActiveButtonStyles("textAlign", {
              textAlign: "left",
            })}
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
            className={getActiveButtonStyles("textAlign", {
              textAlign: "right",
            })}
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
      )}

      <EditorContent
        editor={editor}
        className="prose max-w-none rich-text-editor-content"
      />
    </div>
  );
});

export const RichTextEditor = dynamic(
  () => Promise.resolve(RichTextEditorWithNoSSR),
  { ssr: false }
);
