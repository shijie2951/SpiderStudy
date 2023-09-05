# import requests
# import random
# from lxml import etree
# import re
# import requests
#
# url = 'http://www.baidu.com'
# proxy_host = 'http://e357.kdltps.com'
# proxy_port = '15818'
# proxies = {'http': proxy_host + ':' + proxy_port}
#
# # response = requests.get(url, proxies=proxies)
# # print(response.content)
#
# cookie_lst=[
# # '"__mta=108310973.1686921609373.1686922615154.1686923296757.14; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=1; cityname=%E5%8C%97%E4%BA%AC; _lxsdk_s=188c44d92c6-855-288-62c%7C%7C49; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; token=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; mt_c_token=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; oops=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; userId=1492321437; u=1492321437; isid=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; logintype=normal; webp=1; i_extend=C_b0E026382478948290542125652089410048806294_e-8152803946648119039_v6678802124076380510_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b1; latlng=29.427037,106.591974,1686922577940; idau=1; __utma=74597006.1271887900.1686921606.1686921606.1686921606.1; __utmb=74597006.55.9.1686923296986; __utmc=74597006; __utmz=74597006.1686921606.1.1.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _lx_utm=utm_source%3Dpassport.meituan.com%26utm_medium%3Dreferral%26utm_content%3D%252F; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; ci3=1"',
# #          '"__mta=108310973.1686921609373.1686932085005.1686933064949.27; WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=81; cityname=%E6%B7%84%E5%8D%9A; token=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; mt_c_token=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; userId=1492321437; isid=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; logintype=normal; webp=1; i_extend=C_b0E026382478948290542125652089410048806294_e-8152803946648119039_v6678802124076380510_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b3; latlng=29.427037,106.591974,1686922577940; __utma=74597006.1271887900.1686921606.1686926999.1686932077.3; __utmz=74597006.1686921606.1.1.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=d5808c46-671c-4138-ab2c-d808fad040e3; JSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704.node0; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; __utmc=74597006; ci3=1; token2=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; lt=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; n=IXI419042783; firstTime=1686933060202; unc=IXI419042783; oops=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; u=1492321437; _lxsdk_s=188c4fcb7a4-9f-235-74f%7C%7C6; __utmb=74597006.6.9.1686933065080"',
# #     '"WEBDFPID=z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737-2002266247888-1686906247888KWIUOCE2960edaad10e294fa6f28397fe2285907940; _lxsdk_cuid=188c3729832c8-0d4fe5b8f9809-47380725-1fa400-188c3729832c8; _lxsdk=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; iuuid=80C3A0AE066279434D0736FEA85CE099190829AEEA6483CDAD84556AB11C0C35; uuid=9a95f96703414882b68f.1686906255.1.0.0; ci=81; cityname=%E6%B7%84%E5%8D%9A; token=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; mt_c_token=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; userId=1492321437; isid=AgE-I2viVPBLgDMXAk4U8DMcO1J0KFUM8nVp8h9j7ZbxH_fE5aRFw1DIa1Wseph4CFDsF-78vjEUNgAAAAARGQAAhjNCPS3q0T3uphv_QTTBwaZo_I64t9IsIlfSCK2HPd43s7YnAoTQn6MYxvLOFvjL; logintype=normal; webp=1; i_extend=C_b0E026382478948290542125652089410048806294_e-8152803946648119039_v6678802124076380510_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84GimthomepagesearchH__a100016__b3; latlng=29.427037,106.591974,1686922577940; __utma=74597006.1271887900.1686921606.1686926999.1686932077.3; __utmz=74597006.1686921606.1.1.utmcsr=passport.meituan.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _hc.v=6dd9b364-68a9-2627-9367-567c64658f8b.1686921609; rvct=81; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; qruuid=d5808c46-671c-4138-ab2c-d808fad040e3; IJSESSIONID=node0b2u39xxk65ijmgxs3xliyyxx65580704; __utmc=74597006; ci3=1; token2=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; lt=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; n=IXI419042783; firstTime=1686933264628; unc=IXI419042783; oops=AgHQHJ4wqrUaI_YkSibnitWuYKFykS_6WKXwjCHuFLHN0dRpNS3cHxx5oYnLrtjGGN4CvfojCDcLCAAAAAAvGQAA6pp9kyMuXBgCGzQFoTmkLzKNI0g3o19_sjWPVX-NFfwHm6qGvKM1vmJ3DBGz658V; u=1492321437; _lxsdk_s=188c4fcb7a4-9f-235-74f%7C%7C13; __utmb=74597006.8.9.1686933069757"'
# #     '__mta=256809524.1686908393179.1686921010931.1687003946905.6; iuuid=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; _lxsdk_cuid=188c2f9f96fc8-06c9568ed5cba6-377f525c-1fa400-188c2f9f96fc8; _lxsdk=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; WEBDFPID=3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045-2002260286183-1686900286183ECKEMCIa12a6b8169ee7736639f3ec62dbf984b9491; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; uuid=06a4a39f4ca543b4ac10.1686900615.1.0.0; webp=1; __utmz=74597006.1686900746.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=fde59d42-c1f8-0cb2-546d-8c6f0cd278e7.1686901008; mtcdn=K; rvct=1%2C10; ci=1; cityname=%E5%8C%97%E4%BA%AC; isid=AgEhIqP5GUEqBanu5qycd9mFL5IHS-OTmI1DhhncbOT6MFKVUDsIfrOOigi2GYrpaJES71ZqLurxDAAAAAAvGQAAxtF-7eAdo0MKHok64WvVsn67bujmyhhKmpnWUErhXBlxznqxRpO9CZUebWAr3I8S; mt_c_token=AgEhIqP5GUEqBanu5qycd9mFL5IHS-OTmI1DhhncbOT6MFKVUDsIfrOOigi2GYrpaJES71ZqLurxDAAAAAAvGQAAxtF-7eAdo0MKHok64WvVsn67bujmyhhKmpnWUErhXBlxznqxRpO9CZUebWAr3I8S; logintype=normal; __utma=74597006.168147220.1686900746.1686921372.1686961863.5; latlng=29.426388,106.592083,1686962349559; i_extend=C293086789265027505816573894680894400061_b0_e-5070206185328429493_v6679460782494280347_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f96281659E217897009768512333327413376736501400076_e-2739596935052932209_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_v6679469655420100605GimthomepagesearchH__a; __mta=256809524.1686908393179.1686920660561.1686998219211.4; qruuid=479b2b4c-5c66-4f49-b107-878fc62c5a6c; token2=AgG8HeZqgA7z5dgREKzT6z0o1qeynC0EEXzwzGUU3MAPsuHOMJ2pJ02GzcFtJz2iAJE3_sohIvU2OgAAAAAvGQAAGOr4IMxHM_5EuVAbh9WuVwy3ahI43EvfZBJCMg_mEDA_1wcLUu6zUHc1JANyt5jV; oops=AgG8HeZqgA7z5dgREKzT6z0o1qeynC0EEXzwzGUU3MAPsuHOMJ2pJ02GzcFtJz2iAJE3_sohIvU2OgAAAAAvGQAAGOr4IMxHM_5EuVAbh9WuVwy3ahI43EvfZBJCMg_mEDA_1wcLUu6zUHc1JANyt5jV; lt=AgG8HeZqgA7z5dgREKzT6z0o1qeynC0EEXzwzGUU3MAPsuHOMJ2pJ02GzcFtJz2iAJE3_sohIvU2OgAAAAAvGQAAGOr4IMxHM_5EuVAbh9WuVwy3ahI43EvfZBJCMg_mEDA_1wcLUu6zUHc1JANyt5jV; u=1492321437; n=IXI419042783; firstTime=1687003945945; unc=IXI419042783; _lxsdk_s=188c9450fef-a78-64b-313%7C%7C5'
#     '__mta=256809524.1686908393179.1687003954767.1687009290953.8; iuuid=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; _lxsdk_cuid=188c2f9f96fc8-06c9568ed5cba6-377f525c-1fa400-188c2f9f96fc8; _lxsdk=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; WEBDFPID=3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045-2002260286183-1686900286183ECKEMCIa12a6b8169ee7736639f3ec62dbf984b9491; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; uuid=06a4a39f4ca543b4ac10.1686900615.1.0.0; webp=1; __utmz=74597006.1686900746.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=fde59d42-c1f8-0cb2-546d-8c6f0cd278e7.1686901008; mtcdn=K; rvct=1%2C10; ci=1; cityname=%E5%8C%97%E4%BA%AC; ci3=45; IJSESSIONID=node01x0jtehvf3no0ffepod99vedo67509604; __utma=74597006.168147220.1686900746.1686961863.1687004286.6; __utmc=74597006; latlng=29.426481,106.592378,1687004292504; i_extend=C293086789265027505816573894680894400061_b0_e-5070206185328429493_v6679460782494280347_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_f96281659E293086789265027505816573894680894400061_e2493990636935826171_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_v6680172602180766452GimthomepagesearchH__a; __mta=256809524.1686908393179.1686998219211.1687009216926.5; qruuid=c914e7b2-731c-4265-a3aa-1e0224c4ebac; token2=AgGdIxUw6pT8P_h3SLdqTRqG34FjPkSiDrllXX_OGMctPBsYosJXhbMrrKYXbLBb0f0q01HQNwNqdQAAAAAvGQAA7zpu8f390ZVwJ6ZtPJCIwPCbeIUbK-kzusgHyZICOVjjjbXc6jXDz2taI_o-ailJ; oops=AgGdIxUw6pT8P_h3SLdqTRqG34FjPkSiDrllXX_OGMctPBsYosJXhbMrrKYXbLBb0f0q01HQNwNqdQAAAAAvGQAA7zpu8f390ZVwJ6ZtPJCIwPCbeIUbK-kzusgHyZICOVjjjbXc6jXDz2taI_o-ailJ; lt=AgGdIxUw6pT8P_h3SLdqTRqG34FjPkSiDrllXX_OGMctPBsYosJXhbMrrKYXbLBb0f0q01HQNwNqdQAAAAAvGQAA7zpu8f390ZVwJ6ZtPJCIwPCbeIUbK-kzusgHyZICOVjjjbXc6jXDz2taI_o-ailJ; u=2858451583; n=bOk628074120; firstTime=1687009289261; unc=bOk628074120; _lxsdk_s=188c9941c64-344-451-f56%7C%7C14'
# ]
# random_cookie = random.choice(cookie_lst)
#
# session = requests.session()
# headers=  {
#         'mtgsig': '{"a1":"1.1","a2":1686964283067,"a3":"z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737","a5":"OV/gc97mcgiqH1r5W4KzHY88GHIQa4Su","a6":"h1.3yUUmyoXLpkwN3wYeKTO7GgzbLwh3g5UHuqnOAE+EQ9ad8u6BvRN/4CUgAx0Sex7ZDRjRd0pM1Iy4Y4RSg7fTnmt1PvgB1FGmsgKxuh5rVc7SyQkrbS5pPDOxunZzy7a20FDFmJ8EG+RldmJJrKIHHbr1IygGvRLpTZQBuwvOOkUzMCjmFIQnZtf/H0lyHGpfzKtvrBLwZ9VgIIyZPgDic6lJbAWjUXj0e4MqepUZrb9lkN1zt54N/Jls/zs2+NQb5rFrZ3J7Hk7MvSmhTv3bNMBZnZExFsuUgXHYm6u93zE=","x0":4,"d1":"a4eed3e7bc71c7ec902b5879189f1409"}',
#         "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
#         # 'sec-ch-ua-platform': '"Linux"',
#         "Cookie": random_cookie
#     }
# res=requests.get(url="https://i.meituan.com/s/beijing-%E5%8F%A3%E8%85%94%E6%9C%BA%E6%9E%84?p=1",headers=headers,proxies=proxies)
# # print(re.search("403 Forbidden",res.text,re.S).group())
# # print(res.text)
#
# tree = etree.HTML(res.text)
# # print(tree.xpath('//*[@class="list list-in poiList"]/dd/dl')[0])
# # if(tree.xpath('//*[@class="list list-in poiList"]/dd/dl')[0]!=Exception):
# #     print("1111")
# for i in tree.xpath('//*[@class="list list-in poiList"]/dd/dl'):
#     random_cookie = random.choice(cookie_lst)
#     headers = {
#         'mtgsig': '{"a1":"1.1","a2":1686934030205,"a3":"z4uvv570v19y5922z5yy85xzw32w32y8811x62700yv9795827w2v737","a5":"U7aQ3XdHVXvnw1MucPlIoc14E+z0KKTM","a6":"h1.3Ui8Wq6mXwCAIJUEo5uK7ZCLuSkP6zjyabVJent9FjAtlTf9hmBpsS6JoZW3Hcz8KW87jWR1KNbGw2Cn0bGiuiBRkGozOqowmeV0Ib/S+4B5Xa2hpcWYsRn3tGi/psftUEhBA8EPsW6nuxe0D5teO91yLW2eEtGfgTW6lQJw4LP6zSa/C54YGQWul02RQotJu46WQlPaqVX6cwnBu5C4r0QZez5u01jD3Ath5JS/NFIkaOHOAFvGZZYcBNaguW3od8FRE26XHH4jKt26EFDXYigeDtl0sTzFPSgKtGo3wamM=","x0":4,"d1":"49798a0084e2f7f2b32f480fcd9b7df0"}',
#         "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS",
#         "Cookie": random_cookie
#     }
#     url = "https:" + i.xpath("dd[1]/a/@href")[0]
#     print(url)
#     res2 = requests.get(url=url,headers=headers,proxies=proxies )
#     uid = re.search("\d+", url).group()


#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
使用requests请求隧道服务器
请求http和https网页均适用
"""

import requests

# 隧道域名:端口号
tunnel = "e357.kdltps.com:15818"

# 用户名密码方式
username = "t18700463482825"
password = "ipogu6le"
proxies = {
    "http": "http://%(user)s:%(pwd)s@%(proxy)s/" % {"user": username, "pwd": password, "proxy": tunnel},
    "https": "http://%(user)s:%(pwd)s@%(proxy)s/" % {"user": username, "pwd": password, "proxy": tunnel}
}

# 白名单方式（需提前设置白名单）
# proxies = {
#     "http": "http://%(proxy)s/" % {"proxy": tunnel},
#     "https": "http://%(proxy)s/" % {"proxy": tunnel}
# }

# 要访问的目标网页
target_url = "https://www.baidu.com/"

# 使用隧道域名发送请求
response = requests.get(target_url, proxies=proxies)

# 获取页面内容
if response.status_code == 200:
    print(response.text)  # 请勿使用keep-alive复用连接(会导致隧道不能切换IP)