import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Error: Faltan las variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
  try {
    console.log("Conectando a Supabase para obtener recursos...");
    
    // Obtenemos todos los registros de la tabla 'resources'
    const { data: resources, error } = await supabase
      .from('resources')
      .select('data');

    if (error) {
      throw error;
    }

    console.log(`Se encontraron ${resources.length} recursos.`);

    const baseUrl = 'https://nogalespt.com';
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 1. Home
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // 2. Explore
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?view=Explore</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // 3. Blog
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/?view=Blog</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // 4. Recursos dinámicos
    if (resources && resources.length > 0) {
      resources.forEach((row) => {
        const resource = row.data;
        if (!resource || !resource.id) return;

        const id = resource.id;
        const kind = resource.kind || 'material';
        
        let lastmod = currentDate;
        if (resource.uploadDate) {
          try {
            // Intentamos parsear la fecha si es válida, sino usamos la actual
            const dateParts = resource.uploadDate.split('/');
            if (dateParts.length === 3) {
              // Formato DD/MM/YYYY
              lastmod = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            } else {
              const dateObj = new Date(resource.uploadDate);
              if (!isNaN(dateObj.getTime())) {
                lastmod = dateObj.toISOString().split('T')[0];
              }
            }
          } catch (e) {
            // Ignoramos errores de parseo de fecha
          }
        }

        const priority = kind === 'blog' ? '0.9' : '0.7';
        // Es importante escapar el ampersand en XML
        const url = `${baseUrl}/?view=Detail&amp;id=${id}`;

        xml += `  <url>\n`;
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    xml += `</urlset>`;

    // Guardar en public/sitemap.xml
    const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');
    
    console.log(`Sitemap generado exitosamente en: ${outputPath}`);
  } catch (error) {
    console.error("Error al generar el sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
