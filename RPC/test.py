# 服务端 RpcServer.py
# -*- coding: utf-8 -*-
import json
import socket
funs = {}


def register_function(func):
    """Server端方法注册，Client端只可调用被注册的方法"""
    name = func.__name__
    funs[name] = func


class TCPServer(object):

    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.client_socket = None

    def bind_listen(self, port):
        self.sock.bind(('0.0.0.0', port))
        self.sock.listen(5)

    def accept_receive_close(self):
        """获取Client端信息"""
        if self.client_socket is None:
            (self.client_socket, address) = self.sock.accept()
        if self.client_socket:
            msg = self.client_socket.recv(1024)
            data = self.on_msg(msg)
            self.client_socket.send(data)  # 回传


class RPCStub(object):

    def __init__(self):
        self.data = None

    def call_method(self, data):
        """解析数据，调用对应的方法变将该方法执行结果返回"""
        if len(data) == 0:
            return json.dumps("something wrong").encode('utf-8')
        self.data = json.loads(data.decode('utf-8'))
        method_name = self.data['method_name']
        method_args = self.data['method_args']
        method_kwargs = self.data['method_kwargs']
        res = funs[method_name](*method_args, **method_kwargs)
        data = res
        return json.dumps(data).encode('utf-8')


class RPCServer(TCPServer, RPCStub):
    def __init__(self):
        TCPServer.__init__(self)
        RPCStub.__init__(self)

    def loop(self, port):
        # 循环监听 5003 端口
        self.bind_listen(port)
        print('Server listen 5003 ...')
        while True:
            try:
                self.accept_receive_close()
            except Exception:
                self.client_socket.close()
                self.client_socket = None
                continue

    def on_msg(self, data):
        return self.call_method(data)


@register_function
def add(a, b, c=10):
    sum = a + b + c
    print(sum)
    return sum


@register_function
def setData(data):
    print(data)
    return data


s = RPCServer()
s.loop(5003)  # 传入要监听的端口
print(s.loop(5003))



