# StudyFlow — чотири лабораторні роботи

Кожна лабораторна містить самостійний стан проєкту. Word-звіти та архіви надано окремо як файли для завантаження.

| Робота | Зміст |
|---|---|
| [ЛР1](Lab1_StudyFlow) | Планування, брендбук, вимоги, MVP |
| [ЛР2](Lab2_StudyFlow) | П’ять HTML-сторінок |
| [ЛР3](Lab3_StudyFlow) | Адаптивне CSS-оформлення |
| [ЛР4](Lab4_StudyFlow) | JavaScript, форми, localStorage |

У кожному каталозі: README.md — запуск, SUBMISSION.md — здача, DEFENSE.md — пояснення для захисту, REQUIREMENTS.md — відповідність завданню. ЛР1 має матеріали дизайну, ЛР2–4 — код і перевірки.

Запуск ЛР2–4: відкрийте index.html; для роботи з одним origin рекомендовано `python -m http.server 8000` у каталозі відповідної роботи.

Перевірки HTML: усі 15 сторінок — без помилок і попереджень Nu HTML Checker. Chrome, Firefox, Microsoft Edge та справжній Safari: [успішний запуск CI](https://github.com/StasDehtiar/-/actions/runs/38281531195). Сценарії відтворюються workflow у .github/workflows та скриптами ci/.

[Робочий сайт ЛР4](https://studyflow-labs.ochre-kite-2688.chatgpt.site). Це клієнтський навчальний MVP: дані зберігаються локально, контактна форма демонструє перевірку без доставки листів.
