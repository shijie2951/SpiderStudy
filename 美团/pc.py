
import requests
from lxml import etree
import re
from xpinyin import Pinyin
from concurrent.futures import ThreadPoolExecutor
import pymysql.cursors
import random
from dbutils.pooled_db import PooledDB
import json
import redis
class MtSpider():
    def get_pinyins(self) -> list:
        p = Pinyin()
        citys = "北京、上海、广州、深圳、成都、重庆、杭州、西安、武汉、苏州、郑州、南京、天津、长沙、东莞、宁波、佛山、合肥、青岛、昆明、沈阳、济南、无锡、" \
            "厦门、福州、温州、金华、哈尔滨、大连、贵阳、南宁、泉州、石家庄、长春、南昌、惠州、常州、嘉兴、徐州、南通、太原、保定、珠海、中山、兰州、临沂、" \
            "潍坊、烟台、绍兴、台州、海口、乌鲁木齐、洛阳、廊坊、汕头、湖州、咸阳、盐城、济宁、呼和浩特、扬州、赣州、阜阳、唐山、镇江、邯郸、银川、南阳、桂林、泰州、" \
            "遵义、江门、揭阳、芜湖、商丘、连云港、新乡、淮安、淄博、绵阳、菏泽、漳州、周口、沧州、信阳、衡阳、湛江、三亚、上饶、邢台、莆田、柳州、宿迁、九江、襄阳、驻马店、" \
            "宜昌、岳阳、肇庆、滁州、威海、德州、泰安、安阳、荆州、运城、安庆、潮州、清远、开封、宿州、株洲、蚌埠、许昌、宁德、六安、宜春、聊城、渭南"
        lst = citys.split("、")
        city_lst = []
        for i in lst:
            result1 = "".join(p.get_pinyin(i).split("-"))
            city_lst.append(result1)

        return city_lst

    def __enter__(self):
        return self



    def __init__(self):
        self.page = 1
        self.connect = pymysql.Connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        passwd='root',
        db='mt',
        charset='utf8'
    )
        proxy_host = 'http://e357.kdltps.com'
        proxy_port = '15818'
        self.proxies = {'http': proxy_host + ':' + proxy_port}
        self.pool = PooledDB(pymysql, 12,
                         host='127.0.0.1',
                         port=3306,
                         user='root',
                         passwd='root',
                         db='mt',
                         charset='utf8',
                        setsession=[
            'SET AUTOCOMMIT = 1'])  # 5为连接池里的最少连接数，setsession=['SET AUTOCOMMIT = 1']是用来设置线程池是否打开自动更新的配置，0为False，1为True
        self.conn = self.pool.connection()  # 以后每次需要数据库连接就是用connection（）函数获取连接就好了
        self.cursor = self.conn.cursor()
        # self.cursor = self.connect.cursor()
        self.redis_conn=redis.Redis(host="localhost",port=6379)
        self.cookie_lst=[
            '__mta=108310973.1686921609373.1687097476365.1687097481263.48; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100005__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C14; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.8.9.1687097481678',
            '__mta=108310973.1686921609373.1687097481263.1687097852645.49; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C16; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.10.9.1687097852727',
            '__mta=108310973.1686921609373.1687097852645.1687097879914.50; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C18; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.12.9.1687097880242',
            '__mta=108310973.1686921609373.1687097879914.1687097914727.51; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C20; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.14.9.1687097914960',
            '__mta=108310973.1686921609373.1687097914727.1687097931910.52; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C22; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.16.9.1687097932232',
            '__mta=108310973.1686921609373.1687097931910.1687097948916.53; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C24; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.18.9.1687097949255',
            '__mta=108310973.1686921609373.1687097948916.1687097965008.54; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C26; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.20.9.1687097965353',
            '__mta=108310973.1686921609373.1687097965008.1687097982374.55; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=40; cityname=%E5%A4%A9%E6%B4%A5; webp=1; i_extend=C141907308669170407419799555033795858304_b0_e5482265187337962108_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f169421488E164978995586539360846477112372313640946_e-4626379088954811689_v6679556757826429068_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b8; latlng=29.371663,106.479165,1687097461177; __utma=74597006.1271887900.1686921606.1686970987.1687097460.8; __utmz=74597006.1687097460.8.2.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=93132a80-715a-4d7d-a20e-c7e2cc8be3bb; oops=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; ci3=1; firstTime=1686972788796; __utmc=74597006; token2=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; lt=AgE1H6RgB-FQ0ITOZIJn3r1npH1Fo1iojM2E3evl3k1QcIOJ5ux3n2xofgMKca5lW0jnfgQsdOXzpQAAAAAvGQAAdk51MA06HhfNns0XCnXnm0dFYjjdUtFg3EGScnamWJxXqt6OyzW94kvmlpAMAS1B; n=IXI419042783; _lxsdk_s=188ced7c942-d3a-81e-46e%7C%7C28; token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; mt_c_token=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; userId=1492321437; u=1492321437; isid=AgHTIsf64L8elH6sBQZUCe5U_808myzeFSIx8cdlhMQhriDWFxS0gnl6AP9aDbWIRI0naBaTyMntEwAAAAARGQAAVaMGsJPfXsL4FJ5bqNxA9oPPPYAUppjT6pUgpGzFahtZr_zhjPSHSp91SD8JeXBT; logintype=normal; idau=1; __utmb=74597006.22.9.1687097982679'
            ]


    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cursor.close()
        self.connect.close()

    def judgy_status(self,url,headers,text):
        statu1 = re.search("error page", text, re.S)
        statu2 = re.search("Bad Message", text, re.S)

        while (statu1 != None or statu2!=None):
            self.cookie_lst.remove(headers.get("Cookie"))
            print("remove cookie")
            headers = self.get_headers()
            text = requests.get(url=url, headers=headers,proxies=self.proxies).text
            statu1 = re.search("error page", text, re.S)
            statu2 = re.search("Bad Message", text, re.S)
        return text
    def to_do(self, city):
        headers = self.get_headers()
        page=1
        url_ls = "https://i.meituan.com/s/{}-%E5%8F%A3%E8%85%94%E6%9C%BA%E6%9E%84?p={}".format(city,page)
        res = requests.get(url=url_ls,headers=headers,proxies=self.proxies)
        status = re.search("美团网账号登录", res.text, re.S)
        while (status != None):
            self.cookie_lst.remove(headers.get("Cookie"))
            print("remove cookie")
            headers = self.get_headers()
            res = requests.get(url=url_ls, headers=headers,proxies=self.proxies)
            status = re.search("美团网账号登录", res.text, re.S)

        # print(res.text)
        text=self.judgy_status(url_ls,headers,res.text)

        tree = etree.HTML(text)

        while (tree.xpath('//*[@class="pager"]/a[2]/@href') != []):
            # print(page)
            print(url_ls)

            for i in tree.xpath('//*[@class="list list-in poiList"]/dd/dl'):
                url = "https:" + i.xpath("dd[1]/a/@href")[0]
                res2 = requests.get(url=url,headers=headers,proxies=self.proxies )
                res2=self.judgy_status(url,headers,res2.text)
                uid = re.search("\d+", url).group()
                url = "https://www.meituan.com/ptapi/poi/getcomment?id={}&offset=0&pageSize=5&mode=0&sortType=1&enableGuard=true".format(uid)
                comment = requests.get(url,headers=headers,proxies=self.proxies)
                comment = self.judgy_status(url,headers, comment.text)
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
                try:
                    result = self.cursor.execute("""
                                    insert into info(name,address,phoneNumber,comment_count,stars) values (%s,%s,%s,%s,%s)
                                    """,
                                                 (name, address, phoneNumber,comment_count,stars))
                    self.connect.commit()
                except Exception as e:
                    print(e)
                print(name, address, phoneNumber,comment_count, stars)
            page  =page + 1
            # print(page)
            url_ls = "https://i.meituan.com/s/{}-%E5%8F%A3%E8%85%94%E6%9C%BA%E6%9E%84?p={}".format(city, page)
            # headers = self.get_headers()
            res = requests.get(url=url_ls, headers=headers,proxies=self.proxies)
            text = self.judgy_status(url_ls,headers, res.text)
            tree = etree.HTML(text)

    def get_headers(self):
        try:
            random_cookie = random.choice(self.cookie_lst)
        except:
            n = input("请选择要添加cookie的个数:")
            for i in range(int(n)):
                cookie = input("请输入cookie值")
                self.cookie_lst.append(cookie)
            random_cookie = random.choice(self.cookie_lst)

        headers = {
            'mtgsig': '{"a1":"1.1","a2":1686934030205,"a3":"z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737","a5":"U7aQ3XdHVXvnw1MucPlIoc14E+z0KKTM","a6":"h1.3Ui8Wq6mXwCAIJUEo5uK7ZCLuSkP6zjyabVJent9FjAtlTf9hmBpsS6JoZW3Hcz8KW87jWR1KNbGw2Cn0bGiuiBRkGozOqowmeV0Ib/S+4B5Xa2hpcWYsRn3tGi/psftUEhBA8EPsW6nuxe0D5teO91yLW2eEtGfgTW6lQJw4LP6zSa/C54YGQWul02RQotJu46WQlPaqVX6cwnBu5C4r0QZez5u01jD3Ath5JS/NFIkaOHOAFvGZZYcBNaguW3od8FRE26XHH4jKt26EFDXYigeDtl0sTzFPSgKtGo3wamM=","x0":4,"d1":"49798a0084e2f7f2b32f480fcd9b7df0"}',
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
            "Cookie": random_cookie
        }
        return headers
    def runner(self):
        with ThreadPoolExecutor(max_workers=4) as t:
            for city in self.get_pinyins():
                t.submit(self.to_do, city)
        # #     t.submit(self.to_do, self.get_pinyins()[0])
        # self.to_do(self.get_pinyins()[0])


if __name__ == '__main__':
    with MtSpider() as obj:
        obj.runner()