
(function(b) {
    function a(f) {
        var j = function(m, o, n) {
            if (typeof m === "undefined") {
                m = j.DEFAULT_CAPACITY
            }
            if (typeof o === "undefined") {
                o = j.DEFAULT_ENDIAN
            }
            if (typeof n === "undefined") {
                n = j.DEFAULT_NOASSERT
            }
            if (!n) {
                m = m | 0;
                if (m < 0) {
                    throw RangeError("Illegal capacity")
                }
                o = !! o;
                n = !! n
            }
            this.buffer = m === 0 ? l : new ArrayBuffer(m);
            this.view = m === 0 ? null : new DataView(this.buffer);
            this.offset = 0;
            this.markedOffset = -1;
            this.limit = m;
            this.littleEndian = typeof o !== "undefined" ? !! o : false;
            this.noAssert = !! n
        };
        j.VERSION = "3.5.5";
        j.LITTLE_ENDIAN = true;
        j.BIG_ENDIAN = false;
        j.DEFAULT_CAPACITY = 16;
        j.DEFAULT_ENDIAN = j.BIG_ENDIAN;
        j.DEFAULT_NOASSERT = false;
        j.Long = f || null;
        var g = j.prototype;
        var l = new ArrayBuffer(0);
        var h = String.fromCharCode;

        function c(n) {
            var m = 0;
            return function() {
                return m < n.length ? n.charCodeAt(m++) : null
            }
        }
        function d() {
            var m = [],
                n = [];
            return function() {
                if (arguments.length === 0) {
                    return n.join("") + h.apply(String, m)
                }
                if (m.length + arguments.length > 1024) {
                    n.push(h.apply(String, m)), m.length = 0
                }
                Array.prototype.push.apply(m, arguments)
            }
        }
        j.allocate = function(m, o, n) {
            return new j(m, o, n)
        };
        j.concat = function(w, o, n, v) {
            if (typeof o === "boolean" || typeof o !== "string") {
                v = n;
                n = o;
                o = undefined
            }
            var m = 0;
            for (var s = 0, r = w.length, p; s < r; ++s) {
                if (!j.isByteBuffer(w[s])) {
                    w[s] = j.wrap(w[s], o)
                }
                p = w[s].limit - w[s].offset;
                if (p > 0) {
                    m += p
                }
            }
            if (m === 0) {
                return new j(0, n, v)
            }
            var t = new j(m, n, v),
                q;
            var u = new Uint8Array(t.buffer);
            s = 0;
            while (s < r) {
                q = w[s++];
                p = q.limit - q.offset;
                if (p <= 0) {
                    continue
                }
                u.set(new Uint8Array(q.buffer).subarray(q.offset, q.limit), t.offset);
                t.offset += p
            }
            t.limit = t.offset;
            t.offset = 0;
            return t
        };
        j.isByteBuffer = function(m) {
            return (m && m instanceof j) === true
        };
        j.type = function() {
            return ArrayBuffer
        };
        j.wrap = function(m, n, p, o) {
            if (typeof n !== "string") {
                o = p;
                p = n;
                n = undefined
            }
            if (typeof m === "string") {
                if (typeof n === "undefined") {
                    n = "utf8"
                }
                switch (n) {
                    case "base64":
                        return j.fromBase64(m, p);
                    case "hex":
                        return j.fromHex(m, p);
                    case "binary":
                        return j.fromBinary(m, p);
                    case "utf8":
                        return j.fromUTF8(m, p);
                    case "debug":
                        return j.fromDebug(m, p);
                    default:
                        throw Error("Unsupported encoding: " + n)
                }
            }
            if (m === null || typeof m !== "object") {
                throw TypeError("Illegal buffer")
            }
            var q;
            if (j.isByteBuffer(m)) {
                q = g.clone.call(m);
                q.markedOffset = -1;
                return q
            }
            if (m instanceof Uint8Array) {
                q = new j(0, p, o);
                if (m.length > 0) {
                    q.buffer = m.buffer;
                    q.offset = m.byteOffset;
                    q.limit = m.byteOffset + m.length;
                    q.view = m.length > 0 ? new DataView(m.buffer) : null
                }
            } else {
                if (m instanceof ArrayBuffer) {
                    q = new j(0, p, o);
                    if (m.byteLength > 0) {
                        q.buffer = m;
                        q.offset = 0;
                        q.limit = m.byteLength;
                        q.view = m.byteLength > 0 ? new DataView(m) : null
                    }
                } else {
                    if (Object.prototype.toString.call(m) === "[object Array]") {
                        q = new j(m.length, p, o);
                        q.limit = m.length;
                        for (i = 0; i < m.length; ++i) {
                            q.view.setUint8(i, m[i])
                        }
                    } else {
                        throw TypeError("Illegal buffer")
                    }
                }
            }
            return q
        };
        g.writeInt8 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o |= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 1;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 1;
            this.view.setInt8(p, o);
            if (n) {
                this.offset += 1
            }
            return this
        };
        g.writeByte = g.writeInt8;
        g.readInt8 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 1 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 1 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getInt8(o);
            if (n) {
                this.offset += 1
            }
            return m
        };
        g.readByte = g.readInt8;
        g.writeUint8 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 1;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 1;
            this.view.setUint8(p, o);
            if (n) {
                this.offset += 1
            }
            return this
        };
        g.readUint8 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 1 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 1 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getUint8(o);
            if (n) {
                this.offset += 1
            }
            return m
        };
        g.writeInt16 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o |= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 2;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 2;
            this.view.setInt16(p, o, this.littleEndian);
            if (n) {
                this.offset += 2
            }
            return this
        };
        g.writeShort = g.writeInt16;
        g.readInt16 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 2 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 2 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getInt16(o, this.littleEndian);
            if (n) {
                this.offset += 2
            }
            return m
        };
        g.readShort = g.readInt16;
        g.writeUint16 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 2;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 2;
            this.view.setUint16(p, o, this.littleEndian);
            if (n) {
                this.offset += 2
            }
            return this
        };
        g.readUint16 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 2 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 2 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getUint16(o, this.littleEndian);
            if (n) {
                this.offset += 2
            }
            return m
        };
        g.writeInt32 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o |= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 4;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 4;
            this.view.setInt32(p, o, this.littleEndian);
            if (n) {
                this.offset += 4
            }
            return this
        };
        g.writeInt = g.writeInt32;
        g.readInt32 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 4 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 4 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getInt32(o, this.littleEndian);
            if (n) {
                this.offset += 4
            }
            return m
        };
        g.readInt = g.readInt32;
        g.writeUint32 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal value: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 4;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 4;
            this.view.setUint32(p, o, this.littleEndian);
            if (n) {
                this.offset += 4
            }
            return this
        };
        g.readUint32 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 4 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 4 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getUint32(o, this.littleEndian);
            if (n) {
                this.offset += 4
            }
            return m
        };
        if (f) {
            g.writeInt64 = function(n, o) {
                var m = typeof o === "undefined";
                if (m) {
                    o = this.offset
                }
                if (!this.noAssert) {
                    if (typeof n === "number") {
                        n = f.fromNumber(n)
                    } else {
                        if (typeof n === "string") {
                            n = f.fromString(n)
                        } else {
                            if (!(n && n instanceof f)) {
                                throw TypeError("Illegal value: " + n + " (not an integer or Long)")
                            }
                        }
                    }
                    if (typeof o !== "number" || o % 1 !== 0) {
                        throw TypeError("Illegal offset: " + o + " (not an integer)")
                    }
                    o >>>= 0;
                    if (o < 0 || o + 0 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + o + " (+" + 0 + ") <= " + this.buffer.byteLength)
                    }
                }
                if (typeof n === "number") {
                    n = f.fromNumber(n)
                } else {
                    if (typeof n === "string") {
                        n = f.fromString(n)
                    }
                }
                o += 8;
                var p = this.buffer.byteLength;
                if (o > p) {
                    this.resize((p *= 2) > o ? p : o)
                }
                o -= 8;
                if (this.littleEndian) {
                    this.view.setInt32(o, n.low, true);
                    this.view.setInt32(o + 4, n.high, true)
                } else {
                    this.view.setInt32(o, n.high, false);
                    this.view.setInt32(o + 4, n.low, false)
                }
                if (m) {
                    this.offset += 8
                }
                return this
            };
            g.writeLong = g.writeInt64;
            g.readInt64 = function(o) {
                var n = typeof o === "undefined";
                if (n) {
                    o = this.offset
                }
                if (!this.noAssert) {
                    if (typeof o !== "number" || o % 1 !== 0) {
                        throw TypeError("Illegal offset: " + o + " (not an integer)")
                    }
                    o >>>= 0;
                    if (o < 0 || o + 8 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + o + " (+" + 8 + ") <= " + this.buffer.byteLength)
                    }
                }
                var m = this.littleEndian ? new f(this.view.getInt32(o, true), this.view.getInt32(o + 4, true), false) : new f(this.view.getInt32(o + 4, false), this.view.getInt32(o, false), false);
                if (n) {
                    this.offset += 8
                }
                return m
            };
            g.readLong = g.readInt64;
            g.writeUint64 = function(n, p) {
                var m = typeof p === "undefined";
                if (m) {
                    p = this.offset
                }
                if (!this.noAssert) {
                    if (typeof n === "number") {
                        n = f.fromNumber(n)
                    } else {
                        if (typeof n === "string") {
                            n = f.fromString(n)
                        } else {
                            if (!(n && n instanceof f)) {
                                throw TypeError("Illegal value: " + n + " (not an integer or Long)")
                            }
                        }
                    }
                    if (typeof p !== "number" || p % 1 !== 0) {
                        throw TypeError("Illegal offset: " + p + " (not an integer)")
                    }
                    p >>>= 0;
                    if (p < 0 || p + 0 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                    }
                }
                if (typeof n === "number") {
                    n = f.fromNumber(n)
                } else {
                    if (typeof n === "string") {
                        n = f.fromString(n)
                    }
                }
                p += 8;
                var o = this.buffer.byteLength;
                if (p > o) {
                    this.resize((o *= 2) > p ? o : p)
                }
                p -= 8;
                if (this.littleEndian) {
                    this.view.setInt32(p, n.low, true);
                    this.view.setInt32(p + 4, n.high, true)
                } else {
                    this.view.setInt32(p, n.high, false);
                    this.view.setInt32(p + 4, n.low, false)
                }
                if (m) {
                    this.offset += 8
                }
                return this
            };
            g.readUint64 = function(o) {
                var n = typeof o === "undefined";
                if (n) {
                    o = this.offset
                }
                if (!this.noAssert) {
                    if (typeof o !== "number" || o % 1 !== 0) {
                        throw TypeError("Illegal offset: " + o + " (not an integer)")
                    }
                    o >>>= 0;
                    if (o < 0 || o + 8 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + o + " (+" + 8 + ") <= " + this.buffer.byteLength)
                    }
                }
                var m = this.littleEndian ? new f(this.view.getInt32(o, true), this.view.getInt32(o + 4, true), true) : new f(this.view.getInt32(o + 4, false), this.view.getInt32(o, false), true);
                if (n) {
                    this.offset += 8
                }
                return m
            }
        }
        g.writeFloat32 = function(n, p) {
            var m = typeof p === "undefined";
            if (m) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof n !== "number") {
                    throw TypeError("Illegal value: " + n + " (not a number)")
                }
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 4;
            var o = this.buffer.byteLength;
            if (p > o) {
                this.resize((o *= 2) > p ? o : p)
            }
            p -= 4;
            this.view.setFloat32(p, n, this.littleEndian);
            if (m) {
                this.offset += 4
            }
            return this
        };
        g.writeFloat = g.writeFloat32;
        g.readFloat32 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 4 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 4 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getFloat32(o, this.littleEndian);
            if (n) {
                this.offset += 4
            }
            return m
        };
        g.readFloat = g.readFloat32;
        g.writeFloat64 = function(o, p) {
            var n = typeof p === "undefined";
            if (n) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number") {
                    throw TypeError("Illegal value: " + o + " (not a number)")
                }
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            p += 8;
            var m = this.buffer.byteLength;
            if (p > m) {
                this.resize((m *= 2) > p ? m : p)
            }
            p -= 8;
            this.view.setFloat64(p, o, this.littleEndian);
            if (n) {
                this.offset += 8
            }
            return this
        };
        g.writeDouble = g.writeFloat64;
        g.readFloat64 = function(o) {
            var n = typeof o === "undefined";
            if (n) {
                o = this.offset
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal offset: " + o + " (not an integer)")
                }
                o >>>= 0;
                if (o < 0 || o + 8 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + o + " (+" + 8 + ") <= " + this.buffer.byteLength)
                }
            }
            var m = this.view.getFloat64(o, this.littleEndian);
            if (n) {
                this.offset += 8
            }
            return m
        };
        g.readDouble = g.readFloat64;
        j.MAX_VARINT32_BYTES = 5;
        j.calculateVarint32 = function(m) {
            m = m >>> 0;
            if (m < 1 << 7) {
                return 1
            } else {
                if (m < 1 << 14) {
                    return 2
                } else {
                    if (m < 1 << 21) {
                        return 3
                    } else {
                        if (m < 1 << 28) {
                            return 4
                        } else {
                            return 5
                        }
                    }
                }
            }
        };
        j.zigZagEncode32 = function(m) {
            return (((m |= 0) << 1) ^ (m >> 31)) >>> 0
        };
        j.zigZagDecode32 = function(m) {
            return ((m >>> 1) ^ -(m & 1)) | 0
        };
        g.writeVarint32 = function(q, r) {
            var p = typeof r === "undefined";
            if (p) {
                r = this.offset
            }
            if (!this.noAssert) {
                if (typeof q !== "number" || q % 1 !== 0) {
                    throw TypeError("Illegal value: " + q + " (not an integer)")
                }
                q |= 0;
                if (typeof r !== "number" || r % 1 !== 0) {
                    throw TypeError("Illegal offset: " + r + " (not an integer)")
                }
                r >>>= 0;
                if (r < 0 || r + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + r + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            var n = j.calculateVarint32(q),
                m;
            r += n;
            var o = this.buffer.byteLength;
            if (r > o) {
                this.resize((o *= 2) > r ? o : r)
            }
            r -= n;
            this.view.setUint8(r, m = q | 128);
            q >>>= 0;
            if (q >= 1 << 7) {
                m = (q >> 7) | 128;
                this.view.setUint8(r + 1, m);
                if (q >= 1 << 14) {
                    m = (q >> 14) | 128;
                    this.view.setUint8(r + 2, m);
                    if (q >= 1 << 21) {
                        m = (q >> 21) | 128;
                        this.view.setUint8(r + 3, m);
                        if (q >= 1 << 28) {
                            this.view.setUint8(r + 4, (q >> 28) & 15);
                            n = 5
                        } else {
                            this.view.setUint8(r + 3, m & 127);
                            n = 4
                        }
                    } else {
                        this.view.setUint8(r + 2, m & 127);
                        n = 3
                    }
                } else {
                    this.view.setUint8(r + 1, m & 127);
                    n = 2
                }
            } else {
                this.view.setUint8(r, m & 127);
                n = 1
            }
            if (p) {
                this.offset += n;
                return this
            }
            return n
        };
        g.writeVarint32ZigZag = function(m, n) {
            return this.writeVarint32(j.zigZagEncode32(m), n)
        };
        g.readVarint32 = function(s) {
            var q = typeof s === "undefined";
            if (q) {
                s = this.offset
            }
            if (!this.noAssert) {
                if (typeof s !== "number" || s % 1 !== 0) {
                    throw TypeError("Illegal offset: " + s + " (not an integer)")
                }
                s >>>= 0;
                if (s < 0 || s + 1 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + s + " (+" + 1 + ") <= " + this.buffer.byteLength)
                }
            }
            var n = 0,
                p = 0 >>> 0,
                m, r;
            do {
                r = s + n;
                if (!this.noAssert && r > this.limit) {
                    var o = Error("Truncated");
                    o.truncated = true;
                    throw o
                }
                m = this.view.getUint8(r);
                if (n < 5) {
                    p |= ((m & 127) << (7 * n)) >>> 0
                }++n
            } while ((m & 128) === 128);
            p = p | 0;
            if (q) {
                this.offset += n;
                return p
            }
            return {
                value: p,
                length: n
            }
        };
        g.readVarint32ZigZag = function(n) {
            var m = this.readVarint32(n);
            if (typeof m === "object") {
                m.value = j.zigZagDecode32(m.value)
            } else {
                m = j.zigZagDecode32(m)
            }
            return m
        };
        if (f) {
            j.MAX_VARINT64_BYTES = 10;
            j.calculateVarint64 = function(n) {
                if (typeof n === "number") {
                    n = f.fromNumber(n)
                } else {
                    if (typeof n === "string") {
                        n = f.fromString(n)
                    }
                }
                var p = n.toInt() >>> 0,
                    o = n.shiftRightUnsigned(28).toInt() >>> 0,
                    m = n.shiftRightUnsigned(56).toInt() >>> 0;
                if (m == 0) {
                    if (o == 0) {
                        if (p < 1 << 14) {
                            return p < 1 << 7 ? 1 : 2
                        } else {
                            return p < 1 << 21 ? 3 : 4
                        }
                    } else {
                        if (o < 1 << 14) {
                            return o < 1 << 7 ? 5 : 6
                        } else {
                            return o < 1 << 21 ? 7 : 8
                        }
                    }
                } else {
                    return m < 1 << 7 ? 9 : 10
                }
            };
            j.zigZagEncode64 = function(m) {
                if (typeof m === "number") {
                    m = f.fromNumber(m, false)
                } else {
                    if (typeof m === "string") {
                        m = f.fromString(m, false)
                    } else {
                        if (m.unsigned !== false) {
                            m = m.toSigned()
                        }
                    }
                }
                return m.shiftLeft(1).xor(m.shiftRight(63)).toUnsigned()
            };
            j.zigZagDecode64 = function(m) {
                if (typeof m === "number") {
                    m = f.fromNumber(m, false)
                } else {
                    if (typeof m === "string") {
                        m = f.fromString(m, false)
                    } else {
                        if (m.unsigned !== false) {
                            m = m.toSigned()
                        }
                    }
                }
                return m.shiftRightUnsigned(1).xor(m.and(f.ONE).toSigned().negate()).toSigned()
            };
            g.writeVarint64 = function(q, t) {
                var p = typeof t === "undefined";
                if (p) {
                    t = this.offset
                }
                if (!this.noAssert) {
                    if (typeof q === "number") {
                        q = f.fromNumber(q)
                    } else {
                        if (typeof q === "string") {
                            q = f.fromString(q)
                        } else {
                            if (!(q && q instanceof f)) {
                                throw TypeError("Illegal value: " + q + " (not an integer or Long)")
                            }
                        }
                    }
                    if (typeof t !== "number" || t % 1 !== 0) {
                        throw TypeError("Illegal offset: " + t + " (not an integer)")
                    }
                    t >>>= 0;
                    if (t < 0 || t + 0 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + t + " (+" + 0 + ") <= " + this.buffer.byteLength)
                    }
                }
                if (typeof q === "number") {
                    q = f.fromNumber(q, false)
                } else {
                    if (typeof q === "string") {
                        q = f.fromString(q, false)
                    } else {
                        if (q.unsigned !== false) {
                            q = q.toSigned()
                        }
                    }
                }
                var m = j.calculateVarint64(q),
                    s = q.toInt() >>> 0,
                    r = q.shiftRightUnsigned(28).toInt() >>> 0,
                    o = q.shiftRightUnsigned(56).toInt() >>> 0;
                t += m;
                var n = this.buffer.byteLength;
                if (t > n) {
                    this.resize((n *= 2) > t ? n : t)
                }
                t -= m;
                switch (m) {
                    case 10:
                        this.view.setUint8(t + 9, (o >>> 7) & 1);
                    case 9:
                        this.view.setUint8(t + 8, m !== 9 ? (o) | 128 : (o) & 127);
                    case 8:
                        this.view.setUint8(t + 7, m !== 8 ? (r >>> 21) | 128 : (r >>> 21) & 127);
                    case 7:
                        this.view.setUint8(t + 6, m !== 7 ? (r >>> 14) | 128 : (r >>> 14) & 127);
                    case 6:
                        this.view.setUint8(t + 5, m !== 6 ? (r >>> 7) | 128 : (r >>> 7) & 127);
                    case 5:
                        this.view.setUint8(t + 4, m !== 5 ? (r) | 128 : (r) & 127);
                    case 4:
                        this.view.setUint8(t + 3, m !== 4 ? (s >>> 21) | 128 : (s >>> 21) & 127);
                    case 3:
                        this.view.setUint8(t + 2, m !== 3 ? (s >>> 14) | 128 : (s >>> 14) & 127);
                    case 2:
                        this.view.setUint8(t + 1, m !== 2 ? (s >>> 7) | 128 : (s >>> 7) & 127);
                    case 1:
                        this.view.setUint8(t, m !== 1 ? (s) | 128 : (s) & 127)
                }
                if (p) {
                    this.offset += m;
                    return this
                } else {
                    return m
                }
            };
            g.writeVarint64ZigZag = function(m, n) {
                return this.writeVarint64(j.zigZagEncode64(m), n)
            };
            g.readVarint64 = function(s) {
                var p = typeof s === "undefined";
                if (p) {
                    s = this.offset
                }
                if (!this.noAssert) {
                    if (typeof s !== "number" || s % 1 !== 0) {
                        throw TypeError("Illegal offset: " + s + " (not an integer)")
                    }
                    s >>>= 0;
                    if (s < 0 || s + 1 > this.buffer.byteLength) {
                        throw RangeError("Illegal offset: 0 <= " + s + " (+" + 1 + ") <= " + this.buffer.byteLength)
                    }
                }
                var t = s,
                    r = 0,
                    q = 0,
                    o = 0,
                    m = 0;
                m = this.view.getUint8(s++);
                r = (m & 127);
                if (m & 128) {
                    m = this.view.getUint8(s++);
                    r |= (m & 127) << 7;
                    if (m & 128) {
                        m = this.view.getUint8(s++);
                        r |= (m & 127) << 14;
                        if (m & 128) {
                            m = this.view.getUint8(s++);
                            r |= (m & 127) << 21;
                            if (m & 128) {
                                m = this.view.getUint8(s++);
                                q = (m & 127);
                                if (m & 128) {
                                    m = this.view.getUint8(s++);
                                    q |= (m & 127) << 7;
                                    if (m & 128) {
                                        m = this.view.getUint8(s++);
                                        q |= (m & 127) << 14;
                                        if (m & 128) {
                                            m = this.view.getUint8(s++);
                                            q |= (m & 127) << 21;
                                            if (m & 128) {
                                                m = this.view.getUint8(s++);
                                                o = (m & 127);
                                                if (m & 128) {
                                                    m = this.view.getUint8(s++);
                                                    o |= (m & 127) << 7;
                                                    if (m & 128) {
                                                        throw Error("Buffer overrun")
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                var n = f.fromBits(r | (q << 28), (q >>> 4) | (o) << 24, false);
                if (p) {
                    this.offset = s;
                    return n
                } else {
                    return {
                        value: n,
                        length: s - t
                    }
                }
            };
            g.readVarint64ZigZag = function(n) {
                var m = this.readVarint64(n);
                if (m && m.value instanceof f) {
                    m.value = j.zigZagDecode64(m.value)
                } else {
                    m = j.zigZagDecode64(m)
                }
                return m
            }
        }
        g.writeCString = function(r, q) {
            var p = typeof q === "undefined";
            if (p) {
                q = this.offset
            }
            var n, m = r.length;
            if (!this.noAssert) {
                if (typeof r !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
                for (n = 0; n < m; ++n) {
                    if (r.charCodeAt(n) === 0) {
                        throw RangeError("Illegal str: Contains NULL-characters")
                    }
                }
                if (typeof q !== "number" || q % 1 !== 0) {
                    throw TypeError("Illegal offset: " + q + " (not an integer)")
                }
                q >>>= 0;
                if (q < 0 || q + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + q + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            m = k.calculateUTF16asUTF8(c(r))[1];
            q += m + 1;
            var o = this.buffer.byteLength;
            if (q > o) {
                this.resize((o *= 2) > q ? o : q)
            }
            q -= m + 1;
            k.encodeUTF16toUTF8(c(r), function(s) {
                this.view.setUint8(q++, s)
            }.bind(this));
            this.view.setUint8(q++, 0);
            if (p) {
                this.offset = q;
                return this
            }
            return m
        };
        g.readCString = function(q) {
            var o = typeof q === "undefined";
            if (o) {
                q = this.offset
            }
            if (!this.noAssert) {
                if (typeof q !== "number" || q % 1 !== 0) {
                    throw TypeError("Illegal offset: " + q + " (not an integer)")
                }
                q >>>= 0;
                if (q < 0 || q + 1 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + q + " (+" + 1 + ") <= " + this.buffer.byteLength)
                }
            }
            var r = q,
                n;
            var p, m = -1;
            k.decodeUTF8toUTF16(function() {
                if (m === 0) {
                    return null
                }
                if (q >= this.limit) {
                    throw RangeError("Illegal range: Truncated data, " + q + " < " + this.limit)
                }
                return (m = this.view.getUint8(q++)) === 0 ? null : m
            }.bind(this), p = d(), true);
            if (o) {
                this.offset = q;
                return p()
            } else {
                return {
                    string: p(),
                    length: q - r
                }
            }
        };
        g.writeIString = function(q, p) {
            var o = typeof p === "undefined";
            if (o) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof q !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            var r = p,
                m;
            m = k.calculateUTF16asUTF8(c(q), this.noAssert)[1];
            p += 4 + m;
            var n = this.buffer.byteLength;
            if (p > n) {
                this.resize((n *= 2) > p ? n : p)
            }
            p -= 4 + m;
            this.view.setUint32(p, m, this.littleEndian);
            p += 4;
            k.encodeUTF16toUTF8(c(q), function(s) {
                this.view.setUint8(p++, s)
            }.bind(this));
            if (p !== r + 4 + m) {
                throw RangeError("Illegal range: Truncated data, " + p + " == " + (p + 4 + m))
            }
            if (o) {
                this.offset = p;
                return this
            }
            return p - r
        };
        g.readIString = function(r) {
            var o = typeof r === "undefined";
            if (o) {
                r = this.offset
            }
            if (!this.noAssert) {
                if (typeof r !== "number" || r % 1 !== 0) {
                    throw TypeError("Illegal offset: " + r + " (not an integer)")
                }
                r >>>= 0;
                if (r < 0 || r + 4 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + r + " (+" + 4 + ") <= " + this.buffer.byteLength)
                }
            }
            var n = 0,
                s = r,
                q;
            n = this.view.getUint32(r, this.littleEndian);
            r += 4;
            var m = r + n,
                p;
            k.decodeUTF8toUTF16(function() {
                return r < m ? this.view.getUint8(r++) : null
            }.bind(this), p = d(), this.noAssert);
            q = p();
            if (o) {
                this.offset = r;
                return q
            } else {
                return {
                    string: q,
                    length: r - s
                }
            }
        };
        j.METRICS_CHARS = "c";
        j.METRICS_BYTES = "b";
        g.writeUTF8String = function(q, p) {
            var o = typeof p === "undefined";
            if (o) {
                p = this.offset
            }
            if (!this.noAssert) {
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal offset: " + p + " (not an integer)")
                }
                p >>>= 0;
                if (p < 0 || p + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + p + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            var m;
            var r = p;
            m = k.calculateUTF16asUTF8(c(q))[1];
            p += m;
            var n = this.buffer.byteLength;
            if (p > n) {
                this.resize((n *= 2) > p ? n : p)
            }
            p -= m;
            k.encodeUTF16toUTF8(c(q), function(s) {
                this.view.setUint8(p++, s)
            }.bind(this));
            if (o) {
                this.offset = p;
                return this
            }
            return p - r
        };
        g.writeString = g.writeUTF8String;
        j.calculateUTF8Chars = function(m) {
            return k.calculateUTF16asUTF8(c(m))[0]
        };
        j.calculateUTF8Bytes = function(m) {
            return k.calculateUTF16asUTF8(c(m))[1]
        };
        g.readUTF8String = function(p, o, s) {
            if (typeof o === "number") {
                s = o;
                o = undefined
            }
            var q = typeof s === "undefined";
            if (q) {
                s = this.offset
            }
            if (typeof o === "undefined") {
                o = j.METRICS_CHARS
            }
            if (!this.noAssert) {
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal length: " + p + " (not an integer)")
                }
                p |= 0;
                if (typeof s !== "number" || s % 1 !== 0) {
                    throw TypeError("Illegal offset: " + s + " (not an integer)")
                }
                s >>>= 0;
                if (s < 0 || s + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + s + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            var n = 0,
                t = s,
                r;
            if (o === j.METRICS_CHARS) {
                r = d();
                k.decodeUTF8(function() {
                    return n < p && s < this.limit ? this.view.getUint8(s++) : null
                }.bind(this), function(u) {
                    ++n;
                    k.UTF8toUTF16(u, r)
                }.bind(this));
                if (n !== p) {
                    throw RangeError("Illegal range: Truncated data, " + n + " == " + p)
                }
                if (q) {
                    this.offset = s;
                    return r()
                } else {
                    return {
                        string: r(),
                        length: s - t
                    }
                }
            } else {
                if (o === j.METRICS_BYTES) {
                    if (!this.noAssert) {
                        if (typeof s !== "number" || s % 1 !== 0) {
                            throw TypeError("Illegal offset: " + s + " (not an integer)")
                        }
                        s >>>= 0;
                        if (s < 0 || s + p > this.buffer.byteLength) {
                            throw RangeError("Illegal offset: 0 <= " + s + " (+" + p + ") <= " + this.buffer.byteLength)
                        }
                    }
                    var m = s + p;
                    k.decodeUTF8toUTF16(function() {
                        return s < m ? this.view.getUint8(s++) : null
                    }.bind(this), r = d(), this.noAssert);
                    if (s !== m) {
                        throw RangeError("Illegal range: Truncated data, " + s + " == " + m)
                    }
                    if (q) {
                        this.offset = s;
                        return r()
                    } else {
                        return {
                            string: r(),
                            length: s - t
                        }
                    }
                } else {
                    throw TypeError("Unsupported metrics: " + o)
                }
            }
        };
        g.readString = g.readUTF8String;
        g.writeVString = function(r, q) {
            var p = typeof q === "undefined";
            if (p) {
                q = this.offset
            }
            if (!this.noAssert) {
                if (typeof r !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
                if (typeof q !== "number" || q % 1 !== 0) {
                    throw TypeError("Illegal offset: " + q + " (not an integer)")
                }
                q >>>= 0;
                if (q < 0 || q + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + q + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            var s = q,
                o, m;
            o = k.calculateUTF16asUTF8(c(r), this.noAssert)[1];
            m = j.calculateVarint32(o);
            q += m + o;
            var n = this.buffer.byteLength;
            if (q > n) {
                this.resize((n *= 2) > q ? n : q)
            }
            q -= m + o;
            q += this.writeVarint32(o, q);
            k.encodeUTF16toUTF8(c(r), function(t) {
                this.view.setUint8(q++, t)
            }.bind(this));
            if (q !== s + o + m) {
                throw RangeError("Illegal range: Truncated data, " + q + " == " + (q + o + m))
            }
            if (p) {
                this.offset = q;
                return this
            }
            return q - s
        };
        g.readVString = function(r) {
            var o = typeof r === "undefined";
            if (o) {
                r = this.offset
            }
            if (!this.noAssert) {
                if (typeof r !== "number" || r % 1 !== 0) {
                    throw TypeError("Illegal offset: " + r + " (not an integer)")
                }
                r >>>= 0;
                if (r < 0 || r + 1 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + r + " (+" + 1 + ") <= " + this.buffer.byteLength)
                }
            }
            var n = this.readVarint32(r),
                s = r,
                q;
            r += n.length;
            n = n.value;
            var m = r + n,
                p = d();
            k.decodeUTF8toUTF16(function() {
                return r < m ? this.view.getUint8(r++) : null
            }.bind(this), p, this.noAssert);
            q = p();
            if (o) {
                this.offset = r;
                return q
            } else {
                return {
                    string: q,
                    length: r - s
                }
            }
        };
        g.append = function(q, o, r) {
            if (typeof o === "number" || typeof o !== "string") {
                r = o;
                o = undefined
            }
            var p = typeof r === "undefined";
            if (p) {
                r = this.offset
            }
            if (!this.noAssert) {
                if (typeof r !== "number" || r % 1 !== 0) {
                    throw TypeError("Illegal offset: " + r + " (not an integer)")
                }
                r >>>= 0;
                if (r < 0 || r + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + r + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            if (!(q instanceof j)) {
                q = j.wrap(q, o)
            }
            var n = q.limit - q.offset;
            if (n <= 0) {
                return this
            }
            r += n;
            var m = this.buffer.byteLength;
            if (r > m) {
                this.resize((m *= 2) > r ? m : r)
            }
            r -= n;
            new Uint8Array(this.buffer, r).set(new Uint8Array(q.buffer).subarray(q.offset, q.limit));
            q.offset += n;
            if (p) {
                this.offset += n
            }
            return this
        };
        g.appendTo = function(m, n) {
            m.append(this, n);
            return this
        };
        g.assert = function(m) {
            this.noAssert = !m;
            return this
        };
        g.capacity = function() {
            return this.buffer.byteLength
        };
        g.clear = function() {
            this.offset = 0;
            this.limit = this.buffer.byteLength;
            this.markedOffset = -1;
            return this
        };
        g.clone = function(o) {
            var n = new j(0, this.littleEndian, this.noAssert);
            if (o) {
                var m = new ArrayBuffer(this.buffer.byteLength);
                new Uint8Array(m).set(this.buffer);
                n.buffer = m;
                n.view = new DataView(m)
            } else {
                n.buffer = this.buffer;
                n.view = this.view
            }
            n.offset = this.offset;
            n.markedOffset = this.markedOffset;
            n.limit = this.limit;
            return n
        };
        g.compact = function(p, o) {
            if (typeof p === "undefined") {
                p = this.offset
            }
            if (typeof o === "undefined") {
                o = this.limit
            }
            if (!this.noAssert) {
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                p >>>= 0;
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                o >>>= 0;
                if (p < 0 || p > o || o > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + p + " <= " + o + " <= " + this.buffer.byteLength)
                }
            }
            if (p === 0 && o === this.buffer.byteLength) {
                return this
            }
            var m = o - p;
            if (m === 0) {
                this.buffer = l;
                this.view = null;
                if (this.markedOffset >= 0) {
                    this.markedOffset -= p
                }
                this.offset = 0;
                this.limit = 0;
                return this
            }
            var n = new ArrayBuffer(m);
            new Uint8Array(n).set(new Uint8Array(this.buffer).subarray(p, o));
            this.buffer = n;
            this.view = new DataView(n);
            if (this.markedOffset >= 0) {
                this.markedOffset -= p
            }
            this.offset = 0;
            this.limit = m;
            return this
        };
        g.copy = function(o, m) {
            if (typeof o === "undefined") {
                o = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                o >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (o < 0 || o > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + o + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            if (o === m) {
                return new j(0, this.littleEndian, this.noAssert)
            }
            var n = m - o,
                p = new j(n, this.littleEndian, this.noAssert);
            p.offset = 0;
            p.limit = n;
            if (p.markedOffset >= 0) {
                p.markedOffset -= o
            }
            this.copyTo(p, 0, o, m);
            return p
        };
        g.copyTo = function(q, s, o, r) {
            var p, n;
            if (!this.noAssert) {
                if (!j.isByteBuffer(q)) {
                    throw TypeError("Illegal target: Not a ByteBuffer")
                }
            }
            s = (n = typeof s === "undefined") ? q.offset : s | 0;
            o = (p = typeof o === "undefined") ? this.offset : o | 0;
            r = typeof r === "undefined" ? this.limit : r | 0;
            if (s < 0 || s > q.buffer.byteLength) {
                throw RangeError("Illegal target range: 0 <= " + s + " <= " + q.buffer.byteLength)
            }
            if (o < 0 || r > this.buffer.byteLength) {
                throw RangeError("Illegal source range: 0 <= " + o + " <= " + this.buffer.byteLength)
            }
            var m = r - o;
            if (m === 0) {
                return q
            }
            q.ensureCapacity(s + m);
            new Uint8Array(q.buffer).set(new Uint8Array(this.buffer).subarray(o, r), s);
            if (p) {
                this.offset += m
            }
            if (n) {
                q.offset += m
            }
            return this
        };
        g.ensureCapacity = function(m) {
            var n = this.buffer.byteLength;
            if (n < m) {
                return this.resize((n *= 2) > m ? n : m)
            }
            return this
        };
        g.fill = function(p, n, m) {
            var o = typeof n === "undefined";
            if (o) {
                n = this.offset
            }
            if (typeof p === "string" && p.length > 0) {
                p = p.charCodeAt(0)
            }
            if (typeof n === "undefined") {
                n = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal value: " + p + " (not an integer)")
                }
                p |= 0;
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            if (n >= m) {
                return this
            }
            while (n < m) {
                this.view.setUint8(n++, p)
            }
            if (o) {
                this.offset = n
            }
            return this
        };
        g.flip = function() {
            this.limit = this.offset;
            this.offset = 0;
            return this
        };
        g.mark = function(m) {
            m = typeof m === "undefined" ? this.offset : m;
            if (!this.noAssert) {
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal offset: " + m + " (not an integer)")
                }
                m >>>= 0;
                if (m < 0 || m + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + m + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            this.markedOffset = m;
            return this
        };
        g.order = function(m) {
            if (!this.noAssert) {
                if (typeof m !== "boolean") {
                    throw TypeError("Illegal littleEndian: Not a boolean")
                }
            }
            this.littleEndian = !! m;
            return this
        };
        g.LE = function(m) {
            this.littleEndian = typeof m !== "undefined" ? !! m : true;
            return this
        };
        g.BE = function(m) {
            this.littleEndian = typeof m !== "undefined" ? !m : false;
            return this
        };
        g.prepend = function(r, p, t) {
            if (typeof p === "number" || typeof p !== "string") {
                t = p;
                p = undefined
            }
            var q = typeof t === "undefined";
            if (q) {
                t = this.offset
            }
            if (!this.noAssert) {
                if (typeof t !== "number" || t % 1 !== 0) {
                    throw TypeError("Illegal offset: " + t + " (not an integer)")
                }
                t >>>= 0;
                if (t < 0 || t + 0 > this.buffer.byteLength) {
                    throw RangeError("Illegal offset: 0 <= " + t + " (+" + 0 + ") <= " + this.buffer.byteLength)
                }
            }
            if (!(r instanceof j)) {
                r = j.wrap(r, p)
            }
            var m = r.limit - r.offset;
            if (m <= 0) {
                return this
            }
            var s = m - t;
            var o;
            if (s > 0) {
                var n = new ArrayBuffer(this.buffer.byteLength + s);
                o = new Uint8Array(n);
                o.set(new Uint8Array(this.buffer).subarray(t, this.buffer.byteLength), m);
                this.buffer = n;
                this.view = new DataView(n);
                this.offset += s;
                if (this.markedOffset >= 0) {
                    this.markedOffset += s
                }
                this.limit += s;
                t += s
            } else {
                o = new Uint8Array(this.buffer)
            }
            o.set(new Uint8Array(r.buffer).subarray(r.offset, r.limit), t - m);
            r.offset = r.limit;
            if (q) {
                this.offset -= m
            }
            return this
        };
        g.prependTo = function(m, n) {
            m.prepend(this, n);
            return this
        };
        g.printDebug = function(m) {
            if (typeof m !== "function") {
                m = console.log.bind(console)
            }
            m(this.toString() + "\n-------------------------------------------------------------------\n" + this.toDebug(true))
        };
        g.remaining = function() {
            return this.limit - this.offset
        };
        g.reset = function() {
            if (this.markedOffset >= 0) {
                this.offset = this.markedOffset;
                this.markedOffset = -1
            } else {
                this.offset = 0
            }
            return this
        };
        g.resize = function(n) {
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal capacity: " + n + " (not an integer)")
                }
                n |= 0;
                if (n < 0) {
                    throw RangeError("Illegal capacity: 0 <= " + n)
                }
            }
            if (this.buffer.byteLength < n) {
                var m = new ArrayBuffer(n);
                new Uint8Array(m).set(new Uint8Array(this.buffer));
                this.buffer = m;
                this.view = new DataView(m)
            }
            return this
        };
        g.reverse = function(n, m) {
            if (typeof n === "undefined") {
                n = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            if (n === m) {
                return this
            }
            Array.prototype.reverse.call(new Uint8Array(this.buffer).subarray(n, m));
            this.view = new DataView(this.buffer);
            return this
        };
        g.skip = function(m) {
            if (!this.noAssert) {
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal length: " + m + " (not an integer)")
                }
                m |= 0
            }
            var n = this.offset + m;
            if (!this.noAssert) {
                if (n < 0 || n > this.buffer.byteLength) {
                    throw RangeError("Illegal length: 0 <= " + this.offset + " + " + m + " <= " + this.buffer.byteLength)
                }
            }
            this.offset = n;
            return this
        };
        g.slice = function(n, m) {
            if (typeof n === "undefined") {
                n = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            var o = this.clone();
            o.offset = n;
            o.limit = m;
            return o
        };
        g.toBuffer = function(m) {
            var q = this.offset,
                o = this.limit;
            if (q > o) {
                var p = q;
                q = o;
                o = p
            }
            if (!this.noAssert) {
                if (typeof q !== "number" || q % 1 !== 0) {
                    throw TypeError("Illegal offset: Not an integer")
                }
                q >>>= 0;
                if (typeof o !== "number" || o % 1 !== 0) {
                    throw TypeError("Illegal limit: Not an integer")
                }
                o >>>= 0;
                if (q < 0 || q > o || o > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + q + " <= " + o + " <= " + this.buffer.byteLength)
                }
            }
            if (!m && q === 0 && o === this.buffer.byteLength) {
                return this.buffer
            }
            if (q === o) {
                return l
            }
            var n = new ArrayBuffer(o - q);
            new Uint8Array(n).set(new Uint8Array(this.buffer).subarray(q, o), 0);
            return n
        };
        g.toArrayBuffer = g.toBuffer;
        g.toString = function(o, n, m) {
            if (typeof o === "undefined") {
                return "ByteBufferAB(offset=" + this.offset + ",markedOffset=" + this.markedOffset + ",limit=" + this.limit + ",capacity=" + this.capacity() + ")"
            }
            if (typeof o === "number") {
                o = "utf8", n = o, m = n
            }
            switch (o) {
                case "utf8":
                    return this.toUTF8(n, m);
                case "base64":
                    return this.toBase64(n, m);
                case "hex":
                    return this.toHex(n, m);
                case "binary":
                    return this.toBinary(n, m);
                case "debug":
                    return this.toDebug();
                case "columns":
                    return this.toColumns();
                default:
                    throw Error("Unsupported encoding: " + o)
            }
        };
        var e = function() {
            var n = {};
            var q = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 43, 47];
            var p = [];
            for (var o = 0, m = q.length; o < m; ++o) {
                p[q[o]] = o
            }
            n.encode = function(u, v) {
                var r, s;
                while ((r = u()) !== null) {
                    v(q[(r >> 2) & 63]);
                    s = (r & 3) << 4;
                    if ((r = u()) !== null) {
                        s |= (r >> 4) & 15;
                        v(q[(s | ((r >> 4) & 15)) & 63]);
                        s = (r & 15) << 2;
                        if ((r = u()) !== null) {
                            v(q[(s | ((r >> 6) & 3)) & 63]), v(q[r & 63])
                        } else {
                            v(q[s & 63]), v(61)
                        }
                    } else {
                        v(q[s & 63]), v(61), v(61)
                    }
                }
            };
            n.decode = function(u, w) {
                var v, t, s;

                function r(x) {
                    throw Error("Illegal character code: " + x)
                }
                while ((v = u()) !== null) {
                    t = p[v];
                    if (typeof t === "undefined") {
                        r(v)
                    }
                    if ((v = u()) !== null) {
                        s = p[v];
                        if (typeof s === "undefined") {
                            r(v)
                        }
                        w((t << 2) >>> 0 | (s & 48) >> 4);
                        if ((v = u()) !== null) {
                            t = p[v];
                            if (typeof t === "undefined") {
                                if (v === 61) {
                                    break
                                } else {
                                    r(v)
                                }
                            }
                            w(((s & 15) << 4) >>> 0 | (t & 60) >> 2);
                            if ((v = u()) !== null) {
                                s = p[v];
                                if (typeof s === "undefined") {
                                    if (v === 61) {
                                        break
                                    } else {
                                        r(v)
                                    }
                                }
                                w(((t & 3) << 6) >>> 0 | s)
                            }
                        }
                    }
                }
            };
            n.test = function(r) {
                return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(r)
            };
            return n
        }();
        g.toBase64 = function(n, m) {
            if (typeof n === "undefined") {
                n = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            var o;
            e.encode(function() {
                return n < m ? this.view.getUint8(n++) : null
            }.bind(this), o = d());
            return o()
        };
        j.fromBase64 = function(q, o, n) {
            if (!n) {
                if (typeof q !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
                if (q.length % 4 !== 0) {
                    throw TypeError("Illegal str: Length not a multiple of 4")
                }
            }
            var p = new j(q.length / 4 * 3, o, n),
                m = 0;
            e.decode(c(q), function(r) {
                p.view.setUint8(m++, r)
            });
            p.limit = m;
            return p
        };
        j.btoa = function(m) {
            return j.fromBinary(m).toBase64()
        };
        j.atob = function(m) {
            return j.fromBase64(m).toBinary()
        };
        g.toBinary = function(n, m) {
            n = typeof n === "undefined" ? this.offset : n;
            m = typeof m === "undefined" ? this.limit : m;
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            if (n === m) {
                return ""
            }
            var p = [],
                o = [];
            while (n < m) {
                p.push(this.view.getUint8(n++));
                if (p.length >= 1024) {
                    o.push(String.fromCharCode.apply(String, p)), p = []
                }
            }
            return o.join("") + String.fromCharCode.apply(String, p)
        };
        j.fromBinary = function(s, q, p) {
            if (!p) {
                if (typeof s !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
            }
            var o = 0,
                n = s.length,
                m, r = new j(n, q, p);
            while (o < n) {
                m = s.charCodeAt(o);
                if (!p && m > 255) {
                    throw RangeError("Illegal charCode at " + o + ": 0 <= " + m + " <= 255")
                }
                r.view.setUint8(o++, m)
            }
            r.limit = n;
            return r
        };
        g.toDebug = function(q) {
            var p = -1,
                n = this.buffer.byteLength,
                m, s = "",
                r = "",
                o = "";
            while (p < n) {
                if (p !== -1) {
                    m = this.view.getUint8(p);
                    if (m < 16) {
                        s += "0" + m.toString(16).toUpperCase()
                    } else {
                        s += m.toString(16).toUpperCase()
                    }
                    if (q) {
                        r += m > 32 && m < 127 ? String.fromCharCode(m) : "."
                    }
                }++p;
                if (q) {
                    if (p > 0 && p % 16 === 0 && p !== n) {
                        while (s.length < 3 * 16 + 3) {
                            s += " "
                        }
                        o += s + r + "\n";
                        s = r = ""
                    }
                }
                if (p === this.offset && p === this.limit) {
                    s += p === this.markedOffset ? "!" : "|"
                } else {
                    if (p === this.offset) {
                        s += p === this.markedOffset ? "[" : "<"
                    } else {
                        if (p === this.limit) {
                            s += p === this.markedOffset ? "]" : ">"
                        } else {
                            s += p === this.markedOffset ? "'" : (q || (p !== 0 && p !== n) ? " " : "")
                        }
                    }
                }
            }
            if (q && s !== " ") {
                while (s.length < 3 * 16 + 3) {
                    s += " "
                }
                o += s + r + "\n"
            }
            return q ? o : s
        };
        j.fromDebug = function(w, o, y) {
            var s = w.length,
                v = new j(((s + 1) / 3) | 0, o, y);
            var u = 0,
                t = 0,
                m, x, r = false,
                z = false,
                n = false,
                p = false,
                q = false;
            while (u < s) {
                switch (m = w.charAt(u++)) {
                    case "!":
                        if (!y) {
                            if (z || n || p) {
                                q = true;
                                break
                            }
                            z = n = p = true
                        }
                        v.offset = v.markedOffset = v.limit = t;
                        r = false;
                        break;
                    case "|":
                        if (!y) {
                            if (z || p) {
                                q = true;
                                break
                            }
                            z = p = true
                        }
                        v.offset = v.limit = t;
                        r = false;
                        break;
                    case "[":
                        if (!y) {
                            if (z || n) {
                                q = true;
                                break
                            }
                            z = n = true
                        }
                        v.offset = v.markedOffset = t;
                        r = false;
                        break;
                    case "<":
                        if (!y) {
                            if (z) {
                                q = true;
                                break
                            }
                            z = true
                        }
                        v.offset = t;
                        r = false;
                        break;
                    case "]":
                        if (!y) {
                            if (p || n) {
                                q = true;
                                break
                            }
                            p = n = true
                        }
                        v.limit = v.markedOffset = t;
                        r = false;
                        break;
                    case ">":
                        if (!y) {
                            if (p) {
                                q = true;
                                break
                            }
                            p = true
                        }
                        v.limit = t;
                        r = false;
                        break;
                    case "'":
                        if (!y) {
                            if (n) {
                                q = true;
                                break
                            }
                            n = true
                        }
                        v.markedOffset = t;
                        r = false;
                        break;
                    case " ":
                        r = false;
                        break;
                    default:
                        if (!y) {
                            if (r) {
                                q = true;
                                break
                            }
                        }
                        x = parseInt(m + w.charAt(u++), 16);
                        if (!y) {
                            if (isNaN(x) || x < 0 || x > 255) {
                                throw TypeError("Illegal str: Not a debug encoded string")
                            }
                        }
                        v.view.setUint8(t++, x);
                        r = true
                }
                if (q) {
                    throw TypeError("Illegal str: Invalid symbol at " + u)
                }
            }
            if (!y) {
                if (!z || !p) {
                    throw TypeError("Illegal str: Missing offset or limit")
                }
                if (t < v.buffer.byteLength) {
                    throw TypeError("Illegal str: Not a debug encoded string (is it hex?) " + t + " < " + s)
                }
            }
            return v
        };
        g.toHex = function(p, n) {
            p = typeof p === "undefined" ? this.offset : p;
            n = typeof n === "undefined" ? this.limit : n;
            if (!this.noAssert) {
                if (typeof p !== "number" || p % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                p >>>= 0;
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                n >>>= 0;
                if (p < 0 || p > n || n > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + p + " <= " + n + " <= " + this.buffer.byteLength)
                }
            }
            var o = new Array(n - p),
                m;
            while (p < n) {
                m = this.view.getUint8(p++);
                if (m < 16) {
                    o.push("0", m.toString(16))
                } else {
                    o.push(m.toString(16))
                }
            }
            return o.join("")
        };
        j.fromHex = function(t, r, q) {
            if (!q) {
                if (typeof t !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
                if (t.length % 2 !== 0) {
                    throw TypeError("Illegal str: Length not a multiple of 2")
                }
            }
            var n = t.length,
                s = new j((n / 2) | 0, r),
                m;
            for (var p = 0, o = 0; p < n; p += 2) {
                m = parseInt(t.substring(p, p + 2), 16);
                if (!q) {
                    if (!isFinite(m) || m < 0 || m > 255) {
                        throw TypeError("Illegal str: Contains non-hex characters")
                    }
                }
                s.view.setUint8(o++, m)
            }
            s.limit = o;
            return s
        };
        var k = function() {
            var m = {};
            m.MAX_CODEPOINT = 1114111;
            m.encodeUTF8 = function(o, p) {
                var n = null;
                if (typeof o === "number") {
                    n = o, o = function() {
                        return null
                    }
                }
                while (n !== null || (n = o()) !== null) {
                    if (n < 128) {
                        p(n & 127)
                    } else {
                        if (n < 2048) {
                            p(((n >> 6) & 31) | 192), p((n & 63) | 128)
                        } else {
                            if (n < 65536) {
                                p(((n >> 12) & 15) | 224), p(((n >> 6) & 63) | 128), p((n & 63) | 128)
                            } else {
                                p(((n >> 18) & 7) | 240), p(((n >> 12) & 63) | 128), p(((n >> 6) & 63) | 128), p((n & 63) | 128)
                            }
                        }
                    }
                    n = null
                }
            };
            m.decodeUTF8 = function(r, t) {
                var p, n, s, q, o = function(u) {
                    u = u.slice(0, u.indexOf(null));
                    var v = Error(u.toString());
                    v.name = "TruncatedError";
                    v.bytes = u;
                    throw v
                };
                while ((p = r()) !== null) {
                    if ((p & 128) === 0) {
                        t(p)
                    } else {
                        if ((p & 224) === 192) {
                            ((n = r()) === null) && o([p, n]), t(((p & 31) << 6) | (n & 63))
                        } else {
                            if ((p & 240) === 224) {
                                ((n = r()) === null || (s = r()) === null) && o([p, n, s]), t(((p & 15) << 12) | ((n & 63) << 6) | (s & 63))
                            } else {
                                if ((p & 248) === 240) {
                                    ((n = r()) === null || (s = r()) === null || (q = r()) === null) && o([p, n, s, q]), t(((p & 7) << 18) | ((n & 63) << 12) | ((s & 63) << 6) | (q & 63))
                                } else {
                                    throw RangeError("Illegal starting byte: " + p)
                                }
                            }
                        }
                    }
                }
            };
            m.UTF16toUTF8 = function(p, q) {
                var o, n = null;
                while (true) {
                    if ((o = n !== null ? n : p()) === null) {
                        break
                    }
                    if (o >= 55296 && o <= 57343) {
                        if ((n = p()) !== null) {
                            if (n >= 56320 && n <= 57343) {
                                q((o - 55296) * 1024 + n - 56320 + 65536);
                                n = null;
                                continue
                            }
                        }
                    }
                    q(o)
                }
                if (n !== null) {
                    q(n)
                }
            };
            m.UTF8toUTF16 = function(o, p) {
                var n = null;
                if (typeof o === "number") {
                    n = o, o = function() {
                        return null
                    }
                }
                while (n !== null || (n = o()) !== null) {
                    if (n <= 65535) {
                        p(n)
                    } else {
                        n -= 65536, p((n >> 10) + 55296), p((n % 1024) + 56320)
                    }
                    n = null
                }
            };
            m.encodeUTF16toUTF8 = function(n, o) {
                m.UTF16toUTF8(n, function(p) {
                    m.encodeUTF8(p, o)
                })
            };
            m.decodeUTF8toUTF16 = function(n, o) {
                m.decodeUTF8(n, function(p) {
                    m.UTF8toUTF16(p, o)
                })
            };
            m.calculateCodePoint = function(n) {
                return (n < 128) ? 1 : (n < 2048) ? 2 : (n < 65536) ? 3 : 4
            };
            m.calculateUTF8 = function(p) {
                var o, n = 0;
                while ((o = p()) !== null) {
                    n += m.calculateCodePoint(o)
                }
                return n
            };
            m.calculateUTF16asUTF8 = function(p) {
                var q = 0,
                    o = 0;
                m.UTF16toUTF8(p, function(n) {
                    ++q;
                    o += m.calculateCodePoint(n)
                });
                return [q, o]
            };
            return m
        }();
        g.toUTF8 = function(n, m) {
            if (typeof n === "undefined") {
                n = this.offset
            }
            if (typeof m === "undefined") {
                m = this.limit
            }
            if (!this.noAssert) {
                if (typeof n !== "number" || n % 1 !== 0) {
                    throw TypeError("Illegal begin: Not an integer")
                }
                n >>>= 0;
                if (typeof m !== "number" || m % 1 !== 0) {
                    throw TypeError("Illegal end: Not an integer")
                }
                m >>>= 0;
                if (n < 0 || n > m || m > this.buffer.byteLength) {
                    throw RangeError("Illegal range: 0 <= " + n + " <= " + m + " <= " + this.buffer.byteLength)
                }
            }
            var p;
            try {
                k.decodeUTF8toUTF16(function() {
                    return n < m ? this.view.getUint8(n++) : null
                }.bind(this), p = d())
            } catch (o) {
                if (n !== m) {
                    throw RangeError("Illegal range: Truncated data, " + n + " != " + m)
                }
            }
            return p()
        };
        j.fromUTF8 = function(q, o, n) {
            if (!n) {
                if (typeof q !== "string") {
                    throw TypeError("Illegal str: Not a string")
                }
            }
            var p = new j(k.calculateUTF16asUTF8(c(q), true)[1], o, n),
                m = 0;
            k.encodeUTF16toUTF8(c(q), function(r) {
                p.view.setUint8(m++, r)
            });
            p.limit = m;
            return p
        };
        return j
    }
    if (typeof require === "function" && typeof module === "object" && module && typeof exports === "object" && exports) {
        module.exports = (function() {
            var c;
            try {
                c = require("Long")
            } catch (d) {}
            return a(c)
        })()
    } else {
        if (typeof define === "function" && define.amd) {
            define("ByteBuffer", ["Long"], function(c) {
                return a(c)
            })
        } else {
            (b.dcodeIO = b.dcodeIO || {})["ByteBuffer"] = a(b.dcodeIO["Long"])
        }
    }
})(this);