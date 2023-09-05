import sys
import asyncio
import websockets

async def receive_message(websocket):
    while True:
        send_text = input("请输入要加密的字符串：")
        if send_text == "exit":
            print("退出！")
            await websocket.send(send_text)
            await websocket.close()
            sys.exit()
        else:
            await websocket.send(send_text)
            response_text = await websocket.recv()
            print("\n加密结果：", response_text)


start_server = websockets.serve(receive_message, "127.0.0.1", 5003)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
