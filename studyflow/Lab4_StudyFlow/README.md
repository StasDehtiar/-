# StudyFlow — лабораторна робота 4

Автор: Дегтяр Станіслав. Навчальний проєкт планувальника навчання.

## Запуск
Відкрийте `index.html` у браузері. Для стабільної роботи localStorage рекомендовано HTTP:

```bash
python -m http.server 8000
```

Перейдіть на http://localhost:8000. Жодних npm-залежностей чи CDN немає.

## Структура
- `index.html` — головна;
- `tasks.html` — завдання;
- `calendar.html` — календар;
- `about.html` — опис та інструкція;
- `contacts.html` — контактна форма;
- `images/` — власні компактні SVG;
- `css/` — зовнішні стилі base.css, layout.css, components.css та style.css з @import;
- `js/` — main.js, DOM, Events, Validation, LocalStorage;
- `verification/` — фактичні результати перевірок;
- `REPORT.docx` — звіт;
- `SUBMISSION.md` — стан вимог та порядок публікації.

## Поточний етап
DOM: querySelectorAll, createElement, append, textContent; Events: click, submit, mouseenter, mouseleave, keydown; власна Validation контактної форми; LocalStorage теми і завдань. Додавання, зміна статусу, видалення, пошук, фільтр, сортування за датою та календар.

## Обмеження
Це клієнтський навчальний MVP. Авторизації, серверної БД, реального надсилання листів та синхронізації між пристроями немає. Форма демонструє перевірку даних і показує введені значення локально. При недоступному localStorage сайт працює в пам’яті та повідомляє про незбереження.

## Віддалений репозиторій
GitHub: https://github.com/StasDehtiar/-/tree/studyflow-labs/studyflow/Lab4_StudyFlow

Окрема гілка `studyflow-labs` містить чотири папки для незалежної здачі.

## Версії лабораторних
Кожний архів містить самостійний стан проєкту. ЛР2 — HTML; ЛР3 — HTML+CSS; ЛР4 — HTML+CSS+JS. В одному репозиторії можна створити теги `lab-2`, `lab-3`, `lab-4`, або окремі репозиторії для кожної здачі.
