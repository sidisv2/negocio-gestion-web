# negocio-gestion-web

Sistema de Gestión Web para Negocios.

## Tecnologías

- Next.js / React
- Supabase (Autenticación, Base de datos PostgreSQL & RLS)
- Tailwind CSS / Vanilla CSS
- Google Gemini AI API

## Estructura de la Base de Datos

Los scripts SQL de esquema y datos iniciales se encuentran versionados en la carpeta [`/supabase`](file:///C:/Users/valentin/.gemini/antigravity-ide/scratch/negocio-gestion-web/supabase):
- [`schema.sql`](file:///C:/Users/valentin/.gemini/antigravity-ide/scratch/negocio-gestion-web/supabase/schema.sql): Tablas (`profiles`, `products`, `orders`), políticas RLS e índices.
- [`seed.sql`](file:///C:/Users/valentin/.gemini/antigravity-ide/scratch/negocio-gestion-web/supabase/seed.sql): Datos de prueba iniciales.

## Configuración Local

1. Copiar el archivo `.env.example` a `.env.local`
2. Completar las credenciales de Supabase y la API key de Gemini.
