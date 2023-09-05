import re
import time
import json
import execjs
import requests
from loguru import logger


headers = {
'accept': 'application/json',
'accept-encoding': 'gzip, deflate, br',
'content-type':' text/plain;charset=UTF-8',
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
}



pyload=execjs.compile(open('finalcode.js', encoding='utf-8').read()).call("ts")
print(pyload)
url='https://dkapi.geetest.com/deepknow/v2/judge?pt=1&app_id=461cca3146ff093d059dee9439aa6b26&session_id=002e4a62-01fa-4d2a-958e-74d5214e42d8'



r=requests.post(url,data=pyload)
print(r.json())