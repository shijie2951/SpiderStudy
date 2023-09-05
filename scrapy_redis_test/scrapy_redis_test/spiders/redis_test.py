from scrapy_redis.spiders import RedisSpider  #导入RedisSpider
import scrapy
from scrapy.cmdline import execute
import os
import sys
#原本是继承scrapy.Spider   现在改为RedisSpider
from ..items import Db250Item
class DbSpider(RedisSpider):
    name = 'db'
    redis_key = 'db'   # 开启爬虫钥匙
    page = 0

    def parse(self, response):
        all_mes = response.xpath('//div[@class="info"]')
        for mes in all_mes:
            film_name = mes.xpath('./div/a/span[1]/text()')[0].extract()
            score = mes.xpath('./div/div/span[2]/text()')[0].extract()
            director = mes.xpath('./div/p/text()')[0].extract().strip()

            item = Db250Item()
            item['film_name'] = film_name
            item['score'] = score
            item['director'] = director
            # yield item

            detail_url = mes.xpath('./div/a/@href').extract()[0]
            yield scrapy.Request(detail_url,callback=self.get_detail,meta={'info':item})

        if response.meta.get('num'):  #这个meta很关键  可以避免相互干扰
            self.page = response.meta["num"]
        self.page += 1
        if self.page == 6:
            return
        page_url = 'https://movie.douban.com/top250?start={}&filter='.format(self.page * 25)
        yield scrapy.Request(page_url,meta={'num':self.page})


    def get_detail(self,response):
        items = Db250Item()
        info = response.meta["info"]
        items.update(info)

        detail= response.xpath('//div[@class="indent"]//span[@property="v:summary"]/text()').extract()[0].strip()
        items['detail'] = detail

        yield items

