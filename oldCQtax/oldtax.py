import requests
import execjs
url='https://etax.chongqing.chinatax.gov.cn/ajax.sword?ctrl=WBLoginGdgjBakCtrl_generateRandomKey'
res=requests.post(url)
lol=res.json()['data'][0]['value']

obj=execjs.compile(open('oldtax.js', encoding='utf-8').read())

s=obj.call('password',"111",lol)

print(s)