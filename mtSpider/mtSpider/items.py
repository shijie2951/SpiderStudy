# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class MtspiderItem(scrapy.Item):
    # define the fields for your item here like:
    name = scrapy.Field()
    address = scrapy.Field()
    phoneNumber = scrapy.Field()
    stars = scrapy.Field()
    comment_count = scrapy.Field()
    # pass
