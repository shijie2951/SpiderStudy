import requests
from functools import partial
import subprocess
subprocess.Popen=partial(subprocess.Popen,encoding='utf-8')
import execjs
import base64
import time
from PIL import Image
import json
session=requests.session()
session.headers.update({
    "Accept": "application/json, text/javascript, */*; q=0.01",
    # "Accept-Encoding": "gzip, deflate, br",
    # "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
    # "Connection": "keep-alive",
    # "Content-Type": "application/json;charset=UTF-8",
    # 'Cookie': '1zIlXIQYC8aAP=BBzJBPRx62bv5dretW1YV9Z9Rlyl2OWWp32eiHMYqA5RC5ktPnmHb9YXNDThUpRedWrKIVbHFM4IDUI_JuHBLLFsTvuQDDgzgpZcHm7HF7r7BlxvGio4nON2KYFKnMxbLDgjwen0EjNgxY7dVxDSr8Wc_pII7WJqj59WFAVdq5mIkCAuRIgiXuDKGrrX16BOKAX1fuV.31hGXojnIcuKR25LQVFgnMNTJ70.FmClwSLdhBoq.hqkeSSp4IxcbEewTobV5xQBLt5qrYKACfSgLXz7GQ8kcg2Oo6gkoCOs3CWyGorzktL5vgj4LcS0cxqMrowegUUolrewIZ1361k8_FiDR_MadE0OG18fVKLmF2l2ETIeA3IIuadhDhokQRmeUCM5upQ58DDfp8gDL34Ax_3wolS41790I1PdW7h71y0',
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.68"
})
url="https://etax.guizhou.chinatax.gov.cn/sso/captcha/get.do?8i8UWOrl=AWjCDAlqEkj6AVqNlPkb09uK67Bu.90dUhEsiUMwkwMTmlldoFjIEta7e4YRDEeTvBMPyUjc_iLIMq33x2X21SUtatVqYwK4"
ts=execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('time')
data={
    "captchaType": "clickWord",
    "clientUid": "",
    "ts": ts,
    "browserInfo": "{\"client\":{\"agent\":\"mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/112.0.0.0 safari/537.36 edg/112.0.1722.68\",\"isIE\":false,\"isGecko\":false,\"isWebkit\":true,\"isStrict\":true,\"type\":\"Chrome\",\"version\":\"112.0.0.0\",\"name\":\"Chrome\"}}"
}
# dd=
r=session.post(url=url,json=data)
# print(r.json()['repData']['originalImageBase64'])
img_content =base64.b64decode(r.json()['repData']['originalImageBase64'])
img_content2 =base64.b64decode(r.json()['repData']['wordImageBase64'])
with open('ts.png','wb')as f:
    f.write(img_content)
with open('ts1.png', 'wb') as f:
    f.write(img_content2)
# 打开第一张图片
image1 = Image.open("ts.png")

# 打开第二张图片
image2 = Image.open("ts1.png")


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

def dumps(dict_data):
    return json.dumps(dict_data, separators=(',',':'))
def base64_api(uname, pwd, img, typeid):
    with open(img, 'rb') as f:
        base64_data = base64.b64encode(f.read())
        b64 = base64_data.decode()
    data = {"username": uname, "password": pwd, "typeid": typeid, "image": b64}
    result = json.loads(requests.post("http://api.ttshitu.com/predict", json=data).text)
    if result['success']:
        return result["data"]["result"]


if __name__ == "__main__":
    img_path = "new_image.png"
    result = base64_api(uname='wananovo', pwd='11Zsj2951', img=img_path, typeid=27)
    print(result)
    lst=result.split("|")
    dic = {}
    lst2 = []
    for i in lst:
        lst2.append({"x": i.split(",")[0], "y": i.split(",")[1]})

    secretKey = r.json()['repData']['secretKey']
    token = r.json()['repData']['token']
    print(secretKey)
    print(token)
    # secretKey="99255a78e986c2402a2a3d2329b6f9f9"
    pointJson=execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call("encrypt", lst2, secretKey)
    print(pointJson)

    data2 = {
        "captchaType": "clickWord",
        "pointJson": pointJson,
        "token": token,
        "clientUid": "",
        "ts": ts
    }
    url="https://etax.guizhou.chinatax.gov.cn/sso/captcha/check.do?8i8UWOrl=LFRmUalqEk.6ZFjdYsEag_QISwnz_JVXuPLPQrK8.0NlfPLpbVVnEHP2BEiharUMUv_La0Be8q0dCPseZOhqL0QqRHoqnEhQ"
    r=session.post(url=url,json=data2)
    print(r.text)
#
    res=execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('zhuan', token, lst2)
    captchaVerification=execjs.compile(open('FinalCode.js', encoding='utf-8').read()).call('encrypt1', res, secretKey)
    data3={
    "userName": "18324183389",
    "pwd": "11Zsj2951",
    "captchaVerification": captchaVerification
}
    url3="https://etax.guizhou.chinatax.gov.cn/sso/flow/zrr/sendYzm.do?8i8UWOrl=lkLzTAlqEqR9QS2nAdwTmK6AHz5ApvOZDxqPjkb96UIECUYDyOZ2EhHXcia1EU0qlCX0_xRgqm061WbkWwdJF82Tau4d9dja"
    r3=session.post(url=url3,json=data3)
    print(r3.json())

    yzm=input("请输入验证码：")
    url4="https://etax.guizhou.chinatax.gov.cn/sso/flow/main.do?8i8UWOrl=nQDdZGlqEqR9QS2nAdwTmK6AHz5ApvOZDxqPjkb96UIECUYDyOZ2EDJLge1LARMe9zZ5l1ztm3iQfnjDZ1TMa7y2NURYV1S0"
    data4={
    "userName": "18324183389",
    "passWord": "11Zsj2951",
    "yzm": yzm,
    "ywlx": "01",
    "renew": 'true',
    "authenticationType": "ZrrAccountPwdAuthenticate",
    "initType": "zrr"
    }
    r4=session.post(url=url4,json=data4)
    print(r4.json())
    url5="https://etax.guizhou.chinatax.gov.cn/xxmh/myCenterController/getIndexConf.do"
    r5=session.post(url=url5)
    print(r5.json())
    url6="https://etax.guizhou.chinatax.gov.cn/yyzxn-cjpt-web/yyzx/qjss/getCdPy.do"
    r6=session.post(url=url6)
    print(r6.json())


