import scrapy
import re
from ..items import MtspiderItem
class MtSpider(scrapy.Spider):
    name = "mt"
    allowed_domains = ["i.meituan.com"]
    start_urls = ["https://i.meituan.com/s/beijing-%E5%8F%A3%E8%85%94%E6%9C%BA%E6%9E%84"]

    def parse(self, response):
        for i in response.xpath('//*[@class="list list-in poiList"]/dd/dl'):
            item=MtspiderItem()
            url = "https:" + i.xpath("dd[1]/a/@href")[0]
            yield scrapy.Request(url=url,callback=self.detail_parse,meta=item)

            uid = re.search("\d+", url).group()
            url = "https://www.meituan.com/ptapi/poi/getcomment?id={}&offset=0&pageSize=5&mode=0&sortType=1&enableGuard=true".format(uid)
            yield scrapy.Request(url=url, callback=self.comment_pres,meta=item)


    def comment_pres(self,response):
        item=response.meta
        item['comment_count'] = response.json()["total"]


    def detail_parse(self,response):
        item = response.meta
        item['name'] = response.xpath('//*[@class="dealcard-brand"]/text()')[0]
        item['address'] = response.xpath('//*[@class="poi-address"]/text()')[0]
        item['phoneNumber'] = response.xpath('//*[@class="react poi-info-phone"]/@data-tele')[0]
        item['stars'] = response.xpath('//*[@class="score-rl"]//em/text()')
        print(item['name'], item['address'])
