'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function RichTextEditor({ value, onChange, placeholder, disabled }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.clearContent()
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={`rounded-xl border ${disabled ? 'opacity-60' : 'border-white/10 focus-within:border-blue-500/50'} bg-slate-800/50 overflow-hidden transition-colors`}>
      {!disabled && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-white/5">
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          ><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          ><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading"
          ><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          ><List className="w-3.5 h-3.5" /></ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered list"
          ><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        </div>
      )}
      <EditorContent
        editor={editor}
        className="px-3 py-2.5 min-h-[120px] text-sm text-slate-200 [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-500 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-white"
      />
    </div>
  )
}

function ToolbarBtn({ onClick, active, title, children }: {
  onClick: () => void
  active: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${active ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
    >
      {children}
    </button>
  )
}
