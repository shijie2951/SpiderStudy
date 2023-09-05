import requests
headers={
    "accept": "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "zh-CN,zh;q=0.9",
    "cookie": "Hm_lvt_91a4e950402ecbaeb38bd149234eb7cc=1687313198; acw_tc=76b20fee16873137795706794e5641dee87d1d644a4084dafa92162575e683; MSESSID=b4pbll52fhneklpdbq6s5k63mo; token=64925d96594838524a03f53b%7Ca4ff55fa8e42af9e85b89393ef0810a2%7C1687313814%7C9026069a945a58ed; WEBDFPID=1687313905116EIOWQOQa12a6b8169ee7736639f3ec62dbf984b6741-1687313905116-1687313905116EIOWQOQa12a6b8169ee7736639f3ec62dbf984b6741; Hm_lpvt_91a4e950402ecbaeb38bd149234eb7cc=1687313935",
    "referer": "https://www.missevan.com/sound/player?id=7899855",
    "sec-ch-ua": "\"Chromium\";v=\"93\", \" Not;A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Linux\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
    "x-requested-with": "XMLHttpRequest"
}

url="https://www.missevan.com/sound/down?soundid=7915965"

r=requests.get(url=url,headers=headers)
print(r.text)
