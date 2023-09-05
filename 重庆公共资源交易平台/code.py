import scrapy
import re
import requests
from lxml import etree
import json
from pymongo import MongoClient
import threading
from concurrent.futures import ThreadPoolExecutor
host = '10.8.15.230'
client = MongoClient(host, 27017)
db = client.admin
db.authenticate("root", "1qaz@WSX")
my_db = client.cqggzy
collection = my_db.cqggzyinfo_student

class CqsSpider(scrapy.Spider):
    def __init__(self):

        self.obj = re.compile('<div class="epoint-article-content"(?:.|\n)*</div>')
        self.session = requests.session()
        self.session.headers.update({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Cookie": "cookie_www=36802747; __jsluid_s=01ecca173bb366b1990707375a04090d; Hm_lpvt_3b83938a8721dadef0b185225769572a=1684735747; Hm_lvt_3b83938a8721dadef0b185225769572a=1684229417,1684286476,1684301293,1684726100",
            "Host": "www.cqggzy.com",
            "Pragma": "no-cache",
            "Referer": "https://www.cqggzy.com/jumpnew.html?infoid=f9cfbe9d-9b35-425b-939b-28938b14df76&categorynum=014008013",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
            "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\""
        })
        self.url = "https://www.cqggzy.com/EpointWebBuilderService/getInfoListAndCategoryList.action?cmd=getInfoListWithSecondCateNew"


    def parse_data(self, data):
        for item in data:
            title = item.get("title")
            infodate = item.get("infodate").replace('-', '')
            infoid = item.get("infoid")
            categorynum = item.get("categorynum")
            infoc=item.get("infoC")
            try:
                if len(categorynum) == 9:
                    sub_url = f"https://www.cqggzy.com/xxhz/{categorynum[:-3]}/{categorynum}/{infodate}/{infoid}.html"
                else:
                    sub_url = f"https://www.cqggzy.com/xxhz/{categorynum[:-6]}/{categorynum[:-3]}/{categorynum}/{infodate}/{infoid}.html"
                # content
                resp = self.session.get(sub_url)  # location
                content = self.obj.findall(resp.text)[0]
                # print(content)
            except:
                if len(categorynum) == 9:
                    sub_url = f"https://www.cqggzy.com/xxhz/{categorynum[:-3]}/{categorynum}/{int(infodate)+1}/{infoid}.html"
                else:
                    sub_url = f"https://www.cqggzy.com/xxhz/{categorynum[:-6]}/{categorynum[:-3]}/{categorynum}/{int(infodate)+1}/{infoid}.html"
                resp = self.session.get(sub_url)  # location

                content = self.obj.findall(resp.text)[0]
                # print(content)
            tree = etree.HTML(resp.text)
            last_type=tree.xpath("//*[@id='viewGuid']/text()")[0]
            types = '|'.join(tree.xpath("//*[@class='location']/a/text()")[2:])+"|"+last_type
            # print(types)
            # xm_id = ''.join(tree.xpath("//span[@id='viewGuid']/@value")).rsplit('_', 1)[-1]
            url = "https://www.cqggzy.com/EpointWebBuilderService/getInfoListAndCategoryList.action"
            data = {
                "cmd": "getInfoRelationListNew",
                "infoid": infoid,
                "siteguid": "d7878853-1c74-4913-ab15-1d72b70ff5e7",
                "categorynum": categorynum
            }
            rr = self.session.get(url, params=data)
            xm_id=json.loads(rr.json()['custom'])[0]['infoD']
            data = {}
            data['types'] = types
            data['title'] = title
            data['xm_id'] = xm_id
            data['infodate'] = item.get("infodate")
            data['content'] = content
            data['infoc'] = infoc
            data['url'] = sub_url
            data['name'] = "赵世杰"
            # print("====>",data)
            # print(json.dumps(data, indent=2, ensure_ascii=False))
            # break
            result = collection.insert_one(data)
            # print(data)
            print(result.inserted_id)


    def to_do(self,pageIndex):
        print("page=>", pageIndex)
        data = {"pageIndex": pageIndex,
                "pageSize": 20,
                "siteguid": "d7878853-1c74-4913-ab15-1d72b70ff5e7",
                "categorynum": "014",
                "title": "",
                "infoC": "",
                "startdate": "2021-01-01 00:00:00",
                "enddate": " 2023-05-17 23:59:59"}
        resp = self.session.post(self.url, data=data)
        js_data = json.loads(resp.json()["custom"])
        # print(js_data)
        self.parse_data(js_data)
    def runner(self):
        # self.to_do(1500)
        # 1633
        with ThreadPoolExecutor(max_workers=5) as t:
            for pageIndex in range(1500,3001):
                t.submit(self.to_do,pageIndex)

if __name__ == '__main__':
    CqsSpider().runner()

    '''
types:导航,title:项目时间，xm_id：项目编号,infodata:项目时间，content:文件内容，infoc:项目等级，url:详情页面url）

    '''
