var g = 0
          , y = 32
          , d = 16
          , w = [214, 144, 233, 254, 204, 225, 61, 183, 22, 182, 20, 194, 40, 251, 44, 5, 43, 103, 154, 118, 42, 190, 4, 195, 170, 68, 19, 38, 73, 134, 6, 153, 156, 66, 80, 244, 145, 239, 152, 122, 51, 84, 11, 67, 237, 207, 172, 98, 228, 179, 28, 169, 201, 8, 232, 149, 128, 223, 148, 250, 117, 143, 63, 166, 71, 7, 167, 252, 243, 115, 23, 186, 131, 89, 60, 25, 230, 133, 79, 168, 104, 107, 129, 178, 113, 100, 218, 139, 248, 235, 15, 75, 112, 86, 157, 53, 30, 36, 14, 94, 99, 88, 209, 162, 37, 34, 124, 59, 1, 33, 120, 135, 212, 0, 70, 87, 159, 211, 39, 82, 76, 54, 2, 231, 160, 196, 200, 158, 234, 191, 138, 210, 64, 199, 56, 181, 163, 247, 242, 206, 249, 97, 21, 161, 224, 174, 93, 164, 155, 52, 26, 85, 173, 147, 50, 48, 245, 140, 177, 227, 29, 246, 226, 46, 130, 102, 202, 96, 192, 41, 35, 171, 13, 83, 78, 111, 213, 219, 55, 69, 222, 253, 142, 47, 3, 255, 106, 114, 109, 108, 91, 81, 141, 27, 175, 146, 187, 221, 188, 127, 17, 217, 92, 65, 31, 16, 90, 216, 10, 193, 49, 136, 165, 205, 123, 189, 45, 116, 208, 18, 184, 229, 180, 176, 137, 105, 151, 74, 12, 150, 119, 126, 101, 185, 241, 9, 197, 110, 198, 132, 24, 240, 125, 236, 58, 220, 77, 32, 121, 238, 95, 62, 215, 203, 57, 72]
          , A = [462357, 472066609, 943670861, 1415275113, 1886879365, 2358483617, 2830087869, 3301692121, 3773296373, 4228057617, 404694573, 876298825, 1347903077, 1819507329, 2291111581, 2762715833, 3234320085, 3705924337, 4177462797, 337322537, 808926789, 1280531041, 1752135293, 2223739545, 2695343797, 3166948049, 3638552301, 4110090761, 269950501, 741554753, 1213159005, 1684763257];
function time(){return (new Date).getTime()}
x = function(e) {
        return null != e && e === e.window
    }
m = function(e) {
        return "function" == typeof e && "number" != typeof e.nodeType && "function" != typeof e.item
    }
function w(e) {
        return null == e ? e + "" : "object" == typeof e || "function" == typeof e ? "string" || "object" : typeof e
    }
function p(e) {
        var t = !!e && "length"in e && e.length
          , n = w(e);
        return !m(e) && !x(e) && ("array" === n || 0 === t || "number" == typeof t && 0 < t && t - 1 in e)
    }
//坐标转化
function each(e, t) {
            var n, r = 0;
            if (p(e)) {
                for (n = e.length; r < n; r++)
                    if (!1 === t.call(e[r], r, e[r]))
                        break
            } else
                for (r in e)
                    if (!1 === t.call(e[r], r, e[r]))
                        break;
            return e
        }
function pointTransfrom(b) {
                var c={
                "img_width": "400px",
                "img_height": "200px",
                "bar_width": "310px",
                "bar_height": "50px"
            }
            var d = new Array;
            return each(b, function(a, b) {
                var e = Math.round(310 * b.x / parseInt(c.img_width))
                  , f = Math.round(155 * b.y / parseInt(c.img_height));
                d[a] = {
                    x: e,
                    y: f
                }
            }),
            d
        }
        var A=[
    462357,
    472066609,
    943670861,
    1415275113,
    1886879365,
    2358483617,
    2830087869,
    3301692121,
    3773296373,
    4228057617,
    404694573,
    876298825,
    1347903077,
    1819507329,
    2291111581,
    2762715833,
    3234320085,
    3705924337,
    4177462797,
    337322537,
    808926789,
    1280531041,
    1752135293,
    2223739545,
    2695343797,
    3166948049,
    3638552301,
    4110090761,
    269950501,
    741554753,
    1213159005,
    1684763257
]
function c(r) {
            return (255 & w[r >>> 24 & 255]) << 24 | (255 & w[r >>> 16 & 255]) << 16 | (255 & w[r >>> 8 & 255]) << 8 | 255 & w[255 & r]
        }
        function i(r) {
            for (var n = [], t = 0, e = r.length; t < e; t++) {
                var o = r.charCodeAt(t);
                o <= 127 ? n.push(o) : o <= 2047 ? (n.push(192 | o >>> 6),
                n.push(128 | 63 & o)) : (n.push(224 | o >>> 12),
                n.push(128 | o >>> 6 & 63),
                n.push(128 | 63 & o))
            }
            return n
        }
        function o(r) {
            for (var n = [], t = 0, e = r.length; t < e; t += 2)
                n.push(parseInt(r.substr(t, 2), 16));
            return n
        }
        function a(r, n) {
            return r << n | r >>> 32 - n
        }
        function c(r) {
            return (255 & w[r >>> 24 & 255]) << 24 | (255 & w[r >>> 16 & 255]) << 16 | (255 & w[r >>> 8 & 255]) << 8 | 255 & w[255 & r]
        }
        function s(r) {
            return r ^ a(r, 2) ^ a(r, 10) ^ a(r, 18) ^ a(r, 24)
        }
        function p(r) {
            return r ^ a(r, 13) ^ a(r, 23)
        }
        function v(r, n, t) {
            for (var e = new Array(4), o = new Array(4), u = 0; u < 4; u++)
                o[0] = 255 & r[0 + 4 * u],
                o[1] = 255 & r[1 + 4 * u],
                o[2] = 255 & r[2 + 4 * u],
                o[3] = 255 & r[3 + 4 * u],
                e[u] = o[0] << 24 | o[1] << 16 | o[2] << 8 | o[3];
            e[0] ^= 2746333894,
            e[1] ^= 1453994832,
            e[2] ^= 1736282519,
            e[3] ^= 2993693404;
            for (var i, f = 0; f < 32; f += 4)
                i = e[1] ^ e[2] ^ e[3] ^ A[f + 0],
                n[f + 0] = e[0] ^= p(c(i)),
                i = e[2] ^ e[3] ^ e[0] ^ A[f + 1],
                n[f + 1] = e[1] ^= p(c(i)),
                i = e[3] ^ e[0] ^ e[1] ^ A[f + 2],
                n[f + 2] = e[2] ^= p(c(i)),
                i = e[0] ^ e[1] ^ e[2] ^ A[f + 3],
                n[f + 3] = e[3] ^= p(c(i));
            if (t === 0)
                for (var a, s = 0; s < 16; s++)
                    a = n[s],
                    n[s] = n[31 - s],
                    n[31 - s] = a
        }
        function h(r, n, t) {
            for (var e = new Array(4), o = new Array(4), u = 0; u < 4; u++)
                o[0] = 255 & r[0 + 4 * u],
                o[1] = 255 & r[1 + 4 * u],
                o[2] = 255 & r[2 + 4 * u],
                o[3] = 255 & r[3 + 4 * u],
                e[u] = o[0] << 24 | o[1] << 16 | o[2] << 8 | o[3];
            for (var i, f = 0; f < 32; f += 4)
                i = e[1] ^ e[2] ^ e[3] ^ t[f + 0],
                e[0] ^= s(c(i)),
                i = e[2] ^ e[3] ^ e[0] ^ t[f + 1],
                e[1] ^= s(c(i)),
                i = e[3] ^ e[0] ^ e[1] ^ t[f + 2],
                e[2] ^= s(c(i)),
                i = e[0] ^ e[1] ^ e[2] ^ t[f + 3],
                e[3] ^= s(c(i));
            for (var a = 0; a < 16; a += 4)
                n[a] = e[3 - a / 4] >>> 24 & 255,
                n[a + 1] = e[3 - a / 4] >>> 16 & 255,
                n[a + 2] = e[3 - a / 4] >>> 8 & 255,
                n[a + 3] = 255 & e[3 - a / 4]
        }
        function u(r) {
            var temp = "";
            each(r, function(i, p) {
                temp = temp + (p = p.toString(16),
                1 === p.length ? "0" + p : p);
            });
            return temp;
        }
        function l(r, n, t) {
            var a = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {}
              , c = a.padding
              , s = void 0 === c ? "pkcs#5" : c
              , p = (a.mode,
            a.output)
              , l = void 0 === p ? "string" : p;
            if ("string" == typeof n && (n = o(n)),
            16 !== n.length)
                throw new Error("key is invalid");
            if (r = "string" == typeof r ? t !== g ? i(r) : o(r) : [].concat(e(r)),
            "pkcs#5" === s && t !== g)
                for (var w = d - r.length % d, A = 0; A < w; A++)
                    r.push(w);
            var m = new Array(y);
            v(n, m, t);
            for (var C = [], x = r.length, b = 0; x >= d; ) {
                var j = r.slice(b, b + 16)
                  , k = new Array(16);
                h(j, k, m);
                for (var S = 0; S < d; S++)
                    C[b + S] = k[S];
                x -= d,
                b += d
            }
            if ("pkcs#5" === s && t === g) {
                var O = C[C.length - 1];
                C.splice(C.length - O, O)
            }
            return "array" !== l ? t !== g ? u(C) : f(C) : C
        }
 function encrypt(r, n, t) {
                var r = JSON.stringify(r)
                return l(r, n, 1, t)
            }function encrypt1(r, n, t) {
                // var r = JSON.stringify(r)
                return l(r, n, 1, t)
            }
            function zhuan(a,b){
                return a+"---"+JSON.stringify(b)
            }
console.log(encrypt1(zhuan("2ac518ff4d5b49f5a41b6d875c83787b",[
    {
        "x": 46,
        "y": 31
    },
    {
        "x": 214,
        "y": 62
    },
    {
        "x": 112,
        "y": 55
    }
]),"a1f52537c6b7bd214ba8bad47ed32007"))