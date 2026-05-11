"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
};

export function RichTextEditor({ value, onChange, minHeight = "min-h-32" }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addLink = () => {
    const url = window.prompt("URL del enlace:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  };

  if (!mounted) {
    return (
      <div
        className={`${minHeight} rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-400`}
      >
        Cargando editor...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <Btn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold") ?? false} title="Negrita">
          <Bold size={14} />
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic") ?? false} title="Itálica">
          <Italic size={14} />
        </Btn>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <Btn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList") ?? false} title="Lista">
          <List size={14} />
        </Btn>
        <Btn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList") ?? false} title="Lista numerada">
          <ListOrdered size={14} />
        </Btn>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <Btn onClick={addLink} active={editor?.isActive("link") ?? false} title="Agregar enlace">
          <LinkIcon size={14} />
        </Btn>
        <div className="mx-1 w-px self-stretch bg-slate-300" />
        <Btn onClick={() => editor?.chain().focus().undo().run()} active={false} title="Deshacer">
          <Undo size={14} />
        </Btn>
        <Btn onClick={() => editor?.chain().focus().redo().run()} active={false} title="Rehacer">
          <Redo size={14} />
        </Btn>
      </div>
      <EditorContent
        editor={editor}
        className={`${minHeight} px-4 py-3 text-sm text-slate-900 [&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror]:outline-none [&_.ProseMirror_a]:text-emerald-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5`}
      />
    </div>
  );
}

function Btn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 ${active ? "bg-emerald-100 text-emerald-700" : ""}`}
    >
      {children}
    </button>
  );
}
