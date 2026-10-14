# SaleScout — тестовое задание (web-разработчик)

Приложение пересчитывает цены товаров по минимальной цене конкурента в наличии с учётом шага снижения и допустимого диапазона. Включает чистую функцию, Express API, React-страницу и автоматические тесты.

## Требования

- Node.js 20 или новее
- npm

## Установка

```bash
npm install
```

## Запуск

Откройте два терминала в корне проекта.

**Терминал 1 — API:**

```bash
npm run dev:server
```

API будет доступен на `http://localhost:3000`.

**Терминал 2 — React:**

```bash
npm run dev:web
```

Откройте `http://localhost:5173`. Страница автоматически отправляет исходные данные из `data/products.json` на сервер и показывает результаты. Кнопка «Пересчитать» повторяет запрос.

## Проверки

```bash
npm test
npm run typecheck
npm run build
```

## API

`POST /reprice` принимает JSON-массив `Product[]`, возвращает `PriceResult[]` в исходном порядке. Неверное тело запроса (в том числе не массив) — HTTP 400.

Пример запроса (при запущенном API):

```bash
curl -X POST http://localhost:3000/reprice -H "Content-Type: application/json" -d '[{"sku":"A","name":"Phone","myPrice":400,"minPrice":100,"maxPrice":500,"step":10,"competitors":[{"seller":"B","price":300,"inStock":true}]}]'
```

Ответ:

```json
[{"sku":"A","oldPrice":400,"newPrice":290,"reason":"UNDERCUT"}]
```

## Правила расчёта

Реализация в **`src/pricing.ts`** экспортирует именованную чистую функцию `calculatePrice(product)`.

1. Учитываются только конкуренты с `inStock: true`.
2. Если их нет, возвращается `maxPrice` с причиной `NO_COMPETITORS`.
3. Иначе `candidate = Math.floor(min(available prices) - step)`.
4. Если `candidate < minPrice`, возвращается `minPrice` / `AT_MIN`.
5. Если `candidate > maxPrice`, возвращается `maxPrice` / `AT_MAX`.
6. В остальных случаях возвращается `candidate` / `UNDERCUT`, включая точное попадание в границу.

`oldPrice` всегда равен исходному `myPrice` и не влияет на расчёт.

## Структура

- `src/types.ts` — типы задания
- `src/pricing.ts` — чистая функция расчёта
- `src/server.ts` — Express API и проверка тела запроса
- `src/index.ts` — запуск HTTP-сервера
- `web/` — React + Vite
- `tests/` — Vitest-тесты функции и API
- `data/` — исходные данные и ожидаемые результаты

## Публикация на GitHub

Создайте собственный публичный репозиторий. Для осмысленной истории коммитов рекомендуется коммитить работу поэтапно: расчёт цены, тесты, API, React и документацию. Не добавляйте в Git `node_modules` и `web/dist`.
