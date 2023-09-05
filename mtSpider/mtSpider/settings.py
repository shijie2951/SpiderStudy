# Scrapy settings for mtSpider project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = "mtSpider"

SPIDER_MODULES = ["mtSpider.spiders"]
NEWSPIDER_MODULE = "mtSpider.spiders"


# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = "mtSpider (+http://www.yourdomain.com)"

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure maximum concurrent requests performed by Scrapy (default: 16)
#CONCURRENT_REQUESTS = 32

# Configure a delay for requests for the same website (default: 0)
# See https://docs.scrapy.org/en/latest/topics/settings.html#download-delay
# See also autothrottle settings and docs
#DOWNLOAD_DELAY = 3
# The download delay setting will honor only one of:
#CONCURRENT_REQUESTS_PER_DOMAIN = 16
#CONCURRENT_REQUESTS_PER_IP = 16

# Disable cookies (enabled by default)
# COOKIES_ENABLED = False

# Disable Telnet Console (enabled by default)
#TELNETCONSOLE_ENABLED = False

# Override the default request headers:
DEFAULT_REQUEST_HEADERS = headers={

    "Cookie": "IJSESSIONID=node0161rvbb9qtjc212enfb6zlcn58319385; iuuid=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; _lxsdk_cuid=188c2f9f96fc8-06c9568ed5cba6-377f525c-1fa400-188c2f9f96fc8; _lxsdk=D46CD3D41E0FBD780687288B0BD57CC24E9BE33C347D864589B97646C13D98F4; WEBDFPID=3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045-2002260286183-1686900286183ECKEMCIa12a6b8169ee7736639f3ec62dbf984b9491; ci3=45; _lx_utm=utm_source%3DBaidu%26utm_medium%3Dorganic; uuid=06a4a39f4ca543b4ac10.1686900615.1.0.0; userId=1492321437; u=1492321437; isid=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; webp=1; __utmc=74597006; __utmz=74597006.1686900746.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _hc.v=fde59d42-c1f8-0cb2-546d-8c6f0cd278e7.1686901008; meishi_ci=59; cityid=59; p_token=AgG_IeT7r9dLXaAGvufaQ45n2yp8ledTtBHVRsyR-9L8sPbIQrU97Qkb3fF955gA5SqN6G6Y3dJG3QAAAAARGQAABERmLgYsTa3KpZks7Cu8oW0Ksy21hclz-LNnDU51nxOOt08Z95plc-SXFuYoxx90; client-id=404d391f-17b3-4dec-8893-762ba97493d7; mtcdn=K; userTicket=uGEnQMnIBUpujVkIVVcmvcsDJYWEyWBIIvFUBnSU; n=IXI419042783; lt=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; mt_c_token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; token2=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; unc=IXI419042783; ci=1; rvct=1%2C10; oops=AgHHIK-Dz0ImbMKXdrR7VQU_ldmcyFYG38w4NcC4-RY0rT4ZnZYmEjeRnStZQkdvuksf7eeLP1fccAAAAAARGQAAQdE1WTrbp7hiWaM6R9j832XlKaEYNnCQnoBE0shSVhzLQIRz4OzF72MKG3g9P8WT; logintype=normal; cityname=%E5%8C%97%E4%BA%AC; idau=1; __utma=74597006.168147220.1686900746.1686900746.1686910645.2; latlng=29.427037,106.591974,1686910659226; i_extend=C_b0E157414336152989513647135656994396466079_e2678956151633231129_a%e5%8f%a3%e8%85%94%e6%9c%ba%e6%9e%84_v6678602508505574395GimthomepagesearchH__a100005__b2; __utmb=74597006.9.9.1686910708126; firstTime=1686910728706; _lxsdk_s=188c317a1f5-5fb-be8-6cb%7C%7C284",

    "mtgsig": "{\"a1\":\"1.1\",\"a2\":1686910758689,\"a3\":\"3yv1vu1vvwu053x5zzy6w231yuvv19u3811x682z7zy97958259w4045\",\"a5\":\"krW7Vv0xp1+2uLOtcQW+2DFDmCSLYTGY\",\"a6\":\"h1.33S2ovJ2kJ2QXG7KUllABgW75DWJbkv2OXXDLpFAsxEes176LROozG5Zm3zdugJJ+X3IPYD42/PiiVo6f3aytlBYEAeuWKobtnKaBIQZ5Dqx56jXTKtb+Wx3jX/JZvf1u7dv+XxtVE6D8bVpW6obuI8PGLN4kV8vYnox1hRpC7xxikCUT5VF6MArKYbtI/SmfCEAt9o1C1Av/GDEvlGDYnUhgVCVklDYE1nNBAjDO68hSR7knE+Vlufxs7yvr1brCv6dcLqNlVQqZzWFth/8kWbHMDTgb4EH7lBAyW6w3m6HCDQTRPOjBgf3FRavtZ5PVc+W+ko7H9JmggDSi2inFXf7T1cxHCP7xr1tbFbKoTJA=\",\"x0\":4,\"d1\":\"26b82dcf1d7a15cd6403d3753bc23800\"}",

    "sec-ch-ua-platform": "\"Linux\"",

    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS"
}

# Enable or disable spider middlewares
# See https://docs.scrapy.org/en/latest/topics/spider-middleware.html
#SPIDER_MIDDLEWARES = {
#    "mtSpider.middlewares.MtspiderSpiderMiddleware": 543,
#}

# Enable or disable downloader middlewares
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#DOWNLOADER_MIDDLEWARES = {
#    "mtSpider.middlewares.MtspiderDownloaderMiddleware": 543,
#}

# Enable or disable extensions
# See https://docs.scrapy.org/en/latest/topics/extensions.html
#EXTENSIONS = {
#    "scrapy.extensions.telnet.TelnetConsole": None,
#}

# Configure item pipelines
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
#ITEM_PIPELINES = {
#    "mtSpider.pipelines.MtspiderPipeline": 300,
#}

# Enable and configure the AutoThrottle extension (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/autothrottle.html
#AUTOTHROTTLE_ENABLED = True
# The initial download delay
#AUTOTHROTTLE_START_DELAY = 5
# The maximum download delay to be set in case of high latencies
#AUTOTHROTTLE_MAX_DELAY = 60
# The average number of requests Scrapy should be sending in parallel to
# each remote server
#AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
# Enable showing throttling stats for every response received:
#AUTOTHROTTLE_DEBUG = False

# Enable and configure HTTP caching (disabled by default)
# See https://docs.scrapy.org/en/latest/topics/downloader-middleware.html#httpcache-middleware-settings
#HTTPCACHE_ENABLED = True
#HTTPCACHE_EXPIRATION_SECS = 0
#HTTPCACHE_DIR = "httpcache"
#HTTPCACHE_IGNORE_HTTP_CODES = []
#HTTPCACHE_STORAGE = "scrapy.extensions.httpcache.FilesystemCacheStorage"

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
