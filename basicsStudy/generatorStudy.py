def triangles(m):
    n=1
    while(n<m):
        res=[res[x-1]+res[x] if x>0 and x<n-1 else 1 for x in range(n)]
        n=n+1
        yield res
[print(i) for i in triangles(4)]