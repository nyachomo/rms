import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

/* ── Toolbar button ── */
function ToolBtn({ active, onClick, icon, title }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            style={{
                width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer',
                background: active ? '#081f4e' : 'transparent',
                color: active ? '#fff' : '#555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.75rem', transition: 'all .15s',
            }}
        >
            {icon}
        </button>
    );
}

function Divider() {
    return <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 2px' }} />;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start typing…', minHeight = 120 }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                style: `min-height:${minHeight}px; outline:none; padding:12px 14px; font-family:'Poppins',sans-serif; font-size:.88rem; color:#333; line-height:1.7;`,
            },
        },
    });

    /* Sync external value changes (e.g. when modal opens with existing data) */
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || '', false);
        }
    }, [value]);

    if (!editor) return null;

    const btn = (label, action, isActive, title) => (
        <ToolBtn key={label} active={isActive} onClick={action} icon={label} title={title} />
    );

    return (
        <div style={{ border: '1.5px solid #e4e7f0', borderRadius: 10, background: '#f8faff', overflow: 'hidden', transition: 'border-color .2s, box-shadow .2s' }}
            onFocus={() => {}} /* handled by :focus-within in CSS */>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '6px 10px', borderBottom: '1px solid #e8eaf0', background: '#fff', flexWrap: 'wrap' }}>
                {/* Headings */}
                <ToolBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"
                    icon={<span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.72rem' }}>H2</span>} />
                <ToolBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"
                    icon={<span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.72rem' }}>H3</span>} />
                <Divider />
                {/* Inline marks */}
                <ToolBtn active={editor.isActive('bold')}   onClick={() => editor.chain().focus().toggleBold().run()}   title="Bold"   icon={<strong style={{ fontSize: '.8rem' }}>B</strong>} />
                <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" icon={<em style={{ fontSize: '.8rem' }}>I</em>} />
                <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"
                    icon={<span style={{ textDecoration: 'line-through', fontSize: '.78rem', fontFamily: 'Poppins,sans-serif' }}>S</span>} />
                <ToolBtn active={editor.isActive('code')}   onClick={() => editor.chain().focus().toggleCode().run()}   title="Inline code"
                    icon={<i className="fas fa-code" style={{ fontSize: '.65rem' }}></i>} />
                <Divider />
                {/* Lists */}
                <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet list"
                    icon={<i className="fas fa-list-ul" style={{ fontSize: '.65rem' }}></i>} />
                <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"
                    icon={<i className="fas fa-list-ol" style={{ fontSize: '.65rem' }}></i>} />
                <ToolBtn active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote"
                    icon={<i className="fas fa-quote-left" style={{ fontSize: '.62rem' }}></i>} />
                <Divider />
                {/* Undo / Redo */}
                <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo"
                    icon={<i className="fas fa-undo" style={{ fontSize: '.62rem' }}></i>} />
                <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo"
                    icon={<i className="fas fa-redo" style={{ fontSize: '.62rem' }}></i>} />
                {/* Clear */}
                <Divider />
                <ToolBtn active={false} onClick={() => editor.chain().focus().clearContent(true).run()} title="Clear all"
                    icon={<i className="fas fa-trash-alt" style={{ fontSize: '.62rem', color: '#ef4444' }}></i>} />
            </div>
            {/* Editor area */}
            <div className="rte-content" style={{ background: '#f8faff' }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
