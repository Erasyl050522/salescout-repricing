import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Product, PriceResult } from "../../src/types";
import products from "../../data/products.json";
import "./style.css";

type Row = PriceResult & { name: string };
const money = (value: number) => `${value.toLocaleString("ru-RU")} ₸`;
const reasons: Record<PriceResult["reason"], string> = {
  UNDERCUT: "Дешевле конкурента", AT_MIN: "Минимальная цена",
  AT_MAX: "Максимальная цена", NO_COMPETITORS: "Нет конкурентов в наличии",
};

function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function reprice() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/reprice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products satisfies Product[]),
      });
      if (!response.ok) throw new Error(`Ошибка API: ${response.status}`);
      const results = await response.json() as PriceResult[];
      setRows(results.map((result, index) => ({ ...result, name: products[index].name })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void reprice(); }, []);
  return <main>
    <header><div><span className="eyebrow">SALESCOUT / REPRICING</span><h1>Расчёт цен</h1><p>Сравнение текущих цен с предложениями конкурентов</p></div>
      <button onClick={() => void reprice()} disabled={loading}>{loading ? "Расчёт…" : "↻ Пересчитать"}</button></header>
    <section className="panel"><div className="panel-head"><h2>Товары</h2><span>{rows.length} позиций</span></div>
      {error && <p className="error" role="alert">{error}. Проверьте, что сервер запущен.</p>}
      <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Название</th><th>Было</th><th>Стало</th><th>Причина</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.sku}><td className="sku">{row.sku}</td><td>{row.name}</td><td>{money(row.oldPrice)}</td><td className="new-price">{money(row.newPrice)}</td><td><span className="tag" title={row.reason}>{reasons[row.reason]}</span></td></tr>)}</tbody></table></div>
      {!loading && !error && rows.length === 0 && <p className="empty">Нет товаров</p>}
    </section><footer>Цены рассчитаны сервером по правилам SaleScout.</footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
