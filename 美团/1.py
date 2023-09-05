import logging
import requests
from lxml import etree
import re
from xpinyin import Pinyin
from concurrent.futures import ThreadPoolExecutor
import pymysql.cursors
import random
from dbutils.pooled_db import PooledDB
import json
import time
import redis
from log import logger
# 、上海
# 北京、广州、深圳、成都 已爬2页
# 杭州17 武汉13 西安17   、杭州、西安、武汉、
# 南京5 郑州5  郑州、南京 苏州4
class MtSpider():

    def get_pinyins(self) -> list:
        p = Pinyin()
        citys = "重庆、苏州、天津、长沙、东莞、宁波、佛山、合肥、青岛、昆明、沈阳、济南、无锡、" \
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
        # tunnel = "e357.kdltps.com:15818"
        #
        # # 用户名密码方式
        # username = "t18700463482825"
        # password = "ipogu6le"
        # self.proxies = {
        #     "http": "http://%(user)s:%(pwd)s@%(proxy)s/" % {"user": username, "pwd": password, "proxy": tunnel},
        #     "https": "http://%(user)s:%(pwd)s@%(proxy)s/" % {"user": username, "pwd": password, "proxy": tunnel}
        # }
        proxyAddr = "tunnel3.qg.net:17989"
        authKey = "C258E243"
        password = "5C63CFBFA823"
        proxyUrl = "http://%(user)s:%(password)s@%(server)s" % {
            "user": authKey,
            "password": password,
            "server": proxyAddr,
        }
        self.proxies = {
            "http": proxyUrl,
            "https": proxyUrl,
        }
        # self.proxies = {'http': proxy_host + ':' + proxy_port}
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
        # self.cookie_lst=


    def __exit__(self, exc_type, exc_val, exc_tb):
        self.cursor.close()
        self.connect.close()

    def judgy_status(self,url,headers,text):
        statu1 = re.search("error page", text, re.S)
        statu2 = re.search("Bad Message", text, re.S)

        while (statu1 != None or statu2!=None):
            self.redis_conn.srem("cookies",headers['Cookie'])
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
        # print(res.text)
        while (status != None):
            self.redis_conn.srem("cookies",headers['Cookie'])
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
                # url = "https://www.meituan.com/ptapi/poi/getcomment?id={}&offset=0&pageSize=5&mode=0&sortType=1&enableGuard=true".format(uid)
                url="https://i.meituan.com/poi/feedbacks/{}".format(uid)
                comment = requests.get(url,headers=headers,proxies=self.proxies)
                comment = self.judgy_status(url,headers, comment.text)
                comment_tree=etree.HTML(comment)
                try:
                    comment_count=comment_tree.xpath("//*[@class='pull-right']/text()")[0]
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
        while True:
            cookies = self.redis_conn.srandmember("cookies")

            if cookies:
                # mtgsig = cookies.decode("utf-8").split("|||")[1]
                break

            logger.debug('等待cookies')
            time.sleep(3)
        headers = {
            # 'mtgsig': mtgsig,
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
            "Cookie": cookies
        }
        return headers
    def runner(self):
        with ThreadPoolExecutor(max_workers=2) as t:
            for city in self.get_pinyins():
                t.submit(self.to_do, city)
        # # #     t.submit(self.to_do, self.get_pinyins()[0])
        # self.to_do(self.get_pinyins()[0])


if __name__ == '__main__':
    with MtSpider() as obj:
        obj.runner()