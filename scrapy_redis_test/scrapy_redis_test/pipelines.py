import json
import pandas as pd
from itemadapter import ItemAdapter


class Db250Pipeline:
    def open_spider(self,spider):
        self.f = open('film_mes1.txt','w',encoding='utf-8')

    def process_item(self, item, spider):
        data = json.dumps(dict(item),ensure_ascii=False)+'\n'
        self.f.write(data)

        return item

    def close_spider(self,spider):
        self.f.close()
