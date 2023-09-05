import rsa
import random
import requests
import re
import json
import base64
import ddddocr
import hashlib
import execjs
def rsa_encrypt(random):
    """
    rsa加密
    :param random: 随机数
    :return: 加密后的随机数
    """
    # 公钥模数
    n = '00C1E3934D1614465B33053E7F48EE4EC87B14B95EF88947713D25EECBFF7E74C7977D02DC1D9451F79DD5D1C10C29ACB6A9B4D6FB7D0A0279B6719E1772565F09AF627715919221AEF91899CAE08C0D686D748B20A3603BE2318CA6BC2B59706592A9219D0BF05C9F65023A21D2330807252AE0066D59CEEFA5F2748EA80BAB81'
    # 公钥指数
    e = '10001'
    # 构造公钥
    key = rsa.PublicKey(e=int(e, 16), n=int(n, 16))
    # print('key:',key)
    # 加密
    message = rsa.encrypt(random.encode('utf-8'), key)
    # 转换成16进制
    encrypt_data = message.hex()
    return encrypt_data


# ss=rsa_encrypt("9557c14170a31bf5")
# print(ss)
url="https://gcaptcha4.geetest.com/load"
params={
    "captcha_id": "24f56dc13c40dc4a02fd0318567caef5",
    "challenge": "3f4502bd-c5f9-49e0-a9a7-be17f55835b9",
    "client_type": 'web',
    "risk_type": "slide",
    "lang": "zh",
    "callback": "geetest_1684137374859"
}
headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.42",
    "Content-Type": "text/javascript;charset=UTF-8"
}
r=requests.get(url=url,params=params,headers=headers)
print(r.text)
callback=re.findall('geetest_\d*',r.text)[0]
# print(callback)
json_text=re.findall("\{.*\}",r.text)
js=json.loads(json_text[0])
slice=js['data']['slice']
bg=js['data']['bg']
url="https://static.geetest.com/"
bg_r=requests.get(url=url+bg,headers=headers)
slice_r=requests.get(url=url+slice,headers=headers)
with open('bg.png','wb') as w:
    w.write(bg_r.content)
with open('slice.png','wb') as w:
    w.write(slice_r.content)

print(js)

slide = ddddocr.DdddOcr(det=False, ocr=False)

with open('slice.png', 'rb') as f:
    target_bytes = f.read()

with open('bg.png', 'rb') as f:
    background_bytes = f.read()

res = slide.slide_match(target_bytes, background_bytes)

setLeft=int(res['target'][0])

lot_number=js['data']['lot_number']
datetime=js['data']['pow_detail']['datetime']
process_token=js['data']['process_token']
payload=js['data']['payload']
# print(lot_number,datetime)
# print(payload)
# print(process_token)
def get_slide_track(distance):
    """
    根据滑动距离生成滑动轨迹
    :param distance: 需要滑动的距离
    :return: 滑动轨迹<type 'list'>: [[x,y,t], ...]
        x: 已滑动的横向距离
        y: 已滑动的纵向距离, 除起点外, 均为0
        t: 滑动过程消耗的时间, 单位: 毫秒
    """

    if not isinstance(distance, int) or distance < 0:
        raise ValueError(f"distance类型必须是大于等于0的整数: distance: {distance}, type: {type(distance)}")
    # 初始化轨迹列表
    slide_track = [
        [random.randint(-50, -10), random.randint(-50, -10), 0],
        [0, 0, 0],
    ]
    # 共记录count次滑块位置信息
    count = 30 + int(distance / 2)
    # 初始化滑动时间
    t = random.randint(50, 100)
    # 记录上一次滑动的距离
    _x = 0
    _y = 0
    for i in range(count):
        # 已滑动的横向距离
        x = round(__ease_out_expo(i / count) * distance)
        # 滑动过程消耗的时间
        t += random.randint(10, 20)
        if x == _x:
            continue
        slide_track.append([x, _y, t])
        _x = x
    slide_track.append(slide_track[-1])
    return slide_track, slide_track[-1][2]  # 大数组，滑动时间


def __ease_out_expo(sep):
    if sep == 1:
        return 1
    else:
        return 1 - pow(2, -10 * sep)

track=get_slide_track(setLeft)

userresponse=setLeft / 1.0059466666666665 + 2
# print(c)
# print(userresponse)
passtime=random.randint(100,10000)

dic = {
                         "setLeft": setLeft,
                         "track": track,
                         "passtime": passtime,
                         "userresponse": setLeft / 1.0059466666666665 + 2
                     }
i=execjs.compile(open('finalcode.js', encoding='utf-8').read()).call("get_i")

pow_msg="1|0|md5|{}|24f56dc13c40dc4a02fd0318567caef5|{}||{}".format(datetime,lot_number,i)
# print(pow_msg)
md5=hashlib.md5()
md5.update(pow_msg.encode("utf-8"))
pow_sign=md5.hexdigest()
# print(pow_sign)
u=rsa_encrypt(i)
e={
    "setLeft": setLeft,
    "track": track,
    "passtime": passtime,
    "userresponse": userresponse,
    "device_id": "525aacb5d76ccd914d74bbebedce64ba",
    "lot_number": lot_number,
    "pow_msg": pow_msg,
    "pow_sign": pow_sign,
    "geetest": "captcha",
    "lang": "zh",
    "ep": "123",
    "u7gf": "318729873",
    "em": {
        "ph": 0,
        "cp": 0,
        "ek": "11",
        "wd": 1,
        "nt": 0,
        "si": 0,
        "sc": 0
    }
}
ee=execjs.compile(open('finalcode.js', encoding='utf-8').read()).call('V', e, i)

w= execjs.compile(open('finalcode.js', encoding='utf-8').read()).call('get_r', ee) + u
# print(w)
url="https://gcaptcha4.geetest.com/verify"
data={
    "callback": callback,
    "captcha_id": "24f56dc13c40dc4a02fd0318567caef5",
    "client_type": "web",
    "lot_number": lot_number,
    "risk_type": "slide",
    "payload": payload,
    "process_token": process_token,
    "payload_protocol": "1",
    "pt": "1",
    "w":w
}
res=requests.get(url=url,headers=headers,params=data)
print(res.text)

