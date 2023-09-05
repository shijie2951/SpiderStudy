import json
import datetime
import requests
from functools import partial
import subprocess
subprocess.Popen=partial(subprocess.Popen,encoding="utf-8")
import execjs

from urllib.parse import quote
session=requests.session()
#设置headers  携带关键参数即可
session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
            "X-APP-CLIENTID": "CfcG3KCCGeG44e7faC374Cb5bK3GC3d4",
            "X-SM4-INFO": "0",
            "X-TEMP-INFO": "7aa49a041b7040128e5e1dae0c9eb112"
        })
#生成new_key16,固定死，之后会校验
new_key = execjs.compile(open("res.js", encoding="utf-8").read()).call("i",16, 61)
#获取publicKey
def get_publicKey(new_key):
    d1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", "", new_key)
    dic= execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature",d1,new_key,"0")
    url1 = "https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/oauth2/getPublicKey"
    data = {
        "zipCode": "0",
        "datagram": "{}",
        "encryptCode": "0",
        "timestamp": dic['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic['signature'],
    }
    r1 = session.post(url=url1, json=data)
    print(r1.text)
    return  {"datagram":json.loads(r1.json()["datagram"]),"timestamp":dic['timestamp'],"signature":dic['signature']}
#获取secret
def get_secret(new_key,dic):
    secret=execjs.compile(open("res.js", encoding="utf-8").read()).call("l",new_key,dic['datagram']['publicKey'],1)
    url2 = 'https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/white/sendSm4'
    data2={
            "zipCode": "0",
            "datagram": json.dumps({"uuid":dic['datagram']['uuid'],"secret":secret}),
            "encryptCode": "0",
            "timestamp": dic['timestamp'],
            "access_token": "",
            "signtype": "HMacSHA256",
            "signature": dic['signature'],
        }
    session.headers.update({"X-TEMP-INFO":dic['datagram']['uuid']})
    r2=session.post(url=url2,json=data2)
    # print(dic['datagram']['uuid'])
    print(r2.text)


def send_sm4(info,new_key,dic):
    info=json.dumps(info)
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram",info,new_key)
    dic1= execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature",c,new_key,"2")
    url3 = 'https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/user/first/accountLogin'
    data3={
            "zipCode": "0",
            "datagram": c,
            "encryptCode": "2",
            "timestamp": dic1['timestamp'],
            "access_token": "",
            "signtype": "HMacSHA256",
            "signature": dic1['signature']
        }
    # session.headers.update({"X-TEMP-INFO": dic['datagram']['uuid']})
    # print(dic['datagram']['uuid'])
    r3=session.post(url=url3,json=data3)
    print(r3.json())
    # 获取返回的datagram
    e = r3.json()['datagram']
    # 解密datagram
    data_uuid = json.loads(decrypt(e, new_key))['uuid']
    g = {
        "uuid": data_uuid
    }
    return g,data_uuid

#发送验证码
def send_code(new_key,uuid):
    url='https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/user/second/sendSmsCodeByUuid'
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", uuid, new_key)
    dic1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature", c, new_key,"2")
    data3 = {
        "zipCode": "0",
        "datagram": c,
        "encryptCode": "2",
        "timestamp": dic1['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic1['signature']
    }
    r3 = session.post(url=url, json=data3)
    print(r3.json())
    e = r3.json()['datagram']
    smscode = input("请输入验证码:")
    # 解密datagram
    smscode_id = json.loads(decrypt(e, new_key))['smscode_id']
    g = {"client_id": "CfcG3KCCGeG44e7faC374Cb5bK3GC3d4",  # 不变
         "redirect_uri": "https://etax.chongqing.chinatax.gov.cn/sword?ctrl=KxLoginCtrl_initNsrxx",  # 不变
         "smscode_id": smscode_id,
         # 解密sendcode_res返回得到
         "smscode": smscode,  # 验证码
         "uuid": data_uuid
         }
    return g

#解密datagram
def decrypt(e,t):
    return execjs.compile(open("res.js", encoding="utf-8").read()).call("c",e,t)

#获取验证码登录
def smsLogin(new_key,g):
    url='https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/user/second/smsCodeLogin'
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", g, new_key)
    dic1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature", c, new_key, "2")
    data3 = {
        "zipCode": "0",
        "datagram": c,
        "encryptCode": "2",
        "timestamp": dic1['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic1['signature']
    }
    r = session.post(url=url, json=data3)
    print(r.json())
    e = r.json()['datagram']
    # 解密，得到access_token 和code
    access_token = json.loads(decrypt(e, new_key))["access_token"]
    code = json.loads(decrypt(e, new_key))['code']
    g = {
        "access_token": access_token
    }
    session.headers.update({"Authorization": access_token})
    return g,access_token,code

#获取用户信息
def getuserinfo(new_key,g):
    url='https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/oauth2/userinfo'
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", g, new_key)
    dic1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature", c, new_key, "2")
    data3 = {
        "zipCode": "0",
        "datagram": c,
        "encryptCode": "2",
        "timestamp": dic1['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic1['signature']
    }
    r = session.post(url=url, json=data3)
    print(r.json())
    # 获取返回的datagram
    e = r.json()['datagram']
    # 解密
    userinfo_decrypt = decrypt(e, new_key)
    return userinfo_decrypt

def agreementListQuery(new_key,g):
    url='https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/auth/user/agreementListQuery'
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", g, new_key)
    dic1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature", c, new_key, "2")
    data3 = {
        "zipCode": "0",
        "datagram": c,
        "encryptCode": "2",
        "timestamp": dic1['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic1['signature']
    }
    r = session.post(url=url, json=data3)
    print(r.json())
    return r.json()

def getRedirect(new_key,g):
    url='https://tpass.chongqing.chinatax.gov.cn:8443/sys-api/v1.0/acl/app/getRedirect'
    c = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_datagram", g, new_key)
    dic1 = execjs.compile(open("res.js", encoding="utf-8").read()).call("get_signature", c, new_key, "2")
    data3 = {
        "zipCode": "0",
        "datagram": c,
        "encryptCode": "2",
        "timestamp": dic1['timestamp'],
        "access_token": "",
        "signtype": "HMacSHA256",
        "signature": dic1['signature']
    }
    r = session.post(url=url, json=data3)
    print(r.json())
    return r.json()

if __name__=='__main__':
    g = {
        "client_id": "CfcG3KCCGeG44e7faC374Cb5bK3GC3d4",
        "redirect_uri": "https://etax.chongqing.chinatax.gov.cn/sword?ctrl=KxLoginCtrl_initNsrxx",
        "account": "18324183389",
        "password": "11Zsj2951"
    }
    dic=get_publicKey(new_key)
    get_secret(new_key,dic)
    g,data_uuid=send_sm4(g,new_key,dic)

    g=send_code(new_key,json.dumps(g))
    # print(sendcode_res)

    #获取返回的datagram

    g,access_token,code=smsLogin(new_key,json.dumps(g))

    #获取返回的datagram



    userinfo=getuserinfo(new_key,json.dumps(g))

    print(userinfo)

    ress1=session.get("https://etax.chongqing.chinatax.gov.cn/sword", params={
    "ctrl": "KxLoginCtrl_initNsrxx",
    "code": code,
    "state": "test"
})

    ress1.encoding = "utf-8"
    ress2 =session.get(
        "https://etax.chongqing.chinatax.gov.cn/sword?ctrl=WBLoginGdgjCtrl_openLayout3Win?r=0.9308488255314207")
    ress2.encoding = "utf-8"
    print(ress2.text)

    print("cookie信息:", session.cookies.get_dict())










#agreement和getredirect
    # uid=json.loads(userinfo_decrypt)['user_id']
    # print(session.cookies.get_dict())
    # print(decrypt(e, new_key))
    # deed97e3cc8446d9aca5fe02cb57013
    # g={
    #     "uid": "10008deed97e3cc8446d9aca5fe02cb57013",
    # }
    # agreementListQuery(new_key,json.dumps(g))
    #
    #
    # g={
    #     "applicationId": "CfcG3KCCGeG44e7faC374Cb5bK3GC3d4"
    # }
    # redirect_res=getRedirect(new_key,json.dumps(g))
    # print(redirect_res)
    # print(session.cookies.get_dict())
    # session.headers.update(session.cookies.get_dict())
    # e=redirect_res['datagram']
    # redirectUrl=json.loads(decrypt(e, new_key))['redirectUrl']
    # print(decrypt(e, new_key))
    # res=session.get(url=redirectUrl)
    #
    # res.encoding='utf-8'
    # print(res.text)
    # url="https://etax.chongqing.chinatax.gov.cn/sword"
    #    # https://etax.chongqing.chinatax.gov.cn/sword   ?ctrl=WBLoginGdgjCtrl_openLayout3Win?r=0.3329378326098451
    # paramas={
    #     "ctrl": "KxLoginCtrl_initNsrxx",
    #     "code": code,
    #     "state": "test"
    # }
    # print(redirectUrl)






