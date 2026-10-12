/* StudyFlow · ЛР4. Клієнтський MVP без сторонніх бібліотек. */
'use strict';

(() => {
  const TASK_KEY = 'studyflow.tasks.v1';
  const THEME_KEY = 'studyflow.theme.v1';
  const main = document.querySelector('main');
  let storageAvailable = true;
  function readStore(key) {
    try { return localStorage.getItem(key); }
    catch { storageAvailable = false; return null; }
  }
  function saveStore(key, value) {
    try { localStorage.setItem(key, value); return true; }
    catch { storageAvailable = false; return false; }
  }

  // 2.1 querySelectorAll: стиль усіх карток змінюється саме через JS.
  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.borderTopColor = 'var(--primary)';
    card.style.backgroundColor = 'var(--soft)';
    card.dataset.enhanced = 'true';
  });
  // 2.1 createElement + append: новий абзац у кінці main.
  const note = document.createElement('p');
  note.className = 'dom-note';
  note.textContent = 'Порада: ArrowUp / ArrowDown змінюють розмір тексту поза полями вводу.';
  main.append(note);

  // 2.2 Поточна дата, оновлення після зміни дня або повернення на вкладку.
  const footerDate = document.querySelector('#current-date');
  function updateDate() {
    const now = new Date();
    footerDate.dateTime = localDate(now);
    footerDate.textContent = now.toLocaleDateString('uk-UA', {day:'numeric',month:'long',year:'numeric'});
  }
  function localDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  updateDate();
  setInterval(updateDate, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateDate(); });
  const more = document.querySelector('#more-toggle');
  if (more) more.addEventListener('click', () => {
    const block = document.querySelector('#more-content');
    block.hidden = !block.hidden;
    more.setAttribute('aria-expanded', String(!block.hidden));
    more.textContent = block.hidden ? 'Показати більше' : 'Показати менше';
  });

  // 3.1 click: тема і bonus localStorage.
  const themeButton = document.querySelector('#theme-toggle');
  function setTheme(dark) {
    document.body.classList.toggle('dark-theme', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.textContent = dark ? 'Світла тема' : 'Темна тема';
  }
  setTheme(readStore(THEME_KEY) === 'dark');
  themeButton.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-theme');
    setTheme(dark);
    if (!saveStore(THEME_KEY, dark ? 'dark' : 'light')) note.textContent = 'Тему змінено. Постійне збереження в цьому браузері недоступне.';
  });

  // 3.2 Підсвітка навігації додається обробниками JS, не :hover.
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('mouseenter', () => link.classList.add('nav-hover'));
    link.addEventListener('mouseleave', () => link.classList.remove('nav-hover'));
    link.addEventListener('focus', () => link.classList.add('nav-hover'));
    link.addEventListener('blur', () => link.classList.remove('nav-hover'));
  });
  let fontSize = 16;
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    if (event.target.closest('input,textarea,select,button,summary,[contenteditable="true"],[role="textbox"]')) return;
    if (!['ArrowUp','ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    fontSize = Math.max(12, Math.min(24, fontSize + (event.key === 'ArrowUp' ? 1 : -1)));
    document.documentElement.style.fontSize = `${fontSize}px`;
  });

  function showError(field, message) {
    field.classList.toggle('invalid', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
    const target = document.getElementById(`${field.id}-error`);
    if (target) target.textContent = message;
  }

  // 4.1/4.2: submit, preventDefault, зчитування кожного поля, власні перевірки.
  const contact = document.querySelector('#contact-form');
  if (contact) {
    contact.noValidate = true; // Без JS працюють HTML5-атрибути; з JS показуємо власні помилки.
    const fields = ['name','email','topic','message','consent'].map(id => document.getElementById(id));
    contact.addEventListener('submit', event => {
      event.preventDefault();
      const [name,email,topic,message,consent] = fields;
      const data = {
        name: name.value.trim(), email: email.value.trim(), topic: topic.value,
        message: message.value.trim(), consent: consent.checked
      };
      const errors = [
        data.name.length < 3 || data.name.length > 80 ? 'Ім’я повинно містити від 3 до 80 символів.' : '',
        data.email.length > 120 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(data.email) ? 'Введіть email з @ та доменом, наприклад student@example.com.' : '',
        !['idea','problem','question'].includes(data.topic) ? 'Оберіть тему повідомлення.' : '',
        data.message.length < 10 || data.message.length > 2000 ? 'Повідомлення повинно містити від 10 до 2000 символів.' : '',
        !data.consent ? 'Підтвердьте згоду на локальну перевірку.' : ''
      ];
      fields.forEach((field,index) => showError(field, errors[index]));
      const result = document.querySelector('#form-result');
      result.replaceChildren();
      result.classList.remove('success');
      const first = errors.findIndex(Boolean);
      if (first !== -1) {
        result.textContent = 'Перевірте поля, позначені червоним.';
        fields[first].focus();
        return;
      }
      const success = document.createElement('p');
      success.textContent = 'Форма успішно надіслана!';
      const clarification = document.createElement('p');
      clarification.textContent = 'Навчальна демонстрація: дані перевірено локально, на сервер їх не передано.';
      const values = document.createElement('dl');
      [['Ім’я',data.name],['Email',data.email],['Тема',topic.selectedOptions[0].textContent],['Текст',data.message],['Згода',data.consent ? 'Так' : 'Ні']].forEach(([label,value]) => {
        const dt = document.createElement('dt'); dt.textContent = label;
        const dd = document.createElement('dd'); dd.textContent = value;
        values.append(dt,dd);
      });
      // textContent унеможливлює виконання HTML з полів.
      result.append(success,clarification,values);
      result.classList.add('success');
      contact.reset();
      fields.forEach(field => showError(field,''));
    });
    fields.forEach(field => field.addEventListener('input', () => showError(field,'')));
  }

  // Додатковий MVP: список завдань із локальним збереженням.
  function isDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return !Number.isNaN(date.getTime()) && localDate(date) === value;
  }
  function isTask(task) {
    return task && typeof task.id === 'string' && typeof task.title === 'string' && task.title.trim().length>=3 && task.title.length<=120 && typeof task.subject==='string' && task.subject.trim().length>=2 && task.subject.length<=60 && typeof task.due==='string' && isDate(task.due) && ['normal','high'].includes(task.priority) && typeof task.done==='boolean';
  }
  let tasks = [];
  const rawTasks = readStore(TASK_KEY);
  try {
    const decoded = rawTasks ? JSON.parse(rawTasks) : [];
    if (!Array.isArray(decoded) || decoded.some(task => !isTask(task))) throw new Error('Invalid stored data');
    tasks = decoded;
  } catch { note.textContent = 'Збережений список пошкоджено. Почато новий список; додай завдання повторно.'; }
  function persistTasks() {
    const saved = saveStore(TASK_KEY, JSON.stringify(tasks));
    if (!saved) note.textContent = 'Завдання доступні в цій вкладці. Постійне збереження в браузері недоступне.';
    return saved;
  }
  const list = document.querySelector('#task-list');
  const filter = document.querySelector('#task-filter');
  const search = document.querySelector('#task-search');
  function renderTasks() {
    if (!list) return;
    list.replaceChildren();
    const query = search.value.toLocaleLowerCase('uk-UA').trim();
    const selected = tasks.filter(task => (filter.value === 'all' || (filter.value === 'done' ? task.done : !task.done)) && `${task.title} ${task.subject}`.toLocaleLowerCase('uk-UA').includes(query)).sort((a,b) => a.due.localeCompare(b.due));
    document.querySelector('#task-stats').textContent = `Усього: ${tasks.length} · Виконано: ${tasks.filter(t=>t.done).length} · Показано: ${selected.length}`;
    if (!selected.length) {
      const empty = document.createElement('li');
      empty.textContent = tasks.length ? 'За цим фільтром завдань немає.' : 'Список порожній. Додай перше завдання.';
      list.append(empty);
    }
    selected.forEach(task => {
      const item = document.createElement('li'); item.className = `task-item${task.done ? ' done' : ''}`;
      const info = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = task.title;
      const details = document.createElement('p');
      details.textContent = `${task.subject} · ${new Date(`${task.due}T12:00:00`).toLocaleDateString('uk-UA')} · ${task.priority==='high' ? 'Високий' : 'Звичайний'} пріоритет`;
      info.append(title,details);
      const controls = document.createElement('div'); controls.className = 'task-controls';
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'button button-quiet';
      toggle.textContent = task.done ? 'Відновити' : 'Виконано';
      toggle.setAttribute('aria-label',`${task.done ? 'Відновити' : 'Завершити'} завдання ${task.title}`);
      toggle.addEventListener('click', () => {task.done=!task.done;persistTasks();renderTasks();});
      const remove = document.createElement('button'); remove.type = 'button';remove.className = 'button button-quiet';remove.textContent = 'Видалити';
      remove.setAttribute('aria-label',`Видалити завдання ${task.title}`);
      remove.addEventListener('click', () => {
        if (!window.confirm(`Видалити завдання «${task.title}»?`)) return;
        tasks = tasks.filter(t=>t.id!==task.id);persistTasks();renderTasks();
      });
      controls.append(toggle,remove);item.append(info,controls);list.append(item);
    });
  }
  const taskForm = document.querySelector('#task-form');
  if (taskForm) {
    taskForm.noValidate = true;
    taskForm.addEventListener('submit', event => {
      event.preventDefault();
      const title=document.querySelector('#task-title'),subject=document.querySelector('#task-subject'),due=document.querySelector('#task-due'),priority=document.querySelector('#task-priority');
      const fields=[title,subject,due,priority];
      const errors=[title.value.trim().length<3 || title.value.trim().length>120 ? 'Назва: від 3 до 120 символів.' : '',subject.value.trim().length<2 || subject.value.trim().length>60 ? 'Предмет: від 2 до 60 символів.' : '',!isDate(due.value) ? 'Вкажи коректну дату.' : '',!['normal','high'].includes(priority.value) ? 'Обери пріоритет.' : ''];
      fields.forEach((field,index)=>showError(field,errors[index]));
      const first=errors.findIndex(Boolean);
      if (first!==-1) {fields[first].focus();return;}
      const id = typeof crypto.randomUUID==='function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      tasks.push({id,title:title.value.trim(),subject:subject.value.trim(),due:due.value,priority:priority.value,done:false});
      const saved=persistTasks();taskForm.reset();renderTasks();
      document.querySelector('#task-result').textContent = saved ? 'Завдання додано та збережено.' : 'Завдання додано для поточного сеансу.';
    });
    filter.addEventListener('change',renderTasks);search.addEventListener('input',renderTasks);renderTasks();
  }

  // Календар будується з реальних завдань браузерного MVP.
  const grid = document.querySelector('#calendar-grid');
  const today = new Date();
  let month = new Date(today.getFullYear(),today.getMonth(),1);
  function renderCalendar() {
    if (!grid) return;
    grid.replaceChildren();
    document.querySelector('#calendar-title').textContent = month.toLocaleDateString('uk-UA',{month:'long',year:'numeric'});
    ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].forEach(day => {const label=document.createElement('div');label.className='weekday';label.textContent=day;grid.append(label);});
    const offset=(month.getDay()+6)%7;
    for(let i=0;i<offset;i++){const empty=document.createElement('div');empty.className='calendar-cell muted';empty.setAttribute('aria-hidden','true');grid.append(empty);}
    const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    for(let day=1;day<=count;day++){
      const date=localDate(new Date(month.getFullYear(),month.getMonth(),day));
      const cell=document.createElement('div');cell.className=`calendar-cell${date===localDate(today) ? ' today' : ''}`;
      const label=document.createElement('time');label.dateTime=date;label.textContent=String(day);cell.append(label);
      tasks.filter(task=>task.due===date).forEach(task=>{const link=document.createElement('a');link.href='tasks.html';link.textContent=`${task.done ? '✓ ' : ''}${task.title}`;cell.append(link);});
      grid.append(cell);
    }
  }
  if(grid){
    document.querySelector('#month-prev').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);renderCalendar();});
    document.querySelector('#month-next').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);renderCalendar();});
    document.querySelector('#month-today').addEventListener('click',()=>{const now=new Date();month=new Date(now.getFullYear(),now.getMonth(),1);renderCalendar();});
    renderCalendar();
  }
  // Оновлення між вкладками з однаковим origin.
  window.addEventListener('storage',event=>{
    if(event.key===THEME_KEY)setTheme(event.newValue==='dark');
    if(event.key===TASK_KEY){try{const value=event.newValue ? JSON.parse(event.newValue) : [];if(Array.isArray(value)&&value.every(isTask)){tasks=value;renderTasks();renderCalendar();}}catch{/* Залишити поточний коректний стан. */}}
  });
  if(!storageAvailable)note.textContent='Постійне збереження недоступне. Дані залишаються в пам’яті поточної вкладки.';
})();
