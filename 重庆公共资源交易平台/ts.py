import re

import requests
import json
from lxml import etree
import time
session=requests.session()
session.headers.update({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Cookie": "cookie_www=36802747; __jsluid_s=b4f691e3089fb508fa6a91a32f1ca425; Hm_lvt_3b83938a8721dadef0b185225769572a=1684224756; Hm_lpvt_3b83938a8721dadef0b185225769572a=1684228223",
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
session.cookies.update( {
    "JSESSIONID": "CA9C2F06766E52A4C168EEC736379B7E",
    "__jsluid_s": "01ecca173bb366b1990707375a04090d",
    "cookie_www": "36802747",
    "Hm_lvt_3b83938a8721dadef0b185225769572a": "1684229417,1684286476",
    "Hm_lpvt_3b83938a8721dadef0b185225769572a": "1684294917"
})
# url = "https://www.cqggzy.com/EpointWebBuilderService/getInfoListAndCategoryList.action?cmd=getInfoListWithSecondCateNew"
# data = {"pageIndex": 1502,
# "pageSize": 20,
# "siteguid": "d7878853-1c74-4913-ab15-1d72b70ff5e7",
# "categorynum": "014",
# "title": "",
# "infoC":"",
# "startdate": "2021-01-01 00:00:00",
# "enddate":" 2023-05-17 23:59:59"}
# # data = json.dumps(data, separators=(',', ':'))
# response = session.post(url,data=data)
# ss=response.json()['custom']
# n=json.loads(ss)
# print(json.loads(response.json()["custom"])[0])
# a=json.loads(response.json()["custom"])[0]['infoid']

url="https://www.cqggzy.com/EpointWebBuilderService/getInfoListAndCategoryList.action"
data={
"cmd": "getInfoRelationListNew",
"infoid":"BRII_500107MA605K4U02304120210" ,
"siteguid": "d7878853-1c74-4913-ab15-1d72b70ff5e7",
"categorynum": "014010002"
}
rr=session.get(url,params=data)
print(json.loads(rr.json()['custom'])[0]['infoD'])
# rr=session.get("https://www.cqggzy.com/xxhz/014005/014005002/20230417/1223976412109910016.html")
# print(rr.text)

# data_dic=response.json()
# records_list=data_dic['result']['records']
# url_list=[]
# for i in records_list:
#     categorynum=i['categorynum']
#     webdate=i['webdate']
#     time_lst=webdate.split("-")[0:3]
#     year=time_lst[0]
#     month=time_lst[1]
#     day=time_lst[2].split(" ")[0]
#     date=year+month+day
#     # print(date)
#     infoid=i['infoid']
#     # print(idd)
#     # print(len(categorynum))
#     if len(categorynum)==9:
#         url="https://www.cqggzy.com/xxhz/{}/{}/{}/{}.html".format(categorynum[:-3],categorynum,date,infoid)
#         # url_list.append(url)
#     else :
#         url = "https://www.cqggzy.com/xxhz/{}/{}/{}/{}/{}.html".format(categorynum[:-6], categorynum[:-3],categorynum, date, infoid)
#         # print(url)
#         url_list.append(url)
# print(url_list)
# for i in url_list:
#     r=session.get(i).text
#     tree=etree.HTML(r)
#     print(tree.xpath("/html/body/div[2]/div/div[1]/text()"))



