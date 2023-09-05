import requests
from lxml import etree
import scrapy
import re
import requests
from lxml import etree
import json
from pymongo import MongoClient
import threading
from concurrent.futures import ThreadPoolExecutor


class HnSpider():
    def __init__(self):
        host = '10.8.15.230'
        self.client = MongoClient(host, 27017)
        self.db = self.client.admin
        self.db.authenticate("root", "1qaz@WSX")
        self.my_db = self.client.hainan
        self.collection = self.my_db.hainan_bidding_webpage_link
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.collection.close()
    def parse_data(self,pageIndex):
        print("开始爬取第"+str(pageIndex)+"页！！！！！！！！！")
        url = 'https://zw.hainan.gov.cn/ggzy/ggzy/jgzbgs/index_{}.jhtml'.format(pageIndex)
        headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS'}
        res = requests.get(url=url, headers=headers)
        tree = etree.HTML(res.text)
        # class_level1 = tree.xpath('//*[@class="navContent"]/div[1]/text()')
        # class_level2 = tree.xpath('//*[@class="selected"]/a/span/text()')
        for i in tree.xpath('//*[@class="newtable"]/tbody/tr')[:-1]:
            data = {}
            data['classes_level1'] = "建设工程"
            data['classes_level2'] = "中标公示"
            data['title'] = i.xpath('td/a/@title')[0]
            data['publish_time'] = i.xpath('td[4]/text()')[0]
            data['district'] = i.xpath('td[2]/text()')[0]
            data['url'] = i.xpath('td/a/@href')[0]
            data['name'] = '赵世杰'
            detail_parese = requests.get(url=data['url'] , headers=headers)
            tree = etree.HTML(detail_parese.text)
            context_element = tree.xpath('//*[@class="newsCon"]')[0]
            try:
                data['context'] = etree.tostring(context_element, encoding='utf8', method='html').decode()
            except:
                data['context'] = None
            result = self.collection.insert_one(data)
            # print(data)
            # print(result.inserted_id)
        print("=====================================>"+str(pageIndex)+"页爬取完成!")

    def runner(self):
        with ThreadPoolExecutor(max_workers=10) as t:
            for pageIndex in range(1, 3195):
                t.submit(self.parse_data, pageIndex)
if __name__=='__main__':
    # with HnSpider() as obj:
    HnSpider().runner()
