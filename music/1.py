import requests
url="https://m.ctrip.com/restapi/soa2/20591/getGsOnlineResult?_fxpcqlniredt=09031083310364532832&x-traceID=09031083310364532832-1687321955641-4222626"
headers={
    # "accept": "*/*",
    # "accept-encoding": "gzip, deflate, br",
    # "accept-language": "zh-CN,zh;q=0.9",
    # "content-length": "228",
    "content-type": "application/json",
    "cookie": "GUID=09031083310364532832; nfes_isSupportWebP=1; _RF1=183.69.141.158; _RSG=B9Ksc9.9NY7o1PvqakCphB; _RDG=2817d79237921c286e2a8fd25e2d025e55; _RGUID=789727e2-66d9-424b-baf3-32e934e59072; _bfaStatusPVSend=1; _bfi=p1%3D0%26p2%3D0%26v1%3D1%26v2%3D0; _bfaStatus=success; _bfa=1.1687314244948.41dnhn.1.1687321946899.1687321955538.2.2.0; _ubtstatus=%7B%22vid%22%3A%221687314244948.41dnhn%22%2C%22sid%22%3A2%2C%22pvid%22%3A2%2C%22pid%22%3A0%7D",
    "cookieorigin": "https://you.ctrip.com",
    "origin": "https://you.ctrip.com",
    "referer": "https://you.ctrip.com/",
    "sec-ch-ua": "\"Chromium\";v=\"93\", \" Not;A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS"
}
data = {
  "keyword": "重庆",
  "pageIndex": "0",
  "pageSize": "12",
  "tab": "all",
  "sourceFrom": "",
  "profile": "false",
  "head": {
    "cid": "09031083310364532832",
    "ctok": "",
    "cver": "1.0",
    "lang": "01",
    "sid": "8888",
    "syscode": "09",
    "auth": "",
    "xsid": "",
    "extension": "[]"
  }
}
session=requests.session()
m=session.post(url=url,data=data)
n=m.json()['homeItems']
for i in range(len(n)):
    type=n[i]['tab']['word']
    for j in range(len(n[i]['items'])):
        word=n[i]['items'][j]['word']
        url=n[i]['items'][j]['url']
        imageUrl=n[i]['items'][j]['imageUrl']
        print(type,word,url,imageUrl)



