
import { EducationalLevel, Resource, User } from './types';

export const SUBJECTS_BY_LEVEL: Record<EducationalLevel, string[]> = {
  'Infantil': [
    'Crecimiento en Armonía',
    'Descubrimiento y Exploración del Entorno',
    'Comunicación y Representación de la Realidad'
  ],
  'Primaria': [
    'Lengua Castellana y Literatura',
    'Matemáticas',
    'Conocimiento del Medio Natural, Social y Cultural',
    'Lengua Extranjera (Inglés)',
    'Educación Artística',
    'Educación Física',
    'Valores Cívicos y Éticos'
  ],
  'Secundaria': [
    'Lengua Castellana y Literatura',
    'Geografía e Historia',
    'Matemáticas',
    'Biología y Geología',
    'Física y Química',
    'Tecnología y Digitalización',
    'Educación Plástica y Visual',
    'Música'
  ],
  'Bachillerato': [
    'Lengua Castellana y Literatura',
    'Filosofía',
    'Historia de España',
    'Física',
    'Biología',
    'Matemáticas I / II',
    'Economía',
    'Dibujo Técnico'
  ]
};

export const COURSES_BY_LEVEL: Record<EducationalLevel, string[]> = {
  'Infantil': ['3 años', '4 años', '5 años'],
  'Primaria': ['1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria'],
  'Secundaria': ['1º ESO', '2º ESO', '3º ESO', '4º ESO'],
  'Bachillerato': ['1º Bachillerato', '2º Bachillerato']
};

export const INITIAL_USERS: User[] = [
  { 
    email: 'm.garcia@educacion.es', 
    name: 'María Cruz', 
    lastName: 'García Sanchis',
    password: '1234',
    bio: 'Profesora de Ciencias apasionada por la tecnología educativa y el diseño de materiales REA. Especialista en metodologías activas.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    instagram: 'mariacruz_edu',
    linkedin: 'mariacruzgarcia',
    tiktok: 'ciencias_con_maria'
  },
  {
    email: 'j.perez@educacion.es',
    name: 'Juan',
    lastName: 'Pérez Rodríguez',
    password: '1234',
    bio: 'Maestro de Primaria. Amante de la gamificación y las historias locales de Andalucía.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    instagram: 'juan_primaria_rea',
    linkedin: 'juanperezrodriguez'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Simulador de Circuitos Eléctricos Interactivo',
    authorName: 'María Cruz García Sanchis',
    email: 'm.garcia@educacion.es',
    summary: 'Módulo interactivo basado en HTML5 para experimentar con leyes básicas de electricidad (Ohm, Kirchhoff) de forma segura y visual.',
    level: 'Secundaria',
    subject: 'Física y Química',
    courses: ['2º ESO', '3º ESO'],
    resourceType: 'Interactivo HTML',
    fileType: 'html',
    mainCategory: 'General',
    rating: 4.8,
    uploadDate: '2023-10-15',
    thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600',
    contentUrl: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_en.html'
  },
  {
    id: '2',
    title: 'Guía Visual: Historia de la Autonomía Andaluza',
    authorName: 'María Cruz García Sanchis',
    email: 'm.garcia@educacion.es',
    summary: 'Documento pedagógico que recorre los hitos fundamentales desde el 4 de diciembre hasta la actualidad, ideal para el Día de Andalucía.',
    level: 'Secundaria',
    subject: 'Geografía e Historia',
    courses: ['1º ESO', '2º ESO'],
    resourceType: 'Documento PDF',
    fileType: 'pdf',
    mainCategory: 'General',
    rating: 4.5,
    uploadDate: '2023-11-20',
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad58165445?auto=format&fit=crop&q=80&w=600',
    contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '3',
    title: 'Comprensión Lectora: Leyendas de la Alhambra',
    authorName: 'Juan Pérez Rodríguez',
    email: 'j.perez@educacion.es',
    summary: 'Fichas de trabajo con fragmentos adaptados de Washington Irving para trabajar la inferencia y el vocabulario en el tercer ciclo de Primaria.',
    level: 'Primaria',
    subject: 'Lengua Castellana y Literatura',
    courses: ['5º Primaria', '6º Primaria'],
    resourceType: 'Material Didáctico',
    fileType: 'pdf',
    mainCategory: 'General',
    rating: 4.9,
    uploadDate: '2024-01-12',
    thumbnail: 'https://images.unsplash.com/photo-1590424753062-325177391fbc?auto=format&fit=crop&q=80&w=600',
    contentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];
