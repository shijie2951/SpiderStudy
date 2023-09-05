import redis
redis_data=redis.Redis(host="172.17.0.2",port=19681)
redis_data.lpush("db","https://movie.douban.com/top250")