export const stripHtml = (html: string) => {
  if (typeof document === 'undefined') return html;
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const renderContentWithVideos = (content: string, consent: boolean | null) => {
  if (!content) return "";
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*)/g;
  
  return content.replace(youtubeRegex, (match, videoId) => {
    if (consent !== true) {
      return `
        <div class="my-8 aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-slate-100 border-4 border-white flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div class="p-4 bg-slate-200 rounded-full text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <div>
            <p class="text-sm font-black text-slate-800 uppercase tracking-tight">Contenido bloqueado por privacidad</p>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Acepta las cookies para ver este vídeo de YouTube</p>
          </div>
          <button onclick="window.dispatchEvent(new CustomEvent('open-cookie-banner'))" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all">Gestionar Cookies</button>
        </div>
      `;
    }

    return `
      <div class="my-8 aspect-video w-full rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 border-4 border-white">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
      </div>
    `;
  });
};
