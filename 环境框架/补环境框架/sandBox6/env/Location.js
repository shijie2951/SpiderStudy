//Location对象
Location = function Location() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Location,"Location");

//location对象
location = {}
Object.setPrototypeOf(location, Location.prototype);
xzvm.toolsFunc.defineProperty(location, "valueOf", {enumerable: false, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","valueOf",arguments);}});
xzvm.toolsFunc.defineProperty(location, "ancestorOrigins", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","ancestorOrigins_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(location, "href", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","href_get",arguments,"https://www.baidu.com/s?&tn=79057844_3_dg&ie=utf-8&wd=mysql%E5%BA%95%E5%B1%82")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","href_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "origin", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","origin_get",arguments,"https://www.baidu.com")},set:undefined});
xzvm.toolsFunc.defineProperty(location, "protocol", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","protocol_get",arguments,"https:")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","protocol_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "host", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","host_get",arguments,"www.baidu.com")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","host_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "hostname", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hostname_get",arguments,"www.baidu.com")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hostname_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "port", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","port_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","port_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "pathname", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","pathname_get",arguments,"/s")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","pathname_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "search", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","search_get",arguments,"?&tn=79057844_3_dg&ie=utf-8&wd=mysql%E5%BA%95%E5%B1%82")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","search_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "hash", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hash_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hash_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "assign", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","assign",arguments);}});
xzvm.toolsFunc.defineProperty(location, "reload", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","reload",arguments);}});
xzvm.toolsFunc.defineProperty(location, "replace", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","replace",arguments);}});
xzvm.toolsFunc.defineProperty(location, "toString", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","toString",arguments);}});
