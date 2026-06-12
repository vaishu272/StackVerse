import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({
  onClick,
  isActive,
  title,
  children,
}: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg transition-colors cursor-pointer ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80"
    }`}
    title={title}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[300px] max-h-[600px] overflow-y-auto px-4 py-3 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-800 focus:border-indigo-500 transition-colors duration-200 text-sm md:text-base leading-relaxed ProseMirror",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="w-full h-[350px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse flex items-center justify-center text-slate-400">
        Loading rich text editor...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-t-xl theme-transition">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="w-4.5 h-4.5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4.5 h-4.5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code className="w-4.5 h-4.5" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          title="Undo"
        >
          <Undo className="w-4.5 h-4.5" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          title="Redo"
        >
          <Redo className="w-4.5 h-4.5" />
        </ToolbarButton>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
