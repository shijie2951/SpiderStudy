import os.path
import requests
import re
import csv

strat = int(input("请输入起始页:"))
end = int(input("请输入目标页数"))
for i in range(strat, end+1):
    page = i
    i = (i - 1) * 25
    url = 'https://movie.douban.com/top250?start={}&filter='.format(i)
    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS'
    }
    r = requests.get(url=url, headers=headers)
    chinese_name = re.findall('<span class="title">([\u4e00-\u9fa5]|[^a-z]+)</span>', r.text, re.S)
    # 列表推导式
    english_name = [i.replace("  /  ", "/") for i in
                    re.findall('<span class="other">&nbsp;/&nbsp;(.*?)</span>', r.text, re.S)]
    director = [re.findall('导演:(.*?)&nbsp;&nbsp;', i, re.S)[0] for i in
                re.findall('<p class="">(.*?)</p>', r.text, re.S)]
    year = [re.findall('\d{4}', i, re.S)[0] for i in re.findall('<p class="">(.*?)</p>', r.text, re.S)]
    country = [re.findall('\d{4}.*(.[\u4e00-\u9fa5]+)&nbsp', i, re.S)[0] for i in
               re.findall('<p class="">(.*?)</p>', r.text, re.S)]

    actor_lst = []
    content = re.findall('<p class="">(.*?)</p>', r.text, re.S)
    for j in content:
        actor = re.findall('主演:(.*?)<br>', j, re.S)
        try:
            actor_lst.append(actor[0].replace(" / ", "/").replace("...", ""))
        except:
            actor_lst.append(None)

    img_url = re.findall('src="(.*?)" class', r.text)
    # 保存图片的文件夹路径
    img_dir = "/home/shijie/PycharmProjects/SpiderStudy/豆瓣/图片/"
    for j in range(len(img_url)):
        img = requests.get(img_url[j]).content
        with open(img_dir + chinese_name[j] + ".png", "wb") as f:
            f.write(img)
            f.close()
    data = list(zip(chinese_name, english_name, director, actor_lst, year, country))
    # 保存路径
    csv_file = 'data.csv'
    file_exists = os.path.isfile(csv_file)

    with open(csv_file, 'a+', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        # 写入字段名
        if not file_exists:
            writer.writerow(['chinese_name', 'english_name', 'director', 'actor', 'year', 'country'])
        # 写入数据
        writer.writerows(data)
    print("第" + str(page) + "页爬取完成!!!!!!!!!!")
