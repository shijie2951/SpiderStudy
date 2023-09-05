import json
import re
from lxml import etree
import execjs
import requests
from parsel import Selector

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
}
numbe = {"240": 103, "247": 0, "249": 102, "251": 203, "256": 224, "264": 181, "266": 108, "268": 240, "270": 101, "272": 126, "274": 103, "281": 11, "283": 102, "285": 203, "290": 225, "298": 108, "302": 208, "304": 108, "306": 100, "308": 127}
url = "https://www.shhuangpu.gov.cn/zw/009001/009001002/009001002003/26.html"
response = requests.get(url, headers=headers, verify=False)
FSSBBIl1UgzbN7NO = response.cookies.get("FSSBBIl1UgzbN7NO")  # 获取cookie
print(f"FSSBBIl1UgzbN7NO：{FSSBBIl1UgzbN7NO}")
etree_html = etree.HTML(response.text)
content = etree_html.xpath("//meta/@content")[1]
print(f"content：{content}")
script = etree_html.xpath("//script")
js_url = 'https://www.shhuangpu.gov.cn' + script[0].xpath("@src")[0]
resp = requests.get(js_url, headers=headers)
auto_code = script[1].xpath("text()")[0]
ret_code = re.findall(r'.{4}=.{4}\[.{4}\[\d+\]\]\(.{4},.{4}\);', auto_code)[0]  # 匹配call所在位置
vm_code = re.findall(r",(.*?)\)", ret_code)[0]  # 匹配vm函数
re_str = f"ret={vm_code};window.vm_code={vm_code};debugger;"  # 替换运行拿到vm代码
auto_code = auto_code.replace(ret_code, re_str)  # 替换
js_code = '''
window = global;
delete global;
document = {
    characterSet:'UTF-8',
    charset:'UTF-8',
    scripts: ['script','script']
};
aaaaaa;
bbbbbb;
function sdk() {{
    return [$_ts, vm_code];
}}
'''.replace("aaaaaa", resp.text).replace("bbbbbb", auto_code)
compile = execjs.compile(js_code)  # 运行  拿到解码的值和生成的vm代码
li = compile.call("sdk")
tss = li[0]
vm_code = li[1]
head = re.findall("var _\$(\w{2})=.{4}\[.{4}\[\d+\]\]\|\|\(.{4}\[.{4}\[\d+\]\]=\{\}\);", vm_code)[0]  # $_ts值的变量   _$qn  var _$qn = _$VE["$_ts"] || (_$VE["$_ts"] = {});
_p = re.findall(r";return\(.{4}>>_\$ffff\.(.{4})\)\|\(\(.{4}&.{4}\[_\$ffff\..{4}\]\)<<\(".replace("ffff", head), vm_code)[0]  # 魔改64的位运算的值  右移多少位  _$7i   return _$aC >> _$qn._$7i | (_$aC & _$wM[_$qn._$7i]) << 6 - _$qn._$7i
_d5 = re.findall(r".{4}\^=_\$ffff\.(.{4});".replace("ffff", head), vm_code)[0]  # # 魔改64的位运算的值  和什么值异或  _$oT  _$wM ^= _$qn._$oT;
_hr = re.findall(r"var .{4}=.{4}\(.{4}\(.{4}\[163\]\)\+_\$ffff\.(.{4})\);".replace("ffff", head), vm_code)[0]
_7E = re.findall(r";_\$ffff\.(.{4})=.{4}\[_\$ffff\..{4}\]\(.{4},.{4}\);".replace("ffff", head), vm_code)[0]
_q = re.findall(r"\{_\$ffff\.(.{4})=.{4}\[_\$ffff\..{4}\]\(.{4},.{4}\);".replace("ffff", head), vm_code)[0]
_td = re.findall(r"_\$ffff\.(.{4})=.{4}\[_\$ffff\..{4}\]\(\);".replace("ffff", head), vm_code)[0]
_lf = re.findall(r"_\$ffff\.(.{4})=.{4}\[_\$ffff\..{4}\]\(.{4}\);".replace("ffff", head), vm_code)[0]
_kc = re.findall(r"var .{4}=.{4}\(_\$ffff\.(.{4})\);".replace("ffff", head), vm_code)[0]
_fQ = re.findall(r"var .{4}=.{4}\(.{4}\(.{4}\[226\]\)\+_\$ffff\.(.{4})\);".replace("ffff", head), vm_code)[0]
_Ih = re.findall(r"var .{4}=\[\d+,_\$ffff\.(.{4})\]\[.{4}\];".replace("ffff", head), vm_code)[0]
_Ol = re.findall(r"var .{4}=.{4}\(.{4}\(.{4}\[66\]\)\+_\$ffff\.(.{4})\);".replace("ffff", head), vm_code)[0]
_4y = re.findall(r"var .{4}=_\$ffff\.(.{4});".replace("ffff", head), vm_code)[0]

# content = "{qr7qr0qr0qr4qqq.mYMzoPp1LHBCxXd5_wu8Jp48goRHrUDvBvdXLOLEbvWqVwXxoTldpAJxi09h8AJJiqr0qr0qhQ0AyW.I9NpKqYhdqQ99UVRHcwNndSIIZJPqhZ2XI7G4km1Xqhcr7eMQl.eT1ql4096qt1083703328qk674qDd5db02qXqrmLRUpPQn2rQVJkQ2NPUspBQDyDAo2s1YNSYUfRiP70laqr1qr0qqq|@qSS_tCmH3VggROpcVVJuDKxzifwtQkf.Mbx0RVQ13rzEovw4WTLTQsfWWv7CpUAcwqYQk0NAQmNjkDNwQmYjqVQcVCN689ZmY2GCi9gyicm_xl2d1A2_kY9.YceFE6W8FqNacUw0snrcwDGO3Oz2J6AZFOxNHoAuirmAc0lM1O3nkbAb3pW0lkf.VGxYmVEb3ATHW9LDiceDlDZMFGR0VKrmpppxm0pMWn9zmk3Y3VESp108QlyvKlVH1AxlskWZhpZCDDmJWVGzmUc4Fw3aXCMy3wJseuPnQQTm4sUOsQ3CXUi6YHYK_sMTwepX5qq?xxSrZFaVPpOS0HYmusYf.IrxGR2wU1UpjUT2bHfTD1KzhQaziV9Thk92K10Gh1Txt1azxUVzmc0p1p0zScaZpRmmJpAfVUvJ.m0NSD9JuAYTHUoRyrAJZYmxU1Srx1lz1cTm1hlzz1swhha7jVP2hF99n1np_RAVhFARDk6qHsUTrrV0kwSAAoSlcc1wDwS0J11xhJq76VORhw09N1ulhWmEu10Sxml7icaT1cl7gc0pbkKqNRAm0W6WWwOJYrU0N3cwJJ2gqrVfZoYE31T2xq07McSR1mVzK1Ayhlq7sVfxhV0vT15T_.GUm352JSrduo7xY0rI5I42rBTscM4NG.r6V18YhdABZVBehXlvG1dLh5Yh014Yx40B6cdx1ZVBkc4Tznm60Q7zYb2o.1eZp5UIgRBlYa24zrRmZa2hr1gxxC9BQcee169XI1QmhCAB3Vzzh2lvW1eR_2aUaFWeH4moJcFJTNKU0Uj2dzocHVt2KypCs1MShNGX2VjrhgVb41_WhB2te1dyxN9Xgc4z1X9XtcdNCXbFkFExmfKX2pRz9jfDyl3RmzS1PrwyZPTtt1ZzxvVXmcgp1f0Bq1RfhGGXrVNSh6Vbo1ye_CqKbm7JOaSKNUFzpGCFB1FRkSluxRERNEfxFpvwlMapjUK2lt9RnpDAlRTTbpcwD8VpfrDrw30pJrkJ51oTRFYxQITylF2N5MomTpPTqIb2McPwuQmTupqSDYlpirlTw1lAxp2Jl1apDUVYlr9R8plrTqANgQv283pGqAmJQr0YpMARjRDmGAVyxDSxfp9ylVqpsUYxll03Tpc0lhm0BpDfDWlAjrc2wxlAVrDfakC7_FpTMhrZAFSRp3lZkopNwolL9cbSuiY00poYDh0A6rkxwWVpnpPNlkqAHUAyls03ppq2T1GLgDapnUbq78pWFhVaBVq2cqUl0KufBVrELpGmlDAA3UpzlYl3Wpr3lmY0ApmmDc0Asriyw4VsIrtmJ46v0oIp9d96mD7w_aC__oIz8CbdHc.Yud26ephyDy9sgrHzw5914pXTleAs0UIwl7lMLpHxT7a.hIyVFyb6AowRA6ooN3NJ1b6uWoefRPph6pzflaGsrUwSlvVMopJZlC26RpxNDa9sVrJwwT9sbrxylT0.Ss7zQOUb28FmF2K4ZQRLRdfCqcBxuNTCbpiwDXV1frtrwL0sZpjplBG1eUMfl5VFOphzTeqjNM8z9Pfb58jyy2Di61eRbTCCawgRRSft5pNJlPa1DU3YlS9F8pEqlGTCcpWJDfV1wrxSwv01NrJwFbC8KlW0QPbBt8g2XzpC.DhTDfTzrcuznMmSBp1foQlYjrK2QRlV2p6emRaYPUDmmE9w_pUS0HAzbIVRE3fZOonYh8KptKTztwoJUoVJXHSJmpCNmsqYHUlymk0wppV9m1mShpApoUlYDrVYQAlYarAS8ApfsKoV38lrolmfDrbSVpGVwAfm5carnYYSAppmo10Ysr1yQhVYXpuRmtqV.UcNmF0Qep1Y0JaV2UcrmlcWqQU8yj6bdIM7p.nDBcFQx9abuJRQwjqlDSE0qc64qc64qqqkRLLqqq_xelEjTkem5W8yrI9ci3U4fILmX9U_qO.m5VU4pMXm50U0rsimwAxPTix1a| K4JvCOUlh7m4aPhoHLYy0sh8HegTvvBVHgJygq1BJF00Lu5QriR4juj.HBNyjuc5Ej9L9scOoyL55nDIE5qwLk_clyGy7CiWkgEFb1ufF4Ex2ObIqy9K_Sb.kta.X1_kMy7S0G1nMjG5Ln61qFEfbad1MLyX.s1fM_GpTSb_J.A_bD_4HQ37BqbscFpjvrcYktLABabND.LzzqbAm2GtQP2Lob7zJfyNcoJ9Akz7cO0b1aTDMkaeEn2HlCAlIaVGDVVzWUSPHU9NQClTxvL2Ac2whYgWMq79JKAE1nejmKp.A6gwiJILWuAhtq7Zcua!x7z,aac,amr,asm,avi,bak,bat,bmp,bin,c,cab,css,csv,com,cpp,dat,dll,doc,dot,docx,exe,eot,fla,flc,fon,fot,font,gdb,gif,gz,gho,hlp,hpp,htc,ico,ini,inf,ins,iso,js,jar,jpg,jpeg,json,java,lib,log,mid,mp4,mpa,m4a,mp3,mpg,mkv,mod,mov,mim,mpp,msi,mpeg,obj,ocx,ogg,olb,ole,otf,py,pyc,pas,pgm,ppm,pps,ppt,pdf,pptx,png,pic,pli,psd,qif,qtx,ra,rm,ram,rmvb,reg,res,rtf,rar,so,sbl,sfx,swa,swf,svg,sys,tar,taz,tif,tiff,torrent,txt,ttf,vsd,vss,vsw,vxd,woff,woff2,wmv,wma,wav,wps,xbm,xpm,xls,xlsx,xsl,xml,z,zip,apk,plist,ipa"


# ts = {"_$d5": 62, "_$$p": 5, "_$Ox": 17, "_$hr": "p1y2xBZo4rG", "_$7E": '_$iN', "_$$q": "_$hp", "_$td": "_$0S", "_$lf": "_$0n", "_$kc": "LxoyZAhgzfG7g_12DNYfoG", "_$fQ": "4SRr7PilMBq", "_$Ih": 215, "_$Ol": "pW5BdnMPfhy6fbnYAruVLZ", "_$4y": 155}
def find_num(ts_fun_name):
    fun_name = re.findall(r".{4}\._\$ffff=(.{4});".replace("ffff", ts_fun_name[-2:]), vm_code)[0]
    value = re.findall(r"function _\$ffff\(\)\{var .{4}=\[(\d+)\];".replace("ffff", fun_name[-2:]), vm_code)[0]
    return numbe[value]


ts = {
    "_$d5": tss[_d5],
    "_$$p": tss[_p],
    "_$hr": tss[_hr],
    "_$7E": find_num(tss[_7E]),
    "_$$q": find_num(tss[_q]),
    "_$td": find_num(tss[_td]),
    "_$lf": find_num(tss[_lf]),
    "_$kc": tss[_kc],
    "_$fQ": tss[_fQ],
    "_$Ih": tss[_Ih],
    "_$Ol": tss[_Ol],
    "_$4y": tss[_4y],
}

print("ts:{}".format(ts))
with open("rs5.js", encoding='utf-8') as f:
    ru_code = f.read()
vm_code = '''
let content = "aaaaaa";
let ts = JSON.parse('bbbbbb');
cccccc;
'''.replace("aaaaaa", content).replace("bbbbbb", json.dumps(ts)).replace("cccccc", ru_code)

ru = execjs.compile(vm_code)

cookie = ru.call("get_cookie")
print(f"生成的cookie：{cookie}")
cookies = {
    "FSSBBIl1UgzbN7NO": FSSBBIl1UgzbN7NO,
    "FSSBBIl1UgzbN7NP": cookie
}

url = "https://www.shhuangpu.gov.cn/zw/009001/009001002/009001002003/26.html"
response = requests.get(url, headers=headers, verify=False, cookies=cookies)

print(response.status_code)
# print(f"cookies无效：{response.text}")
