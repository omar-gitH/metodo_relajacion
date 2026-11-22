import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { MathTex } from './MathTex';

const PSEUDOCODE_PLAIN = `ALGORITMO Metodo_de_Relajacion(A, b, x0, tol, K_max)
ENTRADA:  Matriz A (n x n), vector b (n), vector inicial x^(0),
          tolerancia tol > 0, máximo de iteraciones K_max
SALIDA:   Vector solución aproximada x^(k), vector de residuos R^(k)

1.  // Verificación previa de la diagonal principal
2.  PARA i <- 1 HASTA n HACER
3.      SI A[i, i] == 0 ENTONCES
4.          RETORNAR ERROR("Elemento diagonal nulo: reordenar ecuaciones")
5.      FIN SI
6.  FIN PARA
7.
8.  // Normalización del sistema: llevar la diagonal principal a -1
9.  PARA i <- 1 HASTA n HACER
10.     c[i] <- b[i] / A[i, i]
11.     PARA j <- 1 HASTA n HACER
12.         SI i == j ENTONCES B[i, j] <- -1
13.         SINO B[i, j] <- -A[i, j] / A[i, i]
14.     FIN PARA
15. FIN PARA
16.
17. // Inicialización del vector solución y residuos iniciales R^(0)
18. x <- x0
19. k <- 0
20. PARA i <- 1 HASTA n HACER
21.     R[i] <- c[i] - x[i] + SUM(B[i, j] * x[j] para j != i)
22. FIN PARA
23.
24. // Bucle iterativo principal
25. MIENTRAS (k < K_max) Y (MAX(|R[i]| para i = 1..n) >= tol) HACER
26.     // Seleccionar índice m con mayor residuo en valor absoluto
27.     m <- argmax_{1 <= i <= n} |R[i]|
28.     delta <- R[m]
29.
30.     // Actualizar ÚNICAMENTE la variable x[m]
31.     x[m] <- x[m] + delta
32.
33.     // Actualizar residuos (R[m] se anula exactamente)
34.     R[m] <- 0
35.     PARA i <- 1 HASTA n CON i != m HACER
36.         R[i] <- R[i] + B[i, m] * delta
37.     FIN PARA
38.
39.     k <- k + 1
40. FIN MIENTRAS
41.
42. RETORNAR (x, R, k)`;

interface CodeLine {
  num: number;
  content: ReactNode;
}

function renderPseudocodeLines(): CodeLine[] {
  const kw = (text: string) => <span className="font-semibold text-[#1E3A8A]">{text}</span>;
  const cm = (text: string) => <span className="italic text-slate-500">{text}</span>;
  const hi = (text: string) => <span className="font-semibold text-[#991B1B]">{text}</span>;

  return [
    { num: 1, content: <>{kw('ALGORITMO')} <span className="font-semibold text-[#0F172A]">Metodo_de_Relajacion</span>(A, b, x<sup>(0)</sup>, ε, K<sub>máx</sub>)</> },
    { num: 2, content: <>{cm('Entrada: A ∈ ℝⁿˣⁿ, b ∈ ℝⁿ, vector inicial x⁽⁰⁾, tolerancia ε > 0, tope Kₘáₓ')}</> },
    { num: 3, content: <>{cm('Salida:  aproximación x⁽ᵏ⁾, residuos finales R⁽ᵏ⁾, iteraciones realizadas k')}</> },
    { num: 4, content: <>&nbsp;</> },
    { num: 5, content: <>{cm('Paso 1 — Verificación de la diagonal principal')}</> },
    { num: 6, content: <>{kw('PARA')} i ← 1 {kw('HASTA')} n {kw('HACER')}</> },
    { num: 7, content: <>    {kw('SI')} A[i, i] == 0 {kw('ENTONCES')}</> },
    { num: 8, content: <>        {hi('DETENER')}(<span className="text-[#991B1B]">"Diagonal nula: permutar filas antes de normalizar"</span>)</> },
    { num: 9, content: <>    {kw('FIN SI')}</> },
    { num: 10, content: <>{kw('FIN PARA')}</> },
    { num: 11, content: <>&nbsp;</> },
    { num: 12, content: <>{cm('Paso 2 — Normalización del sistema (llevar aᵢᵢ → −1)')}</> },
    { num: 13, content: <>{kw('PARA')} i ← 1 {kw('HASTA')} n {kw('HACER')}</> },
    { num: 14, content: <>    c[i] ← b[i] / A[i, i]</> },
    { num: 15, content: <>    {kw('PARA')} j ← 1 {kw('HASTA')} n {kw('HACER')}</> },
    { num: 16, content: <>        {kw('SI')} i == j {kw('ENTONCES')} B[i, j] ← −1   {kw('SINO')} B[i, j] ← −A[i, j] / A[i, i]</> },
    { num: 17, content: <>    {kw('FIN PARA')}</> },
    { num: 18, content: <>{kw('FIN PARA')}</> },
    { num: 19, content: <>&nbsp;</> },
    { num: 20, content: <>{cm('Paso 3 — Inicialización y evaluación del vector residuo R⁽⁰⁾')}</> },
    { num: 21, content: <>x ← x<sup>(0)</sup> ;   k ← 0</> },
    { num: 22, content: <>{kw('PARA')} i ← 1 {kw('HASTA')} n {kw('HACER')}</> },
    { num: 23, content: <>    R[i] ← c[i] − x[i] + Σ<sub>j ≠ i</sub> ( B[i, j] · x[j] )</> },
    { num: 24, content: <>{kw('FIN PARA')}</> },
    { num: 25, content: <>&nbsp;</> },
    { num: 26, content: <>{cm('Paso 4 — Bucle iterativo de relajación selectiva')}</> },
    { num: 27, content: <>{kw('MIENTRAS')} (k &lt; K<sub>máx</sub>) {kw('Y')} ({hi('MAX')}(|R[1]|, …, |R[n]|) ≥ ε) {kw('HACER')}</> },
    { num: 28, content: <>    {cm('Localizar el índice m del mayor residuo en valor absoluto')}</> },
    { num: 29, content: <>    m ← {hi('argmax')}<sub>1 ≤ i ≤ n</sub> |R[i]|</> },
    { num: 30, content: <>    δ ← R[m]</> },
    { num: 31, content: <>&nbsp;</> },
    { num: 32, content: <>    {cm('Modificar exclusivamente la incógnita asociada x[m]')}</> },
    { num: 33, content: <>    x[m] ← x[m] + δ</> },
    { num: 34, content: <>&nbsp;</> },
    { num: 35, content: <>    {cm('Actualizar el vector de residuos (R[m] se anula exactamente)')}</> },
    { num: 36, content: <>    R[m] ← 0</> },
    { num: 37, content: <>    {kw('PARA')} i ← 1 {kw('HASTA')} n {kw('CON')} i ≠ m {kw('HACER')}</> },
    { num: 38, content: <>        R[i] ← R[i] + B[i, m] · δ</> },
    { num: 39, content: <>    {kw('FIN PARA')}</> },
    { num: 40, content: <>    k ← k + 1</> },
    { num: 41, content: <>{kw('FIN MIENTRAS')}</> },
    { num: 42, content: <>&nbsp;</> },
    { num: 43, content: <>{kw('RETORNAR')} (x, R, k)</> },
  ];
}

export function AlgorithmSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PSEUDOCODE_PLAIN);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable in restricted context
    }
  };

  const steps = [
    {
      num: '1',
      title: 'Verificación y reordenamiento previo',
      body: (
        <>
          Comprobar que todos los elementos de la diagonal principal satisfacen{' '}
          <MathTex math="a_{ii} \neq 0" />. Si la matriz <MathTex math="A" /> no es diagonalmente
          dominante, permutar ecuaciones para maximizar la magnitud de los coeficientes diagonales y
          asegurar la convergencia.
        </>
      ),
    },
    {
      num: '2',
      title: 'Normalización del sistema',
      body: (
        <>
          Igualar cada ecuación a cero (<MathTex math="A\vec{x} - \vec{b} = \vec{0}" />) y dividir
          la fila <MathTex math="i" /> por <MathTex math="-a_{ii}" />, de modo que todo coeficiente
          diagonal resulte exactamente igual a <MathTex math="-1" />. Asociar cada ecuación
          normalizada a su residuo <MathTex math="R_i" /> y a su incógnita <MathTex math="x_i" />.
        </>
      ),
    },
    {
      num: '3',
      title: 'Evaluación inicial de residuos',
      body: (
        <>
          Sustituir el vector arrancador <MathTex math="\vec{x}^{(0)}" /> en las <MathTex math="n" />{' '}
          ecuaciones normalizadas para obtener el vector de residuos iniciales{' '}
          <MathTex math="\vec{R}^{(0)} = \bigl(R_1^{(0)}, \dots, R_n^{(0)}\bigr)^T" />.
        </>
      ),
    },
    {
      num: '4',
      title: 'Selección del residuo máximo y corrección selectiva',
      body: (
        <>
          Determinar el índice <MathTex math="m" /> tal que{' '}
          <MathTex math="|R_m^{(k)}| = \max_{i} |R_i^{(k)}|" />. Sumar dicho residuo (con su signo)
          únicamente a la variable asociada:{' '}
          <MathTex math="x_m^{(k+1)} = x_m^{(k)} + R_m^{(k)}" />, manteniendo constantes todas las
          demás componentes (<MathTex math="x_i^{(k+1)} = x_i^{(k)}" /> para <MathTex math="i \neq m" />
          ).
        </>
      ),
    },
    {
      num: '5',
      title: 'Actualización de residuos y verificación de paro',
      body: (
        <>
          Recalcular los residuos con el nuevo vector <MathTex math="\vec{x}^{(k+1)}" /> (o
          directamente mediante <MathTex math="R_m^{(k+1)} = 0" /> y{' '}
          <MathTex math="R_i^{(k+1)} = R_i^{(k)} + b_{im} R_m^{(k)}" />). Repetir desde el paso 4
          hasta que <MathTex math="\max_i |R_i^{(k)}| < \varepsilon" /> o se alcance el número
          máximo de iteraciones <MathTex math="K_{\max}" />.
        </>
      ),
    },
  ];

  const codeLines = renderPseudocodeLines();

  return (
    <article className="space-y-16" aria-labelledby="algo-heading">
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A8A]">
          Procedimiento Computacional · Análisis Numérico
        </p>
        <h2
          id="algo-heading"
          className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl"
        >
          Algoritmo y Comparación de Métodos Iterativos
        </h2>
        <p className="mt-4 w-full text-[1.125rem] leading-[1.75] text-slate-600">
          Secuencia formal de operaciones, pseudocódigo estructurado para implementación numérica y
          análisis comparativo frente a los esquemas clásicos de Jacobi y Gauss-Seidel.
        </p>
      </header>

      {/* 1. Pasos formales */}
      <section aria-labelledby="steps-heading" className="space-y-6">
        <h3 id="steps-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          1. Pasos Formales del Método
        </h3>

        <ol className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
          {steps.map((step) => (
            <li
              key={step.num}
              className="flex flex-col gap-3.5 p-6 sm:flex-row sm:items-start sm:gap-6 sm:p-7"
            >
              <span className="inline-flex w-fit items-center rounded-md bg-[#1E3A8A]/10 px-3 py-1 font-mono text-xs font-semibold text-[#1E3A8A] tabular-nums sm:mt-0.5 sm:shrink-0">
                Paso {step.num}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
                  {step.title}
                </h4>
                <p className="text-[1.0625rem] leading-[1.75] text-slate-700">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 2. Pseudocódigo estructurado */}
      <section aria-labelledby="pseudo-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 id="pseudo-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
            2. Pseudocódigo Estructurado
          </h3>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-[#1E3A8A] hover:text-[#1E3A8A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Copiar pseudocódigo</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-xs text-slate-600">
            <span className="font-mono font-semibold text-[#0F172A]">
              Algoritmo 1 — Método de Relajación (Actualización Residual Directa)
            </span>
            <span className="font-mono text-slate-500">
              Complejidad por iteración: <MathTex math="\mathcal{O}(n)" />
            </span>
          </div>
          <div className="overflow-x-auto bg-[#F8FAFC]/60 p-6 sm:p-7">
            <pre className="font-mono text-sm leading-7 text-[#0F172A]">
              <code>
                {codeLines.map((line) => (
                  <div key={line.num} className="flex">
                    <span
                      aria-hidden="true"
                      className="mr-6 inline-block w-7 shrink-0 select-none text-right text-slate-400 tabular-nums"
                    >
                      {line.num}
                    </span>
                    <span className="whitespace-pre">{line.content}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* 3. Cuadro comparativo */}
      <section aria-labelledby="compare-heading" className="space-y-6">
        <h3 id="compare-heading" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          3. Cuadro Comparativo de Métodos Iterativos
        </h3>
        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-600">
          Síntesis estructural entre los tres esquemas iterativos estudiados en la asignatura para
          sistemas <MathTex math="A\vec{x} = \vec{b}" /> con matriz diagonalmente dominante.
        </p>

        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full table-auto border-collapse text-left text-[0.95rem] leading-relaxed">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wider text-slate-600">
                <th scope="col" className="w-[12%] min-w-[8.5rem] px-4 py-4 lg:px-5 whitespace-nowrap">
                  Método
                </th>
                <th scope="col" className="w-[19%] min-w-[11rem] px-4 py-4 lg:px-5">
                  Variables actualizadas por iteración
                </th>
                <th scope="col" className="w-[20%] min-w-[11.5rem] px-4 py-4 lg:px-5">
                  Uso de valores nuevos
                </th>
                <th scope="col" className="w-[26%] min-w-[16rem] px-4 py-4 lg:px-5">
                  Regla de actualización
                </th>
                <th scope="col" className="w-[23%] min-w-[13rem] px-4 py-4 lg:px-5">
                  Ventaja principal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr className="hover:bg-slate-50/70">
                <th
                  scope="row"
                  className="px-4 py-4.5 lg:px-5 font-serif text-base font-semibold text-[#0F172A] whitespace-nowrap align-middle"
                >
                  Jacobi
                </th>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Todas las <MathTex math="n" /> variables en bloque
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  No; emplea únicamente el vector de la iteración anterior <MathTex math="\vec{x}^{(k)}" />
                </td>
                <td className="px-4 py-4.5 lg:px-5 whitespace-nowrap align-middle">
                  <MathTex math="x_i^{(k+1)} = \frac{1}{a_{ii}}\Bigl(b_i - \sum_{j\neq i} a_{ij} x_j^{(k)}\Bigr)" />
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Cálculo completamente independiente por componente (alta paralelización).
                </td>
              </tr>

              <tr className="hover:bg-slate-50/70">
                <th
                  scope="row"
                  className="px-4 py-4.5 lg:px-5 font-serif text-base font-semibold text-[#0F172A] whitespace-nowrap align-middle"
                >
                  Gauss-Seidel
                </th>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Todas las <MathTex math="n" /> variables en orden secuencial (<MathTex math="1 \to n" />)
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Sí; incorpora inmediatamente cada <MathTex math="x_j^{(k+1)}" /> ya calculada
                </td>
                <td className="px-4 py-4.5 lg:px-5 whitespace-nowrap align-middle">
                  <MathTex math="x_i^{(k+1)} = \frac{1}{a_{ii}}\Bigl(b_i - \sum_{j<i} a_{ij}x_j^{(k+1)} - \sum_{j>i} a_{ij}x_j^{(k)}\Bigr)" />
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Convergencia significativamente más rápida que Jacobi y menor uso de memoria.
                </td>
              </tr>

              <tr className="bg-[#1E3A8A]/[0.03] hover:bg-[#1E3A8A]/[0.06]">
                <th
                  scope="row"
                  className="px-4 py-4.5 lg:px-5 font-serif text-base font-bold text-[#1E3A8A] whitespace-nowrap align-middle"
                >
                  Relajación
                </th>
                <td className="px-4 py-4.5 lg:px-5 font-medium text-[#0F172A] align-middle">
                  Únicamente 1 variable (<MathTex math="x_m" /> con mayor <MathTex math="|R_m|" />)
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Sí; el incremento <MathTex math="\delta x_m = R_m" /> actualiza el vector de residuos al instante
                </td>
                <td className="px-4 py-4.5 lg:px-5 whitespace-nowrap align-middle">
                  <MathTex math="x_m^{(k+1)} = x_m^{(k)} + R_m^{(k)}" />
                </td>
                <td className="px-4 py-4.5 lg:px-5 align-middle">
                  Ataca directamente la ecuación con mayor error residual; muy eficiente en cálculo
                  manual y sistemas con residuos desbalanceados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
