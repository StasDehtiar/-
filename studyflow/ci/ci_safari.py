from pathlib import Path
import json, threading, datetime
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

root=Path('studyflow').resolve();out=Path('browser-artifacts');out.mkdir(exist_ok=True)
server=ThreadingHTTPServer(('127.0.0.1',8000),partial(SimpleHTTPRequestHandler,directory=str(root)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[];driver=webdriver.Safari()
try:
 for lab in [2,3,4]:
  for width in [1440,768,390]:
   driver.set_window_size(width,1000)
   for file in ['index','tasks','calendar','about','contacts']:
    driver.get(f'http://127.0.0.1:8000/Lab{lab}_StudyFlow/{file}.html')
    WebDriverWait(driver,15).until(EC.presence_of_element_located((By.TAG_NAME,'h1')))
    viewport=driver.execute_script('return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth+1}')
    if lab>=3:assert not viewport['overflow'],f'Safari overflow {lab}/{file}/{viewport}'
    checks.append({'lab':lab,'page':file,'requested_width':width,'viewport':viewport,'passed':True})
    if file=='index':driver.save_screenshot(str(out/f'safari-lab{lab}-{width}.png'))
 driver.get('http://127.0.0.1:8000/Lab4_StudyFlow/contacts.html')
 driver.find_element(By.CSS_SELECTOR,'#contact-form button[type=submit]').click()
 assert len([e for e in driver.find_elements(By.CSS_SELECTOR,'.field-error') if e.text])==5
 driver.save_screenshot(str(out/'safari-lab4-form-errors.png'))
 checks.append({'test':'JavaScript form empty-field errors','passed':True})
 (out/'safari-results.json').write_text(json.dumps({'browser':'Safari','capabilities':driver.capabilities,'tested_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks},ensure_ascii=False,indent=2))
 print(f'Safari: {len(checks)} checks passed')
finally:driver.quit();server.shutdown()
