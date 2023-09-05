import requests
from functools import partial
import subprocess
subprocess.Popen=partial(subprocess.Popen,encoding='utf-8')
import execjs
import base64
from PIL import Image
import json
session=requests.session()
session.headers.update({
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.68"
})

ts=execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('time')
def get_do():
    url = "https://etax.guizhou.chinatax.gov.cn/sso/captcha/get.do?8i8UWOrl=AWjCDAlqEkj6AVqNlPkb09uK67Bu.90dUhEsiUMwkwMTmlldoFjIEta7e4YRDEeTvBMPyUjc_iLIMq33x2X21SUtatVqYwK4"
    data={
        "captchaType": "clickWord",
        "clientUid": "",
        "ts": ts,
        "browserInfo": "{\"client\":{\"agent\":\"mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/112.0.0.0 safari/537.36 edg/112.0.1722.68\",\"isIE\":false,\"isGecko\":false,\"isWebkit\":true,\"isStrict\":true,\"type\":\"Chrome\",\"version\":\"112.0.0.0\",\"name\":\"Chrome\"}}"
    }
    r=session.post(url=url,json=data)
    img_content =base64.b64decode(r.json()['repData']['originalImageBase64'])
    img_content2 =base64.b64decode(r.json()['repData']['wordImageBase64'])
    with open('ts.png','wb')as f:
        f.write(img_content)
    with open('ts1.png', 'wb') as f:
        f.write(img_content2)
    # print(r.json())
    return r.json()
def merge_image(a_path,b_path):
    # 打开第一张图片
    image1 = Image.open(a_path)
    # 打开第二张图片
    image2 = Image.open(b_path)
    # 确定合成图片的大小
    width, height = image1.size
    total_width = width
    max_height = height+image2.size[1]
    # 创建一张新图片
    new_image = Image.new('RGB', (total_width, max_height))
    # 将第一张图片放在新图片上
    new_image.paste(image1, (0, 0))
    # 将第二张图片放在新图片上
    new_image.paste(image2, (0, height))
    # 保存新图片
    new_image.save("new_image.png")
def base64_api(uname, pwd, img, typeid):
    with open(img, 'rb') as f:
        base64_data = base64.b64encode(f.read())
        b64 = base64_data.decode()
    data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
    result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
    if result['success']:
        result = result["data"]["result"]
        lst = result.split("|")
        lst2 = []
        for i in lst:
            lst2.append({"x": i.split(",")[0], "y": i.split(",")[1]})
        return lst2

def check_do(secretKey,token,ts,lst):
    pointJson = execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call("encrypt", lst, secretKey)
    data = {
        "captchaType": "clickWord",
        "pointJson": pointJson,
        "token": token,
        "clientUid": "",
        "ts":ts
    }
    url = "https://etax.guizhou.chinatax.gov.cn/sso/captcha/check.do?8i8UWOrl=LFRmUalqEk.6ZFjdYsEag_QISwnz_JVXuPLPQrK8.0NlfPLpbVVnEHP2BEiharUMUv_La0Be8q0dCPseZOhqL0QqRHoqnEhQ"
    r = session.post(url=url, json=data)
    print(r.json())

def sendSms(token,secretKey,lst):
    res = execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('zhuan', token, lst)
    captchaVerification = execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('encrypt1', res, secretKey)
    data = {
        "userName": "18324183389",
        "pwd": "11Zsj2951",
        "captchaVerification": captchaVerification
    }
    url = "https://etax.guizhou.chinatax.gov.cn/sso/flow/zrr/sendYzm.do?8i8UWOrl=lkLzTAlqEqR9QS2nAdwTmK6AHz5ApvOZDxqPjkb96UIECUYDyOZ2EhHXcia1EU0qlCX0_xRgqm061WbkWwdJF82Tau4d9dja"
    r = session.post(url=url, json=data)
    print(r.json())
def main_do():
    yzm = input("请输入验证码：")
    url = "https://etax.guizhou.chinatax.gov.cn/sso/flow/main.do?8i8UWOrl=nQDdZGlqEqR9QS2nAdwTmK6AHz5ApvOZDxqPjkb96UIECUYDyOZ2EDJLge1LARMe9zZ5l1ztm3iQfnjDZ1TMa7y2NURYV1S0"
    data = {
        "userName": "18324183389",
        "passWord": "11Zsj2951",
        "yzm": yzm,
        "ywlx": "01",
        "renew": 'true',
        "authenticationType": "ZrrAccountPwdAuthenticate",
        "initType": "zrr"
    }
    r = session.post(url=url, json=data)
    print(r.json())
if __name__ == "__main__":
    r=get_do()
    merge_image('ts.png','ts1.png')
    img_path = "new_image.png"
    result = base64_api(uname='wananovo', pwd='11Zsj2951', img=img_path, typeid=27)
    print(result)
    secretKey = r['repData']['secretKey']
    token = r['repData']['token']
    check_do(secretKey,token,ts,result)
    sendSms(token,secretKey,result)
    main_do()




