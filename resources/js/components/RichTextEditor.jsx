import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

/* ── Toolbar button ── */
function ToolBtn({ active, onClick, icon, title, danger }) {
    return (
        <button
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); onClick(); }}
            style={{
                width: 30, height: 30, border: 'none', borderRadius: 6, cursor: 'pointer',
                background: active ? '#081f4e' : 'transparent',
                color: active ? '#fff' : danger ? '#ef4444' : '#555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.75rem', transition: 'all .15s',
            }}
        >
            {icon}
        </button>
    );
}

function Divider() {
    return <div style={{ width: 1, height: 20, background: '#e2e8f0', margin: '0 4px' }} />;
}

/* Convert a File/Blob to base64 data URL */
function fileToBase64(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start typing…', minHeight = 200 }) {
    const fileInputRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            Underline,
            Image.configure({ inline: false, allowBase64: true }),
            Link.configure({ openOnClick: false, autolink: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                style: `min-height:${minHeight}px; outline:none; padding:14px 16px; font-family:'Poppins',sans-serif; font-size:.9rem; color:#1e293b; line-height:1.8;`,
            },
            /* Handle paste: intercept image files in clipboard */
            handlePaste(view, event) {
                const items = event.clipboardData?.items ?? [];
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault();
                        fileToBase64(item.getAsFile()).then(src => {
                            view.dispatch(
                                view.state.tr.replaceSelectionWith(
                                    view.state.schema.nodes.image.create({ src })
                                )
                            );
                        });
                        return true;
                    }
                }
                return false;
            },
            /* Handle drop: accept image files dragged in */
            handleDrop(view, event) {
                const files = event.dataTransfer?.files ?? [];
                const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
                if (!imageFile) return false;
                event.preventDefault();
                const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
                fileToBase64(imageFile).then(src => {
                    const tr = view.state.tr;
                    const node = view.state.schema.nodes.image.create({ src });
                    view.dispatch(tr.insert(coords?.pos ?? 0, node));
                });
                return true;
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

    /* Insert image from local file picker */
    async function insertFromFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const src = await fileToBase64(file);
        editor.chain().focus().setImage({ src }).run();
    }

    /* Insert image from URL prompt */
    function insertFromUrl() {
        const url = window.prompt('Enter image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    }

    /* Set / unset link */
    function handleLink() {
        if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
        } else {
            const url = window.prompt('Enter URL (include https://)');
            if (url) editor.chain().focus().setLink({ href: url }).run();
        }
    }

    return (
        <div style={{ border: '1.5px solid #e4e7f0', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
            {/* ── Toolbar ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 1, padding: '7px 10px',
                borderBottom: '1px solid #e8eaf0', background: '#f8faff', flexWrap: 'wrap', rowGap: 4,
            }}>
                {/* Headings */}
                <ToolBtn active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    title="Heading 2"
                    icon={<span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.72rem' }}>H2</span>} />
                <ToolBtn active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    title="Heading 3"
                    icon={<span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '.72rem' }}>H3</span>} />
                <Divider />

                {/* Inline marks */}
                <ToolBtn active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold"
                    icon={<strong style={{ fontSize: '.8rem', fontFamily: 'Georgia,serif' }}>B</strong>} />
                <ToolBtn active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic"
                    icon={<em style={{ fontSize: '.8rem', fontFamily: 'Georgia,serif' }}>I</em>} />
                <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"
                    icon={<span style={{ textDecoration: 'underline', fontSize: '.78rem', fontFamily: 'Georgia,serif' }}>U</span>} />
                <ToolBtn active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Strikethrough"
                    icon={<span style={{ textDecoration: 'line-through', fontSize: '.78rem', fontFamily: 'Georgia,serif' }}>S</span>} />
                <ToolBtn active={editor.isActive('code')}      onClick={() => editor.chain().focus().toggleCode().run()}      title="Inline code"
                    icon={<i className="fas fa-code" style={{ fontSize: '.62rem' }}></i>} />
                <Divider />

                {/* Alignment */}
                <ToolBtn active={editor.isActive({ textAlign: 'left' })}    onClick={() => editor.chain().focus().setTextAlign('left').run()}    title="Align left"
                    icon={<i className="fas fa-align-left"    style={{ fontSize: '.62rem' }}></i>} />
                <ToolBtn active={editor.isActive({ textAlign: 'center' })}  onClick={() => editor.chain().focus().setTextAlign('center').run()}  title="Align center"
                    icon={<i className="fas fa-align-center"  style={{ fontSize: '.62rem' }}></i>} />
                <ToolBtn active={editor.isActive({ textAlign: 'right' })}   onClick={() => editor.chain().focus().setTextAlign('right').run()}   title="Align right"
                    icon={<i className="fas fa-align-right"   style={{ fontSize: '.62rem' }}></i>} />
                <Divider />

                {/* Lists & Blockquote */}
                <ToolBtn active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet list"
                    icon={<i className="fas fa-list-ul"   style={{ fontSize: '.62rem' }}></i>} />
                <ToolBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"
                    icon={<i className="fas fa-list-ol"   style={{ fontSize: '.62rem' }}></i>} />
                <ToolBtn active={editor.isActive('blockquote')}  onClick={() => editor.chain().focus().toggleBlockquote().run()}  title="Blockquote"
                    icon={<i className="fas fa-quote-left" style={{ fontSize: '.62rem' }}></i>} />
                <Divider />

                {/* Link */}
                <ToolBtn active={editor.isActive('link')} onClick={handleLink} title={editor.isActive('link') ? 'Remove link' : 'Add link'}
                    icon={<i className="fas fa-link" style={{ fontSize: '.62rem' }}></i>} />
                <Divider />

                {/* Image */}
                <ToolBtn active={false} onClick={() => fileInputRef.current?.click()} title="Insert image from file"
                    icon={<i className="fas fa-image" style={{ fontSize: '.65rem' }}></i>} />
                <ToolBtn active={false} onClick={insertFromUrl} title="Insert image from URL"
                    icon={<i className="fas fa-external-link-alt" style={{ fontSize: '.6rem' }}></i>} />
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { insertFromFile(e.target.files[0]); e.target.value = ''; }} />
                <Divider />

                {/* Undo / Redo */}
                <ToolBtn active={false} onClick={() => editor.chain().focus().undo().run()} title="Undo"
                    icon={<i className="fas fa-undo" style={{ fontSize: '.6rem' }}></i>} />
                <ToolBtn active={false} onClick={() => editor.chain().focus().redo().run()} title="Redo"
                    icon={<i className="fas fa-redo" style={{ fontSize: '.6rem' }}></i>} />
                <Divider />
                <ToolBtn active={false} onClick={() => editor.chain().focus().clearContent(true).run()} title="Clear all" danger
                    icon={<i className="fas fa-trash-alt" style={{ fontSize: '.6rem' }}></i>} />
            </div>

            {/* ── Editor area ── */}
            <style>{`
                .rte-body .tiptap { outline: none; }
                .rte-body .tiptap img { max-width: 100%; border-radius: 8px; margin: 8px 0; display: block; cursor: pointer; }
                .rte-body .tiptap img.ProseMirror-selectednode { outline: 3px solid #3b82f6; border-radius: 8px; }
                .rte-body .tiptap h2 { font-size: 1.3rem; font-weight: 800; color: #081f4e; margin: 1.1rem 0 .4rem; }
                .rte-body .tiptap h3 { font-size: 1.05rem; font-weight: 700; color: #1e3a5f; margin: .9rem 0 .3rem; }
                .rte-body .tiptap ul, .rte-body .tiptap ol { padding-left: 1.4rem; }
                .rte-body .tiptap li { margin-bottom: .2rem; }
                .rte-body .tiptap blockquote { border-left: 4px solid #cbd5e1; margin: .8rem 0; padding: 4px 12px; color: #64748b; font-style: italic; }
                .rte-body .tiptap code { background: #f1f5f9; border-radius: 4px; padding: 1px 5px; font-family: monospace; font-size: .85em; color: #e11d48; }
                .rte-body .tiptap a { color: #2563eb; text-decoration: underline; }
                .rte-body .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #adb5c2; pointer-events: none; float: left; height: 0; font-style: italic; }
            `}</style>
            <div className="rte-body" style={{ background: '#fff' }}>
                <EditorContent editor={editor} />
            </div>

            {/* Tip bar */}
            <div style={{ padding: '5px 14px', borderTop: '1px solid #f0f2f7', background: '#f8faff', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fas fa-paste"></i> Paste image directly from clipboard
                </span>
                <span style={{ fontSize: '.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="fas fa-image"></i> Or use the toolbar image button
                </span>
            </div>
        </div>
    );
}
