import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import {
  FiBold, FiItalic, FiUnderline, FiLink, FiImage,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiList,
  FiCode, FiYoutube, FiMinus, FiType
} from 'react-icons/fi'
import { useCallback } from 'react'

const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg text-sm transition-all ${
      active
        ? 'bg-cosmos-600 text-white'
        : 'text-slate-400 hover:text-white hover:bg-white/10'
    } disabled:opacity-30`}
  >
    {children}
  </button>
)

const Divider = () => <div className="w-px h-6 bg-cosmos-900 mx-1" />

export default function RichEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Youtube.configure({ controls: true }),
      Placeholder.configure({ placeholder: placeholder || 'Yozing...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'ProseMirror min-h-[350px] p-4 focus:outline-none',
      },
    },
  })

  const addImage = useCallback(() => {
    const url = prompt('Rasm URL kiriting:')
    if (url) editor?.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = prompt('URL kiriting:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }, [editor])

  const addYoutube = useCallback(() => {
    const url = prompt('YouTube URL kiriting:')
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run()
  }, [editor])

  const COLORS = ['#ffffff', '#f1f5f9', '#94a3b8', '#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  const HIGHLIGHTS = ['rgba(251,191,36,0.3)', 'rgba(99,102,241,0.3)', 'rgba(236,72,153,0.3)', 'rgba(16,185,129,0.3)']

  if (!editor) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(15,23,42,0.8)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-3 border-b border-cosmos-900/50">
        {/* Text style */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <FiBold />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <FiItalic />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <FiUnderline />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
          <FiCode />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        {[1, 2, 3].map(level => (
          <ToolbarButton key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            active={editor.isActive('heading', { level })}
            title={`Heading ${level}`}>
            <span className="text-xs font-bold">H{level}</span>
          </ToolbarButton>
        ))}

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left">
          <FiAlignLeft />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
          <FiAlignCenter />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right">
          <FiAlignRight />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <FiList />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
          <span className="text-xs font-bold">1.</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <span className="text-xs font-bold">"</span>
        </ToolbarButton>

        <Divider />

        {/* Media */}
        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Link">
          <FiLink />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Image">
          <FiImage />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} title="YouTube">
          <FiYoutube />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <FiMinus />
        </ToolbarButton>

        <Divider />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <FiType className="text-slate-500 text-xs" />
          {COLORS.map(color => (
            <button key={color} type="button"
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="w-4 h-4 rounded-full border border-white/10 hover:scale-125 transition-transform"
              style={{ background: color }}
              title={`Color: ${color}`}
            />
          ))}
        </div>

        <Divider />

        {/* Highlights */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">HL</span>
          {HIGHLIGHTS.map(color => (
            <button key={color} type="button"
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
              className="w-4 h-4 rounded border border-white/10 hover:scale-125 transition-transform"
              style={{ background: color }}
              title="Highlight"
            />
          ))}
          <button type="button"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="text-xs text-slate-500 hover:text-white px-1"
            title="Remove highlight">✕</button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Word count */}
      <div className="px-4 py-2 border-t border-cosmos-900/30 text-xs text-slate-600 flex justify-between">
        <span>{editor.storage.characterCount?.words?.() || 0} so'z</span>
        <span>{editor.storage.characterCount?.characters?.() || 0} belgi</span>
      </div>
    </div>
  )
}
