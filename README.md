# Método de Relajación — Análisis Numérico

Aplicación web educativa para estudiar y aplicar el **Método de Relajación**, un procedimiento iterativo utilizado en el análisis numérico para resolver sistemas de ecuaciones lineales.

El proyecto incluye teoría, el algoritmo paso a paso, ejercicios resueltos y una calculadora interactiva que permite visualizar las iteraciones y analizar la convergencia.

## Funcionalidades

- Explicación teórica del método de relajación.
- Calculadora interactiva para introducir sistemas de ecuaciones.
- Selección del factor de relajación.
- Visualización de las iteraciones y aproximaciones sucesivas.
- Criterios de convergencia y detalle de los cálculos.
- Ejercicios resueltos y guía práctica.
- Pruebas unitarias del motor matemático.

## Tecnologías

- React y TypeScript
- Vite
- Tailwind CSS
- KaTeX
- Lucide React
- Node.js test runner con `tsx`

## Requisitos previos

- Node.js v20.19+ o v22.12+
- npm

## Ejecución local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000` en el navegador.

## Otros comandos útiles

- `npm run build`: genera la compilación de producción en `dist/`.
- `npm run preview`: previsualiza la compilación de producción.
- `npm test`: ejecuta las pruebas unitarias del motor matemático.
- `npm run lint`: verifica los tipos con TypeScript.
- `npm run clean`: elimina la carpeta `dist/`.

## Contexto académico

Proyecto desarrollado para la asignatura **Análisis Numérico**, correspondiente a la carrera de Ingeniería en Sistemas.

## Despliegue en Vercel

El proyecto incluye `vercel.json` con la configuración necesaria para Vite:

- Framework: Vite
- Comando de construcción: `npm run build`
- Directorio de salida: `dist`
- Redirección SPA: todas las rutas se sirven desde `/index.html`

Para desplegarlo desde la cuenta de Vercel:

1. Importar el repositorio `omar-gitH/metodo_relajacion`.
2. Verificar que Vercel detecte el framework **Vite**.
3. Mantener `npm run build` como comando de construcción.
4. Mantener `dist` como directorio de salida.
5. Configurar las variables de entorno necesarias en **Settings → Environment Variables**.
6. Ejecutar **Deploy**.
