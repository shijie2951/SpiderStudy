from PIL import Image

# 打开第一张图片
image1 = Image.open("ts.png")

# 打开第二张图片
image2 = Image.open("ts1.png")


# 确定合成图片的大小
width, height = image1.size
total_width = width
max_height = height+image2.size[1]

# 创建一张新图片
new_image = Image.new('RGB', (total_width, max_height))

# 将第一张图片放在新图片上
new_image.paste(image1, (0, 0))

# 将第二张图片放在新图片上
new_image.paste(image2, (0, height))
# 保存新图片
new_image.save("new_image.png")

# with open("new_image.png", mode='rb') as read_obj:
#     print(read_obj.read())

