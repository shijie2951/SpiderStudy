import requests
from lxml import etree
import re
import random
user_agents=['Mozilla/5.0 (Windows; U; Windows NT 5.2; rv:1.7.3) Gecko/20041001 Firefox/0.10.1', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:5.0) Gecko/20110619 Firefox/5.0', 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.8.1.4) Gecko/20070529 SUSE/2.0.0.4-6.1 Firefox/2.0.0.4', 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2b5) Gecko/20091204 Firefox/3.6b5', 'Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.0.1) Gecko/2008072820 Kubuntu/8.04 (hardy) Firefox/3.0.1', 'Mozilla/5.0 (X11; U; Linux armv7l; en-GB; rv:1.9.2.3pre) Gecko/20100723 Firefox/3.6.11', 'Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.2.9) Gecko/20100827 Red Hat/3.6.9-2.el6 Firefox/3.6.9', 'Mozilla/5.0 (X11; U; SunOS sun4u; de-DE; rv:1.8.1.6) Gecko/20070805 Firefox/2.0.0.6', 'Mozilla/5.0 (Windows NT 5.1; rv:2.0b9pre) Gecko/20110105 Firefox/4.0b9pre', 'Mozilla/5.0 (Windows; U; Windows NT 6.1; de-DE; rv:1.9.1.3) Gecko/20090824 Firefox/3.5.3']
random_user_agent = random.choice(user_agents)
headers={

        "Cookie": "IJSESSIONID=node0161rvbb9qtjc212enfb6zlcn58319385; iuuid=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; _lxsdk_cuid=188c2f9f96fc8-06c9568ed5cba6-377f525c-1fa400-188c2f9f96fc8; _lxsdk=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; WEBDFPID=3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045-2002260286183-1686900286183ECKEMCIa12a6b8169ee7736639f3ec62dbf984b9491; ci3=45; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; uuid=06a4a39f4ca543b4ac10.1686900615.1.0.0; userId=1492321437; u=1492321437; isid=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; webp=1; __utmc=74597006; __utmz=74597006.1686900746.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=fde59d42-c1f8-0cb2-546d-8c6f0cd278e7.1686901008; meishi_ci=59; cityid=59; p_token=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; client-id=404d391f-17b3-4dec-8893-762ba97493d7; mtcdn=K; userTicket=uGEnQMnIBUpujVkIVVcmvcsDJYWEyWBIIvFUBnSU; n=IXI419042783; lt=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; mt_c_token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token2=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; unc=IXI419042783; ci=1; rvct=1%2C10; oops=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; logintype=normal; cityname=%E5%8C%97%E4%BA%AC; idau=1; __utma=74597006.168147220.1686900746.1686900746.1686910645.2; latlng=29.427037,106.591974,1686910659226; i_extend=C_b0E157414336152989513647135656994396466079_e2678956151633231129_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_v6678602508505574395GimthomepagesearchH__a100005__b2; __utmb=74597006.9.9.1686910708126; firstTime=1686910728706; _lxsdk_s=188c317a1f5-5fb-be8-6cb%7C%7C284",
        "mtgsig": "{\"a1\":\"1.1\",\"a2\":1686910758689,\"a3\":\"3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045\",\"a5\":\"krW7Vv0xp1+2uLOtcQW+2DFDmCSLYTGY\",\"a6\":\"h1.33S2ovJ2kJ2QXG7KUllABgW75DWJbkv2OXXDLpFAsxEes176LROozG5Zm3zdugJJ+X3IPYD42/PiiVo6f3aytlBYEAeuWKobtnKaBIQZ5Dqx56jXTKtb+Wx3jX/JZvf1u7dv+XxtVE6D8bVpW6obuI8PGLN4kV8vYnox1hRpC7xxikCUT5VF6MArKYbtI/SmfCEAt9o1C1Av/GDEvlGDYnUhgVCVklDYE1nNBAjDO68hSR7knE+Vlufxs7yvr1brCv6dcLqNlVQqZzWFth/8kWbHMDTgb4EH7lBAyW6w3m6HCDQTRPOjBgf3FRavtZ5PVc+W+ko7H9JmggDSi2inFXf7T1cxHCP7xr1tbFbKoTJA=\",\"x0\":4,\"d1\":\"26b82dcf1d7a15cd6403d3753bc23800\"}",

        "sec-ch-ua-platform": "\"Linux\"",

        "User-Agent":"Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0"
    }
headers2={

        "Cookie": "IJSESSIONID=node0161rvbb9qtjc212enfb6zlcn58319385; iuuid=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; _lxsdk_cuid=188c2f9f96fc8-06c9568ed5cba6-377f525c-1fa400-188c2f9f96fc8; _lxsdk=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; WEBDFPID=3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045-2002260286183-1686900286183ECKEMCIa12a6b8169ee7736639f3ec62dbf984b9491; ci3=45; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; uuid=06a4a39f4ca543b4ac10.1686900615.1.0.0; userId=1492321437; u=1492321437; isid=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; webp=1; __utmc=74597006; __utmz=74597006.1686900746.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=fde59d42-c1f8-0cb2-546d-8c6f0cd278e7.1686901008; meishi_ci=59; cityid=59; p_token=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; client-id=404d391f-17b3-4dec-8893-762ba97493d7; mtcdn=K; userTicket=uGEnQMnIBUpujVkIVVcmvcsDJYWEyWBIIvFUBnSU; n=IXI419042783; lt=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; mt_c_token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token2=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; unc=IXI419042783; ci=1; rvct=1%2C10; oops=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; logintype=normal; cityname=%E5%8C%97%E4%BA%AC; idau=1; __utma=74597006.168147220.1686900746.1686900746.1686910645.2; latlng=29.427037,106.591974,1686910659226; i_extend=C_b0E157414336152989513647135656994396466079_e2678956151633231129_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_v6678602508505574395GimthomepagesearchH__a100005__b2; __utmb=74597006.9.9.1686910708126; firstTime=1686910728706; _lxsdk_s=188c317a1f5-5fb-be8-6cb%7C%7C284",
        "mtgsig": "{\"a1\":\"1.1\",\"a2\":1686910758689,\"a3\":\"3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045\",\"a5\":\"krW7Vv0xp1+2uLOtcQW+2DFDmCSLYTGY\",\"a6\":\"h1.33S2ovJ2kJ2QXG7KUllABgW75DWJbkv2OXXDLpFAsxEes176LROozG5Zm3zdugJJ+X3IPYD42/PiiVo6f3aytlBYEAeuWKobtnKaBIQZ5Dqx56jXTKtb+Wx3jX/JZvf1u7dv+XxtVE6D8bVpW6obuI8PGLN4kV8vYnox1hRpC7xxikCUT5VF6MArKYbtI/SmfCEAt9o1C1Av/GDEvlGDYnUhgVCVklDYE1nNBAjDO68hSR7knE+Vlufxs7yvr1brCv6dcLqNlVQqZzWFth/8kWbHMDTgb4EH7lBAyW6w3m6HCDQTRPOjBgf3FRavtZ5PVc+W+ko7H9JmggDSi2inFXf7T1cxHCP7xr1tbFbKoTJA=\",\"x0\":4,\"d1\":\"26b82dcf1d7a15cd6403d3753bc23800\"}",

        "sec-ch-ua-platform": "\"Linux\"",

        "User-Agent": random.choice(user_agents)[0]
    }
res=requests.get(url="https://i.meituan.com/s/jinan-%E5%8F%A3%E8%85%94%E6%9C%BA%E6%9E%84?p=1",headers=headers)
# print(res.text)
tree = etree.HTML(res.text)
for i in tree.xpath('//*[@class="list list-in poiList"]/dd/dl'):
    url = "https:" + i.xpath("dd[1]/a/@href")[0]
    print(url)
    res2 = requests.get(url=url, headers=headers)
    uid = re.search("\d+", url).group()
    # url = "https://www.meituan.com/ptapi/poi/getcomment?id={}&offset=0&pageSize=5&mode=0&sortType=1&enableGuard=true".format(uid)
    # comment = requests.get(url,headers=headers2)
    # print(comment.text)
    # comment_count = comment.json()["total"]
    tree2 = etree.HTML(res2.text)
    print(res2.text)
    name = tree2.xpath('//*[@class="dealcard-brand"]/text()')[0]
    address = tree2.xpath('//*[@class="poi-address"]/text()')[0]
    phoneNumber = tree2.xpath('//*[@class="react poi-info-phone"]/@data-tele')[0]

    stars = tree2.xpath('//*[@class="score-rl"]//em/text()')[0]
    print(name, address, phoneNumber, stars)