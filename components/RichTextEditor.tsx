import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Eraser, List, ListOrdered, 
  Outdent, Indent, Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon, Minus, Palette 
} from 'lucide-react';

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const exec = (command: string, arg?: string) => {
    if (typeof document === 'undefined') return;
    document.execCommand(command, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleTable = () => {
    const table = `<table style="width:100%; border: 1px solid #cbd5e1; border-collapse: collapse; margin: 10px 0;">
      <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 1</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 2</td></tr>
      <tr><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 3</td><td style="border: 1px solid #cbd5e1; padding: 8px;">Celda 4</td></tr>
    </table><p><br></p>`;
    exec("insertHTML", table);
  };

  const handleImage = () => {
    if (typeof window === 'undefined') return;
    const imageUrl = window.prompt('URL de la imagen:');
    if (!imageUrl) return;

    const linkUrl = window.prompt('URL de enlace opcional (deja vacío si no deseas enlace):');
    const width = window.prompt('Ancho deseado (ej. 100%, 500px):', '100%');

    let imgHtml = `<img src="${imageUrl}" 
      style="width: ${width || '100%'}; max-width: 100%; height: auto; display: inline-block; vertical-align: middle; margin: 10px 0; border-radius: 8px; resize: both; overflow: hidden; cursor: pointer; border: 2px solid transparent;" 
      class="editor-resizable-img" 
      alt="Imagen insertada" />`;

    if (linkUrl && linkUrl.trim() !== '') {
      imgHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`;
    }

    exec("insertHTML", imgHtml + '<p><br></p>');
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-all hover:bg-slate-200 border border-transparent hover:border-slate-300 ${
        active ? 'bg-slate-200 shadow-inner' : 'text-slate-700'
      }`}
    >
      <Icon size={15} strokeWidth={2.5} />
    </button>
  );

  return (
    <div className="w-full flex flex-col border border-slate-300 rounded-[12px] bg-[#fdfdfd] shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
      <style>{`
        .editor-resizable-img:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .editor-resizable-img {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
      `}</style>
      
      <div className="bg-[#f0f2f5] border-b border-slate-300 p-1.5 flex flex-wrap items-center gap-1">
        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('bold')} icon={Bold} title="Negrita" />
          <ToolbarButton onClick={() => exec('italic')} icon={Italic} title="Cursiva" />
          <ToolbarButton onClick={() => exec('underline')} icon={Underline} title="Subrayado" />
          <ToolbarButton onClick={() => exec('strikeThrough')} icon={Strikethrough} title="Tachado" />
          <ToolbarButton onClick={() => exec('removeFormat')} icon={Eraser} title="Limpiar formato (Tx)" />
        </div>
        
        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('insertUnorderedList')} icon={List} title="Viñetas" />
          <ToolbarButton onClick={() => exec('insertOrderedList')} icon={ListOrdered} title="Lista numerada" />
          <ToolbarButton onClick={() => exec('outdent')} icon={Outdent} title="Reducir sangría" />
          <ToolbarButton onClick={() => exec('indent')} icon={Indent} title="Aumentar sangría" />
          <ToolbarButton onClick={() => exec('formatBlock', 'blockquote')} icon={Quote} title="Cita" />
        </div>

        <div className="flex gap-0.5 pr-1 border-r border-slate-400">
          <ToolbarButton onClick={() => exec('justifyLeft')} icon={AlignLeft} title="Izquierda" />
          <ToolbarButton onClick={() => exec('justifyCenter')} icon={AlignCenter} title="Centro" />
          <ToolbarButton onClick={() => exec('justifyRight')} icon={AlignRight} title="Derecha" />
          <ToolbarButton onClick={() => exec('justifyFull')} icon={AlignJustify} title="Justificado" />
        </div>

        <div className="flex gap-0.5 items-center">
          <ToolbarButton onClick={() => {if(typeof window !== 'undefined') { const url = window.prompt('URL:'); if(url) exec('createLink', url)}}} icon={LinkIcon} title="Enlace" />
          <ToolbarButton onClick={handleImage} icon={ImageIcon} title="Insertar Imagen Avanzada" />
          <ToolbarButton onClick={handleTable} icon={TableIcon} title="Tabla" />
          <ToolbarButton onClick={() => exec('insertHorizontalRule')} icon={Minus} title="Línea horizontal" />
          <button 
            type="button" 
            onClick={() => colorInputRef.current?.click()}
            className="p-1.5 rounded transition-all hover:bg-slate-200 border border-transparent text-indigo-600 flex flex-col items-center gap-0"
            title="Color de fuente"
          >
            <Palette size={15} strokeWidth={2.5} />
            <div className="w-full h-0.5 bg-indigo-600 mt-0.5 rounded-full" />
            <input ref={colorInputRef} type="color" className="hidden" onChange={(e) => exec('foreColor', e.target.value)} />
          </button>
        </div>
      </div>

      <div className="bg-[#f0f2f5] border-b border-slate-300 p-1.5 flex flex-wrap items-center gap-3">
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('formatBlock', e.target.value)} defaultValue="p">
          <option value="p">Formato (Párrafo)</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="pre">Código fuente</option>
        </select>
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('fontName', e.target.value)} defaultValue="Inherit">
          <option value="">Fuente (Predeterminada)</option>
          <option value="Arial">Arial</option>
          <option value="Comic Sans MS">Comic Sans</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Impact">Impact</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select className="bg-white border border-slate-300 rounded text-[11px] px-2 py-1 outline-none font-medium h-7" onChange={(e) => exec('fontSize', e.target.value)} defaultValue="3">
          <option value="1">Tamaño (1 - Mini)</option>
          <option value="2">2 - Pequeño</option>
          <option value="3">3 - Normal</option>
          <option value="4">4 - Grande</option>
          <option value="5">5 - Muy Grande</option>
          <option value="6">6 - Extra Grande</option>
          <option value="7">7 - Gigante</option>
        </select>
      </div>

      <div ref={editorRef} contentEditable onInput={(e) => onChange(e.currentTarget.innerHTML)} className="p-8 min-h-[300px] outline-none prose prose-slate max-w-none text-slate-800 font-medium bg-white selection:bg-indigo-100" />
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-1 flex justify-end">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Editor Nogales PRO v2.1</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
