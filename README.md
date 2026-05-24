# Cheers Chicken · Винная карта

Цифровая винная карта для **Cheers Chicken** — одностраничный сайт с возможностью печати и переноса в Figma.

## 🍷 Что внутри

- **143 позиции** из 9 разделов: By the glass, Sparkling, France, Germany, Austria, Italy, Spain, Russia, Other countries
- Колонки: Год · Наименование/Производитель · Цена (Бокал ₽ для By the glass, Бутылка ₽ для остальных)
- Типографика: **Viaoda Libre** (заголовки) + **Cousine** (тело)
- Палитра бренда: cream `#F2F1D3` + бургунди `#671612` + олива `#AFAD7D` + чёрно-зелёный `#101C18`
- Панель **Tweaks** (правый нижний угол) — переключение темы, плотности, размера шрифта

## 📦 Структура

```
.
├── index.html              ← главная страница
├── Винная карта.html       ← копия (на русском)
├── menu.jsx                ← рендеринг меню (React + JSX через Babel)
├── tweaks-panel.jsx        ← панель настроек
├── wines-data.js           ← данные вин (window.WINE_DATA)
└── uploads/                ← исходники: Excel-карта, бренд-скриншоты
```

## 🚀 Локальный запуск

Любой статический сервер. Например:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Открыть `http://localhost:8000`.

## 🌐 GitHub Pages

1. Push в репозиторий
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` → `/ (root)` → Save
3. Через минуту страница будет доступна по адресу `https://<username>.github.io/<repo>/`

## 🎨 Перенос в Figma

1. В Figma установи плагин **html.to.design**
2. В плагине выбери **Import via URL**, вставь адрес опубликованной страницы
3. Тексты подтянутся как редактируемые слои

Альтернатива: открыть страницу → `⌘P` / `Ctrl+P` → Save as PDF → Figma → Place Image.

## ✏️ Обновление данных

Если меняется ассортимент:
1. Отредактируй исходный Excel в `uploads/`
2. Перегенерируй `wines-data.js` из этого Excel (структура: `[{ name, subs: [{ name, wines: [{year, name, producer, priceZakup, priceBokal, supplier, tag}] }] }]`)

Или редактируй `wines-data.js` напрямую.

## 🛠️ Принт / экспорт

Файл оптимизирован для печати на A4 (см. `@media print` в `index.html`):
- Сохраняется фирменный фон
- Каждый раздел — на отдельной странице
- Tweaks-панель скрыта
