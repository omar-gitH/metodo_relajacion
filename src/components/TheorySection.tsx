import { MathTex } from './MathTex';

export function TheorySection() {
  return (
    <article className="w-full space-y-16" aria-labelledby="theory-heading">
      {/* Section Header */}
      <header className="w-full border-b border-slate-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A8A]">
          Unidad Temática · Sistemas de Ecuaciones Lineales
        </p>
        <h2
          id="theory-heading"
          className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl"
        >
          Fundamento Teórico del Método de Relajación
        </h2>
        <p className="mt-4 w-full text-[1.125rem] leading-[1.75] text-slate-600">
          Desarrollo formal del método iterativo de relajación para la aproximación sucesiva de
          sistemas lineales cuadrados, basado en la normalización de la diagonal principal y la
          anulación selectiva del mayor error residual en cada etapa.
        </p>
      </header>

      {/* 1. Contexto y clasificación */}
      <section className="w-full space-y-6" aria-labelledby="sec-1">
        <h3 id="sec-1" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          1. Contexto: Sistemas Lineales y Métodos de Resolución
        </h3>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Un sistema de <MathTex math="n" /> ecuaciones algebraicas lineales con{' '}
          <MathTex math="n" /> incógnitas se formula matricialmente como:
        </p>

        <div className="w-full rounded-xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <MathTex
            block
            math="A \cdot \vec{x} = \vec{b}, \qquad A \in \mathbb{R}^{n \times n}, \quad \vec{x}, \vec{b} \in \mathbb{R}^{n}"
          />
          <div className="mt-3 border-t border-slate-200/80 pt-4">
            <MathTex
              block
              math="\begin{pmatrix} a_{11} & a_{12} & \cdots & a_{1n} \\ a_{21} & a_{22} & \cdots & a_{2n} \\ \vdots & \vdots & \ddots & \vdots \\ a_{n1} & a_{n2} & \cdots & a_{nn} \end{pmatrix} \begin{pmatrix} x_1 \\ x_2 \\ \vdots \\ x_n \end{pmatrix} = \begin{pmatrix} b_1 \\ b_2 \\ \vdots \\ b_n \end{pmatrix}"
            />
          </div>
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          En Análisis Numérico, los procedimientos para determinar el vector solución{' '}
          <MathTex math="\vec{x}" /> se clasifican en dos grandes familias:
        </p>

        <div className="w-full space-y-4">
          <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 shadow-sm">
            <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
              Métodos Directos (Exactos)
            </h4>
            <p className="mt-2 text-base leading-[1.75] text-slate-600">
              Transforman el sistema en otro equivalente más simple y obtienen la solución en un
              número finito de operaciones aritméticas (salvo errores de redondeo). Ejemplos:
              eliminación de Gauss, Gauss-Jordan, factorización de Crout{' '}
              <MathTex math="A = L \cdot U" /> y Cholesky <MathTex math="L \cdot L^T" />.
            </p>
          </div>
          <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 shadow-sm">
            <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
              Métodos Iterativos (Aproximados)
            </h4>
            <p className="mt-2 text-base leading-[1.75] text-slate-600">
              A partir de un vector arrancador <MathTex math="\vec{x}^{(0)}" />, construyen una
              sucesión <MathTex math="\{\vec{x}^{(k)}\}_{k=0}^{\infty}" /> tal que{' '}
              <MathTex math="\lim_{k \to \infty} \vec{x}^{(k)} = \vec{x}" />. Comprenden los
              métodos de Jacobi, Gauss-Seidel y <strong>Relajación</strong>.
            </p>
          </div>
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Mientras que Jacobi y Gauss-Seidel actualizan las <MathTex math="n" /> componentes del
          vector <MathTex math="\vec{x}^{(k)}" /> de forma cíclica en cada iteración, el{' '}
          <strong className="font-semibold text-[#0F172A]">Método de Relajación</strong> adopta
          una estrategia selectiva: en cada paso{' '}
          <strong className="font-semibold text-[#0F172A]">
            se modifica únicamente una variable por iteración
          </strong>
          , eligiendo precisamente aquella cuya ecuación presenta el mayor error residual en valor
          absoluto.
        </p>

        <div className="my-6 w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-5 sm:p-6 text-base leading-[1.75] text-slate-600 shadow-sm">
          <p className="font-serif text-base font-bold text-[#1E3A8A]">Nota conceptual</p>
          <p className="mt-2">
            Todo esquema iterativo estacionario <MathTex math="\vec{x}^{(k+1)} = M\vec{x}^{(k)} + \vec{c}" />{' '}
            converge para cualquier <MathTex math="\vec{x}^{(0)}" /> si y solo si el radio
            espectral de la matriz de iteración cumple <MathTex math="\rho(M) < 1" />. En
            relajación, el orden de actualización no es fijo: se adapta dinámicamente en cada
            iteración para reducir el residuo dominante.
          </p>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 2. Normalización del sistema */}
      <section className="w-full space-y-6" aria-labelledby="sec-2">
        <h3 id="sec-2" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          2. Normalización del Sistema
        </h3>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Partimos de <MathTex math="A \cdot \vec{x} = \vec{b}" /> y trasladamos los términos
          independientes al primer miembro para escribir el sistema homogéneo equivalente{' '}
          <MathTex math="A \cdot \vec{x} - \vec{b} = \vec{0}" />. Suponiendo que todos los
          elementos de la diagonal principal son no nulos (
          <MathTex math="a_{ii} \neq 0,\;\forall i = 1, \dots, n" />
          ), dividimos cada ecuación <MathTex math="i" /> por <MathTex math="-a_{ii}" />:
        </p>

        <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
            Definición — Coeficientes normalizados
          </p>
          <MathTex
            block
            math="b_{ij} = -\frac{a_{ij}}{a_{ii}} \quad (i \neq j), \qquad b_{ii} = -1, \qquad c_i = \frac{b_i}{a_{ii}}"
          />
          <div className="border-t border-slate-200/80 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              Sistema equivalente con diagonal principal igual a <MathTex math="-1" />
            </p>
            <MathTex
              block
              math="-x_i + \sum_{\substack{j=1 \\ j \neq i}}^{n} b_{ij}\,x_j + c_i = 0 \qquad \forall\, i = 1, \dots, n"
            />
          </div>
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Desarrollado por filas, este sistema equivalente adopta la forma explícita:
        </p>

        <div className="w-full rounded-xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <MathTex
            block
            math="\begin{cases} -x_1 + b_{12}\,x_2 + \cdots + b_{1n}\,x_n + c_1 = 0 \\[4pt] b_{21}\,x_1 - x_2 + \cdots + b_{2n}\,x_n + c_2 = 0 \\[4pt] \;\;\vdots \qquad\qquad \vdots \qquad\qquad \ddots \qquad\qquad \vdots \\[4pt] b_{n1}\,x_1 + b_{n2}\,x_2 + \cdots - x_n + c_n = 0 \end{cases}"
          />
        </div>

        <div className="my-6 w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-5 sm:p-6 text-base leading-[1.75] text-slate-600 shadow-sm">
          <p className="font-serif text-base font-bold text-[#1E3A8A]">
            ¿Por qué dividir por <MathTex math="-a_{ii}" />?
          </p>
          <p className="mt-2">
            Forzar el coeficiente <MathTex math="-1" /> en cada incógnita diagonal{' '}
            <MathTex math="x_i" /> garantiza que un incremento <MathTex math="\delta x_i" />{' '}
            modifique su propio residuo <MathTex math="R_i" /> exactamente en{' '}
            <MathTex math="-\delta x_i" />, simplificando la corrección a una suma directa.
          </p>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 3. Definición del Vector Residuo */}
      <section className="w-full space-y-6" aria-labelledby="sec-3">
        <h3 id="sec-3" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          3. Definición del Vector Residuo
        </h3>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Al evaluar el sistema normalizado en un vector aproximado{' '}
          <MathTex math="\vec{x}^{(k)} = \bigl(x_1^{(k)},\, x_2^{(k)},\, \dots,\, x_n^{(k)}\bigr)^T" />{' '}
          distinto de la solución exacta, las ecuaciones no se anulan idénticamente. El desbalance
          resultante en la <MathTex math="i" />-ésima ecuación define la componente{' '}
          <MathTex math="R_i^{(k)}" /> del <strong>vector residuo</strong>{' '}
          <MathTex math="\vec{R}^{(k)}" />, asociada directamente a la incógnita{' '}
          <MathTex math="x_i" />:
        </p>

        <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 sm:p-8 shadow-sm space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
            Definición — Componente residual <MathTex math="i" />-ésima en la iteración{' '}
            <MathTex math="k" />
          </p>
          <MathTex
            block
            math="R_i^{(k)} = c_i - x_i^{(k)} + \sum_{\substack{j=1 \\ j \neq i}}^{n} b_{ij}\,x_j^{(k)}, \qquad \vec{R}^{(k)} = \begin{pmatrix} R_1^{(k)} \\ R_2^{(k)} \\ \vdots \\ R_n^{(k)} \end{pmatrix}"
          />
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Se verifica inmediatamente que <MathTex math="\vec{x}^{(k)}" /> es la solución exacta
          del sistema si y solo si <MathTex math="\vec{R}^{(k)} = \vec{0}" />, es decir, cuando{' '}
          <MathTex math="R_i^{(k)} = 0" /> para todo <MathTex math="i = 1, \dots, n" />.
        </p>

        <div className="my-6 w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-5 sm:p-6 text-base leading-[1.75] text-slate-600 shadow-sm">
          <p className="font-serif text-base font-bold text-[#1E3A8A]">Asociación biunívoca</p>
          <p className="mt-2">
            Cada ecuación normalizada <MathTex math="R_i" /> queda vinculada a su variable
            diagonal <MathTex math="x_i" /> (cuyo coeficiente es <MathTex math="-1" />
            ). El objetivo del método es conducir todas las componentes de{' '}
            <MathTex math="\vec{R}^{(k)}" /> hacia cero.
          </p>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 4. Propiedad de Relajación y Anulación del Residuo */}
      <section className="w-full space-y-6" aria-labelledby="sec-4">
        <h3 id="sec-4" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          4. Propiedad de Relajación y Anulación del Residuo
        </h3>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          En la iteración <MathTex math="k" />, seleccionamos el índice <MathTex math="m" />{' '}
          correspondiente al residuo de mayor magnitud absoluta:
        </p>

        <div className="w-full rounded-xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <MathTex
            block
            math="\bigl|R_m^{(k)}\bigr| = \max_{1 \le i \le n} \bigl|R_i^{(k)}\bigr|"
          />
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Buscamos un incremento <MathTex math="\delta x_m^{(k)}" /> aplicado exclusivamente a la
          incógnita <MathTex math="x_m^{(k)}" /> (manteniendo{' '}
          <MathTex math="x_i^{(k+1)} = x_i^{(k)}" /> para todo <MathTex math="i \neq m" />) de
          modo que el nuevo residuo <MathTex math="R_m^{(k+1)}" /> se anule por completo.
        </p>

        {/* Formal Proof Card */}
        <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-7 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3.5">
            <h4 className="font-serif text-lg font-bold text-[#0F172A]">
              Proposición y Demostración — Regla de Actualización
            </h4>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
              Anulación exacta en m
            </span>
          </div>

          <p className="text-base leading-[1.75] text-slate-700">
            <strong>1) Anulación de <MathTex math="R_m^{(k+1)}" />:</strong> Imponiendo{' '}
            <MathTex math="R_m^{(k+1)} = 0" /> al reemplazar{' '}
            <MathTex math="x_m^{(k+1)} = x_m^{(k)} + \delta x_m^{(k)}" /> en la ecuación{' '}
            <MathTex math="m" />-ésima:
          </p>

          <MathTex
            block
            math="R_m^{(k+1)} = c_m - \bigl(x_m^{(k)} + \delta x_m^{(k)}\bigr) + \sum_{\substack{j=1 \\ j \neq m}}^{n} b_{mj}\,x_j^{(k)} = \underbrace{\left(c_m - x_m^{(k)} + \sum_{\substack{j=1 \\ j \neq m}}^{n} b_{mj}\,x_j^{(k)}\right)}_{R_m^{(k)}} - \delta x_m^{(k)} = 0"
          />

          <p className="text-base leading-[1.75] text-slate-700">
            De donde se deduce inmediatamente que el incremento debe igualar con su signo al
            residuo seleccionado:
          </p>

          <MathTex
            block
            math="\delta x_m^{(k)} = R_m^{(k)} \implies x_m^{(k+1)} = x_m^{(k)} + R_m^{(k)}, \qquad R_m^{(k+1)} = 0"
          />

          <p className="pt-2 text-base leading-[1.75] text-slate-700">
            <strong>2) Actualización de los restantes residuos (<MathTex math="i \neq m" />):</strong>{' '}
            Sustituyendo el nuevo vector <MathTex math="\vec{x}^{(k+1)}" /> en cualquier otra
            ecuación <MathTex math="i \neq m" />, solo cambia el término correspondiente a{' '}
            <MathTex math="j = m" />:
          </p>

          <MathTex
            block
            math="\begin{aligned} R_i^{(k+1)} &= c_i - x_i^{(k)} + \sum_{\substack{j=1 \\ j \neq i,\, j \neq m}}^{n} b_{ij}\,x_j^{(k)} + b_{im}\bigl(x_m^{(k)} + R_m^{(k)}\bigr) \\ &= \underbrace{\left(c_i - x_i^{(k)} + \sum_{\substack{j=1 \\ j \neq i}}^{n} b_{ij}\,x_j^{(k)}\right)}_{R_i^{(k)}} + b_{im} \cdot R_m^{(k)} \end{aligned}"
          />

          <div className="border-t border-slate-200 pt-4">
            <MathTex
              block
              math="R_i^{(k+1)} = R_i^{(k)} + b_{im} \cdot R_m^{(k)} \qquad \forall\, i \neq m"
            />
          </div>
        </div>

        <div className="my-6 w-full rounded-xl border border-slate-200 border-l-4 border-l-[#991B1B] bg-white p-5 sm:p-6 text-base leading-[1.75] text-slate-600 shadow-sm">
          <p className="font-serif text-base font-bold text-[#991B1B]">
            Invariante en tablas de cálculo
          </p>
          <p className="mt-2">
            Al sumar <MathTex math="R_m^{(k)}" /> (con su signo) a la variable{' '}
            <MathTex math="x_m^{(k)}" />, la columna <MathTex math="R_m" /> en la fila{' '}
            <MathTex math="k+1" /> resulta necesariamente igual a <MathTex math="0" />. Esta
            propiedad funciona como control aritmético inmediato durante el cálculo manual.
          </p>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 5. Condición de Convergencia y Criterios de Paro */}
      <section className="w-full space-y-6" aria-labelledby="sec-5">
        <h3 id="sec-5" className="font-serif text-2xl font-bold tracking-tight text-[#1E3A8A]">
          5. Condición de Convergencia y Criterios de Paro
        </h3>

        <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-7 sm:p-8 shadow-sm space-y-4">
          <h4 className="font-serif text-lg font-bold text-[#0F172A]">
            Teorema — Dominancia Diagonal (Condición Suficiente)
          </h4>
          <p className="text-base leading-[1.75] text-slate-700">
            Una matriz <MathTex math="A \in \mathbb{R}^{n \times n}" /> es{' '}
            <strong>diagonalmente dominante</strong> por filas si en cada ecuación el módulo del
            elemento diagonal es mayor o igual que la suma de los módulos de los restantes
            coeficientes de esa fila (y estrictamente mayor en al menos una fila para matrices
            irreducibles, o estrictamente mayor en todas):
          </p>
          <MathTex
            block
            math="\bigl|a_{ii}\bigr| \ge \sum_{\substack{j=1 \\ j \neq i}}^{n} \bigl|a_{ij}\bigr| \qquad \forall\, i = 1, \dots, n"
          />
          <p className="text-base leading-[1.75] text-slate-700">
            En el sistema normalizado, la dominancia diagonal estricta equivale a exigir{' '}
            <MathTex math="\sum_{j \neq i} |b_{ij}| < 1" />. Bajo esta hipótesis, la suma total de
            los residuos tiende a contraerse y el proceso converge a la solución única del sistema
            para cualquier vector inicial <MathTex math="\vec{x}^{(0)}" />.
          </p>
        </div>

        <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
          Es importante subrayar que la dominancia diagonal es una{' '}
          <strong>condición suficiente pero no necesaria</strong>: existen sistemas no
          diagonalmente dominantes que convergen, aunque no se garantiza de antemano. Cuando la
          matriz original no cumple la condición —o presenta un cero en la diagonal{' '}
          <MathTex math="a_{ii} = 0" />—, suele ser posible{' '}
          <strong>permutar ecuaciones (filas) o incógnitas (columnas)</strong> para construir un
          sistema algebraicamente equivalente que sí sea diagonalmente dominante.
        </p>

        <div className="my-6 w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-5 sm:p-6 text-base leading-[1.75] text-slate-600 shadow-sm">
          <p className="font-serif text-base font-bold text-[#1E3A8A]">
            Control previo obligatorio
          </p>
          <p className="mt-2">
            Antes de comenzar, verifique siempre dos condiciones sobre <MathTex math="A" />:
          </p>
          <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 text-slate-700">
            <li>
              Ningún elemento diagonal puede ser nulo (<MathTex math="a_{ii} \neq 0" />
              ).
            </li>
            <li>
              Si la matriz no es diagonalmente dominante, evalúe permutar las ecuaciones para
              ubicar los coeficientes mayores en la diagonal.
            </li>
          </ol>
        </div>

        <div className="w-full space-y-4 pt-2">
          <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
            Criterios de Paro del Proceso Iterativo
          </h4>
          <p className="w-full text-[1.0625rem] leading-[1.75] text-slate-700">
            Dado que la solución exacta <MathTex math="\vec{x}" /> es desconocida, la iteración se
            detiene al satisfacerse alguno de los siguientes criterios fijados previamente:
          </p>

          <div className="w-full space-y-4">
            <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                Criterio por Tolerancia Residual
              </p>
              <div className="my-3">
                <MathTex block math="\max_{1 \le i \le n} \bigl|R_i^{(k)}\bigr| < \varepsilon" />
              </div>
              <p className="text-[0.95rem] leading-[1.7] text-slate-600">
                Garantiza que todas las ecuaciones normalizadas se satisfacen dentro de una cota{' '}
                <MathTex math="\varepsilon > 0" /> (habitualmente{' '}
                <MathTex math="\varepsilon = 10^{-4}" /> o <MathTex math="10^{-6}" />
                ). Además, dado que <MathTex math="|\delta x_m^{(k)}| = |R_m^{(k)}|" />, acota
                simultáneamente la máxima variación absoluta entre iteraciones.
              </p>
            </div>

            <div className="w-full rounded-xl border border-slate-200 border-l-4 border-l-[#1E3A8A] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1E3A8A]">
                Criterio por Cantidad Máxima de Iteraciones
              </p>
              <div className="my-3">
                <MathTex block math="k = K_{\max}" />
              </div>
              <p className="text-[0.95rem] leading-[1.7] text-slate-600">
                Limita el número de correcciones realizadas. Se emplea tanto en evaluaciones
                prácticas (ej. calcular 4 iteraciones manuales) como resguardo algorítmico ante
                sistemas mal condicionados o divergentes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
