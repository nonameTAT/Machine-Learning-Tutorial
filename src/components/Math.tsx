import katex from 'katex';
import { memo, useMemo } from 'react';

// Shared macros so all lessons use one consistent notation.
const macros: Record<string, string> = {
  '\\E': '\\mathbb{E}',
  '\\R': '\\mathbb{R}',
  '\\Var': '\\operatorname{Var}',
  '\\Cov': '\\operatorname{Cov}',
  '\\Bias': '\\operatorname{Bias}',
  '\\SSE': '\\operatorname{SSE}',
  '\\RSS': '\\operatorname{RSS}',
  '\\MSE': '\\operatorname{MSE}',
  '\\RMSE': '\\operatorname{RMSE}',
  '\\MAE': '\\operatorname{MAE}',
  '\\SST': '\\operatorname{SST}',
  '\\argmin': '\\operatorname*{arg\\,min}',
  '\\argmax': '\\operatorname*{arg\\,max}',
  '\\diag': '\\operatorname{diag}',
  '\\sign': '\\operatorname{sign}',
  '\\T': '^{\\top}',
  '\\bx': '\\mathbf{x}',
  '\\by': '\\mathbf{y}',
  '\\be': '\\mathbf{e}',
  '\\bv': '\\mathbf{v}',
  '\\bz': '\\mathbf{z}',
  '\\N': '\\mathcal{N}',
  '\\Lik': '\\mathcal{L}',
  // colour classes that match the charts (see styles: .k-data, .k-fit, …)
  '\\cdata': '\\htmlClass{k-data}{#1}',
  '\\cfit': '\\htmlClass{k-fit}{#1}',
  '\\cres': '\\htmlClass{k-res}{#1}',
  '\\cpen': '\\htmlClass{k-pen}{#1}',
  '\\cvar': '\\htmlClass{k-var}{#1}',
  '\\cbias': '\\htmlClass{k-bias}{#1}',
  '\\cnoise': '\\htmlClass{k-noise}{#1}',
  // week 2: classes
  '\\cpos': '\\htmlClass{k-pos}{#1}',
  '\\cneg': '\\htmlClass{k-neg}{#1}',
  '\\TP': '\\mathrm{TP}',
  '\\TN': '\\mathrm{TN}',
  '\\FP': '\\mathrm{FP}',
  '\\FN': '\\mathrm{FN}',
  '\\TPR': '\\mathrm{TPR}',
  '\\FPR': '\\mathrm{FPR}',
  '\\AUC': '\\mathrm{AUC}',
  '\\Prec': '\\mathrm{Prec}',
  '\\Rec': '\\mathrm{Rec}',
  '\\Acc': '\\mathrm{Acc}',
  '\\Fone': '\\mathrm{F1}',
  '\\Ind': '\\mathbb{I}',
  '\\bw': '\\mathbf{w}',
  '\\bp': '\\mathbf{p}',
  '\\bn': '\\mathbf{n}',
  '\\ba': '\\mathbf{a}',
  '\\bmu': '\\boldsymbol{\\mu}',
  '\\bxt': '\\tilde{\\mathbf{x}}',
};

function render(tex: string, display: boolean) {
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    macros: { ...macros },
    strict: 'ignore',
    trust: (ctx) => ctx.command === '\\htmlClass',
  });
}

/** Inline maths: <M t="\hat y = \theta_0 + \theta_1 x" /> */
export const M = memo(function M({ t }: { t: string }) {
  const html = useMemo(() => render(t, false), [t]);
  return <span className="m-inline" dangerouslySetInnerHTML={{ __html: html }} />;
});

/** Display maths, horizontally scrollable on narrow screens. */
export const MB = memo(function MB({ t, label }: { t: string; label?: string }) {
  const html = useMemo(() => render(t, true), [t]);
  return (
    <div className="m-block">
      <div className="m-block-inner" dangerouslySetInnerHTML={{ __html: html }} />
      {label && <span className="m-label">{label}</span>}
    </div>
  );
});
