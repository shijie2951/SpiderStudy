import logging
import requests
from lxml import etree
import json

headers = {
            # 'mtgsig': mtgsig,
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
            "Cookie": '__mta=251567417.1687180825717.1687343410247.1687343616061.14; uuid=4050ec12e5794a59bab1.1687180556.1.0.0; _lxsdk_cuid=188d3cc3811c8-09e93daab2f5bc-377f525c-1fa400-188d3cc3811c8; WEBDFPID=5x1957xx93z15w8z078430w77w1y84x8811w6xx6w3697958x076u543-2002540557537-1687180556926IIIUSEWa12a6b8169ee7736639f3ec62dbf984b3772; iuuid=1C3A331ADDA26E43E8D4FDE88241DCE8A679CA000A0EABA4B1E321D93EBD8748; _lxsdk=1C3A331ADDA26E43E8D4FDE88241DCE8A679CA000A0EABA4B1E321D93EBD8748; token=AgEVJhSYlCibapfcJMs1HFkI01jYX7WolT5OhtQ7ygdctnJll5VHId1XbWyr29xvYIhRrdL0m6u0qwAAAAARGQAAnHUx_vR0UaNU7aGdSm7c3vUVT6fY7jr8HH8SytpGgmq9AJyyEHrS4Y2efwxAvd5u; userId=1492321437; isid=AgEVJhSYlCibapfcJMs1HFkI01jYX7WolT5OhtQ7ygdctnJll5VHId1XbWyr29xvYIhRrdL0m6u0qwAAAAARGQAAnHUx_vR0UaNU7aGdSm7c3vUVT6fY7jr8HH8SytpGgmq9AJyyEHrS4Y2efwxAvd5u; logintype=normal; webp=1; __utmz=74597006.1687180815.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=3b59309c-02d5-eeca-8224-64364d0d06b5.1687180826; u=1492321437; n=IXI419042783; _yoda_verify_resp=X7BR5Rlrl8oHT0je5K0ty5o%2FidACmLyYnwUVrlt3aIBi3BTd6PjpFB9%2F7DqeSuCtkVJKpebbDXda0HpyUTp5azIEk97wikdSbmppp6LT39rR%2B%2FuNy2lSoPQPoqwbeKAg2NywkN7g7C9utSZ7lAv5u7HLQlsJNrO59aPKTACeTplWy%2Brj3vlJBJ5tnSJpGdkjVmcVYgYvKFS60NqxwesI24J5jIp9Mb74lqBg4Qna%2B4XhlYxHoGSsjFrAfs%2BJl0d5UbZWGiI10q7MKniQuWgJzm9kc9IucyEL86yGFymLhC2bkFSxtALTP7n517T1zfwfT85%2FReMyfX%2FMqaxdTNCqhYOoFyJ43UysqksiDq8ekH3YZ2LOwTA3qenbHbLVx%2Bwm; _yoda_verify_rid=17323b09cb02f017; JSESSIONID=node0816ci0u4m6b69hx101uerfid333189.node0; IJSESSIONID=node0816ci0u4m6b69hx101uerfid333189; idau=1; __utma=74597006.457080937.1687180815.1687311042.1687343001.4; __utmc=74597006; _lx_utm=utm_term%3DAiphoneBgroupC12.10.202DqqEpoiG0000000000000BFC9844307564EAC97920EC1BB0A908BA16500545409685363320230621182410474%26utm_source%3Dappshare%26utm_medium%3DiOSweb; token2=AgFpJNJ1bTsHGMj4tGTAPdEk5d_6dH_MJHWe5yT55hMqXCj5_bVgmaYxpaXO-hxlqscciqP8eHH8yQAAAAAvGQAAkhSZ7ILjLKR-zYs5kaZqe9XrFrhU10IiiTQjzXxIE0bRaKRgp7e01drNLlENhTDb; oops=AgFpJNJ1bTsHGMj4tGTAPdEk5d_6dH_MJHWe5yT55hMqXCj5_bVgmaYxpaXO-hxlqscciqP8eHH8yQAAAAAvGQAAkhSZ7ILjLKR-zYs5kaZqe9XrFrhU10IiiTQjzXxIE0bRaKRgp7e01drNLlENhTDb; lt=AgFpJNJ1bTsHGMj4tGTAPdEk5d_6dH_MJHWe5yT55hMqXCj5_bVgmaYxpaXO-hxlqscciqP8eHH8yQAAAAAvGQAAkhSZ7ILjLKR-zYs5kaZqe9XrFrhU10IiiTQjzXxIE0bRaKRgp7e01drNLlENhTDb; qruuid=8fd5c414-13d7-440b-a903-4cc37ef28c83; mt_c_token=AgFpJNJ1bTsHGMj4tGTAPdEk5d_6dH_MJHWe5yT55hMqXCj5_bVgmaYxpaXO-hxlqscciqP8eHH8yQAAAAAvGQAAkhSZ7ILjLKR-zYs5kaZqe9XrFrhU10IiiTQjzXxIE0bRaKRgp7e01drNLlENhTDb; ci=1; cityname=%E5%8C%97%E4%BA%AC; webloc_geo=29.42707%2C106.591909%2Cwgs84%2C-1; i_extend=C_b0E246891384027103104654501335203133649892_e-5756860601811758334_v6685860787547923844_asurf+park+%e5%86%b2%e6%b5%aa%e5%85%ac%e5%9b%ad%c2%b7%e6%b7%b1%e6%b0%b4%e5%86%b2%e6%b5%aa%e4%bd%93%e9%aa%8c%e5%ba%97H__a100005__b4; __utmb=74597006.9.9.1687343373490; latlng=29.42707%2C106.591909; ci3=45; _lxsdk_s=188dd7454db-b4-5ac-7ca%7C%7C42'
        }
#如果请求失败有个是cookie被检测了 ，换个cookie就行
url="https://i.meituan.com/poi/feedbacks/{}"   #你要爬的店铺地址
res2 = requests.get(url=url,headers=headers)
uid = ""  #地址里面有个数字id  填在这里
url = "https://www.meituan.com/ptapi/poi/getcomment?id={}&offset=0&pageSize=5&mode=0&sortType=1&enableGuard=true".format(uid)
comment = requests.get(url,headers=headers)
dic=json.loads(str(comment))
try:
    comment_count = dic["total"]
except:
    comment_count=None
tree2 = etree.HTML(res2)
try:
    name = tree2.xpath('//*[@class="dealcard-brand"]/text()')[0]
except:
    name=None
try:
    address = tree2.xpath('//*[@class="poi-address"]/text()')[0]
except:
    address=None
try:
    phoneNumber = tree2.xpath('//*[@class="react poi-info-phone"]/@data-tele')[0]
except:
    phoneNumber = None
try:
    stars = tree2.xpath('//*[@class="score-rl"]//em/text()')[0]
except:
    stars=None
print(name, address, phoneNumber,comment_count, stars)  #这里就是输出的结果  ，保存到excel里面你可以自己找一下代码写入即可