(function(b, a) {
    if (typeof define === "function" && define.amd) {
        define("Long", [], a)
    } else {
        if (typeof require === "function" && typeof module === "object" && module && module.exports) {
            module.exports = a()
        } else {
            (b.dcodeIO = b.dcodeIO || {})["Long"] = a()
        }
    }
})(this, function() {
    function u(Z, ab, aa) {
        this.low = Z | 0;
        this.high = ab | 0;
        this.unsigned = !! aa
    }
    u.__isLong__;
    Object.defineProperty(u.prototype, "__isLong__", {
        value: true,
        enumerable: false,
        configurable: false
    });
    u.isLong = function d(Z) {
        return (Z && Z.__isLong__) === true
    };
    var M = {};
    var B = {};
    u.fromInt = function T(aa, Z) {
        var ab, ac;
        if (!Z) {
            aa = aa | 0;
            if (-128 <= aa && aa < 128) {
                ac = M[aa];
                if (ac) {
                    return ac
                }
            }
            ab = new u(aa, aa < 0 ? -1 : 0, false);
            if (-128 <= aa && aa < 128) {
                M[aa] = ab
            }
            return ab
        } else {
            aa = aa >>> 0;
            if (0 <= aa && aa < 256) {
                ac = B[aa];
                if (ac) {
                    return ac
                }
            }
            ab = new u(aa, (aa | 0) < 0 ? -1 : 0, true);
            if (0 <= aa && aa < 256) {
                B[aa] = ab
            }
            return ab
        }
    };
    u.fromNumber = function j(aa, Z) {
        Z = !! Z;
        if (isNaN(aa) || !isFinite(aa)) {
            return u.ZERO
        }
        if (!Z && aa <= -t) {
            return u.MIN_VALUE
        }
        if (!Z && aa + 1 >= t) {
            return u.MAX_VALUE
        }
        if (Z && aa >= a) {
            return u.MAX_UNSIGNED_VALUE
        }
        if (aa < 0) {
            return u.fromNumber(-aa, Z).negate()
        }
        return new u((aa % b) | 0, (aa / b) | 0, Z)
    };
    u.fromBits = function G(Z, ab, aa) {
        return new u(Z, ab, aa)
    };
    u.fromString = function A(ad, ab, ae) {
        if (ad.length === 0) {
            throw Error("number format error: empty string")
        }
        if (ad === "NaN" || ad === "Infinity" || ad === "+Infinity" || ad === "-Infinity") {
            return u.ZERO
        }
        if (typeof ab === "number") {
            ae = ab, ab = false
        }
        ae = ae || 10;
        if (ae < 2 || 36 < ae) {
            throw Error("radix out of range: " + ae)
        }
        var aa;
        if ((aa = ad.indexOf("-")) > 0) {
            throw Error('number format error: interior "-" character: ' + ad)
        } else {
            if (aa === 0) {
                return u.fromString(ad.substring(1), ab, ae).negate()
            }
        }
        var ag = u.fromNumber(Math.pow(ae, 8));
        var ai = u.ZERO;
        for (var ac = 0; ac < ad.length; ac += 8) {
            var ah = Math.min(8, ad.length - ac);
            var af = parseInt(ad.substring(ac, ac + ah), ae);
            if (ah < 8) {
                var Z = u.fromNumber(Math.pow(ae, ah));
                ai = ai.multiply(Z).add(u.fromNumber(af))
            } else {
                ai = ai.multiply(ag);
                ai = ai.add(u.fromNumber(af))
            }
        }
        ai.unsigned = ab;
        return ai
    };
    u.fromValue = function z(Z) {
        if (Z instanceof u) {
            return Z
        }
        if (typeof Z === "number") {
            return u.fromNumber(Z)
        }
        if (typeof Z === "string") {
            return u.fromString(Z)
        }
        return new u(Z.low, Z.high, Z.unsigned)
    };
    var U = 1 << 16;
    var X = 1 << 24;
    var b = U * U;
    var a = b * b;
    var t = a / 2;
    var n = u.fromInt(X);
    u.ZERO = u.fromInt(0);
    u.UZERO = u.fromInt(0, true);
    u.ONE = u.fromInt(1);
    u.UONE = u.fromInt(1, true);
    u.NEG_ONE = u.fromInt(-1);
    u.MAX_VALUE = u.fromBits(4294967295 | 0, 2147483647 | 0, false);
    u.MAX_UNSIGNED_VALUE = u.fromBits(4294967295 | 0, 4294967295 | 0, true);
    u.MIN_VALUE = u.fromBits(0, 2147483648 | 0, false);
    u.prototype.toInt = function o() {
        return this.unsigned ? this.low >>> 0 : this.low
    };
    u.prototype.toNumber = function Q() {
        if (this.unsigned) {
            return ((this.high >>> 0) * b) + (this.low >>> 0)
        }
        return this.high * b + (this.low >>> 0)
    };
    u.prototype.toString = function f(ad) {
        ad = ad || 10;
        if (ad < 2 || 36 < ad) {
            throw RangeError("radix out of range: " + ad)
        }
        if (this.isZero()) {
            return "0"
        }
        var af;
        if (this.isNegative()) {
            if (this.equals(u.MIN_VALUE)) {
                var ab = u.fromNumber(ad);
                var Z = this.divide(ab);
                af = Z.multiply(ab).subtract(this);
                return Z.toString(ad) + af.toInt().toString(ad)
            } else {
                return "-" + this.negate().toString(ad)
            }
        }
        var ag = u.fromNumber(Math.pow(ad, 6), this.unsigned);
        af = this;
        var ah = "";
        while (true) {
            var ae = af.divide(ag),
                ac = af.subtract(ae.multiply(ag)).toInt() >>> 0,
                aa = ac.toString(ad);
            af = ae;
            if (af.isZero()) {
                return aa + ah
            } else {
                while (aa.length < 6) {
                    aa = "0" + aa
                }
                ah = "" + aa + ah
            }
        }
    };
    u.prototype.getHighBits = function R() {
        return this.high
    };
    u.prototype.getHighBitsUnsigned = function h() {
        return this.high >>> 0
    };
    u.prototype.getLowBits = function r() {
        return this.low
    };
    u.prototype.getLowBitsUnsigned = function H() {
        return this.low >>> 0
    };
    u.prototype.getNumBitsAbs = function V() {
        if (this.isNegative()) {
            return this.equals(u.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs()
        }
        var aa = this.high != 0 ? this.high : this.low;
        for (var Z = 31; Z > 0; Z--) {
            if ((aa & (1 << Z)) != 0) {
                break
            }
        }
        return this.high != 0 ? Z + 33 : Z + 1
    };
    u.prototype.isZero = function F() {
        return this.high === 0 && this.low === 0
    };
    u.prototype.isNegative = function J() {
        return !this.unsigned && this.high < 0
    };
    u.prototype.isPositive = function P() {
        return this.unsigned || this.high >= 0
    };
    u.prototype.isOdd = function I() {
        return (this.low & 1) === 1
    };
    u.prototype.isEven = function q() {
        return (this.low & 1) === 0
    };
    u.prototype.equals = function C(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        if (this.unsigned !== Z.unsigned && (this.high >>> 31) === 1 && (Z.high >>> 31) === 1) {
            return false
        }
        return this.high === Z.high && this.low === Z.low
    };
    u.eq = u.prototype.equals;
    u.prototype.notEquals = function S(Z) {
        return !this.equals(Z)
    };
    u.neq = u.prototype.notEquals;
    u.prototype.lessThan = function m(Z) {
        return this.compare(Z) < 0
    };
    u.prototype.lt = u.prototype.lessThan;
    u.prototype.lessThanOrEqual = function L(Z) {
        return this.compare(Z) <= 0
    };
    u.prototype.lte = u.prototype.lessThanOrEqual;
    u.prototype.greaterThan = function g(Z) {
        return this.compare(Z) > 0
    };
    u.prototype.gt = u.prototype.greaterThan;
    u.prototype.greaterThanOrEqual = function E(Z) {
        return this.compare(Z) >= 0
    };
    u.prototype.gte = u.prototype.greaterThanOrEqual;
    u.prototype.compare = function l(aa) {
        if (!u.isLong(aa)) {
            aa = u.fromValue(aa)
        }
        if (this.equals(aa)) {
            return 0
        }
        var Z = this.isNegative(),
            ab = aa.isNegative();
        if (Z && !ab) {
            return -1
        }
        if (!Z && ab) {
            return 1
        }
        if (!this.unsigned) {
            return this.subtract(aa).isNegative() ? -1 : 1
        }
        return (aa.high >>> 0) > (this.high >>> 0) || (aa.high === this.high && (aa.low >>> 0) > (this.low >>> 0)) ? -1 : 1
    };
    u.prototype.negate = function p() {
        if (!this.unsigned && this.equals(u.MIN_VALUE)) {
            return u.MIN_VALUE
        }
        return this.not().add(u.ONE)
    };
    u.prototype.neg = u.prototype.negate;
    u.prototype.add = function c(ac) {
        if (!u.isLong(ac)) {
            ac = u.fromValue(ac)
        }
        var af = this.high >>> 16;
        var aa = this.high & 65535;
        var ah = this.low >>> 16;
        var ab = this.low & 65535;
        var aj = ac.high >>> 16;
        var ad = ac.high & 65535;
        var ak = ac.low >>> 16;
        var ae = ac.low & 65535;
        var al = 0,
            ag = 0,
            Z = 0,
            ai = 0;
        ai += ab + ae;
        Z += ai >>> 16;
        ai &= 65535;
        Z += ah + ak;
        ag += Z >>> 16;
        Z &= 65535;
        ag += aa + ad;
        al += ag >>> 16;
        ag &= 65535;
        al += af + aj;
        al &= 65535;
        return u.fromBits((Z << 16) | ai, (al << 16) | ag, this.unsigned)
    };
    u.prototype.subtract = function k(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        return this.add(Z.negate())
    };
    u.prototype.sub = u.prototype.subtract;
    u.prototype.multiply = function x(ak) {
        if (this.isZero()) {
            return u.ZERO
        }
        if (!u.isLong(ak)) {
            ak = u.fromValue(ak)
        }
        if (ak.isZero()) {
            return u.ZERO
        }
        if (this.equals(u.MIN_VALUE)) {
            return ak.isOdd() ? u.MIN_VALUE : u.ZERO
        }
        if (ak.equals(u.MIN_VALUE)) {
            return this.isOdd() ? u.MIN_VALUE : u.ZERO
        }
        if (this.isNegative()) {
            if (ak.isNegative()) {
                return this.negate().multiply(ak.negate())
            } else {
                return this.negate().multiply(ak).negate()
            }
        } else {
            if (ak.isNegative()) {
                return this.multiply(ak.negate()).negate()
            }
        }
        if (this.lessThan(n) && ak.lessThan(n)) {
            return u.fromNumber(this.toNumber() * ak.toNumber(), this.unsigned)
        }
        var ae = this.high >>> 16;
        var aa = this.high & 65535;
        var ag = this.low >>> 16;
        var ab = this.low & 65535;
        var ai = ak.high >>> 16;
        var ac = ak.high & 65535;
        var aj = ak.low >>> 16;
        var ad = ak.low & 65535;
        var al = 0,
            af = 0,
            Z = 0,
            ah = 0;
        ah += ab * ad;
        Z += ah >>> 16;
        ah &= 65535;
        Z += ag * ad;
        af += Z >>> 16;
        Z &= 65535;
        Z += ab * aj;
        af += Z >>> 16;
        Z &= 65535;
        af += aa * ad;
        al += af >>> 16;
        af &= 65535;
        af += ag * aj;
        al += af >>> 16;
        af &= 65535;
        af += ab * ac;
        al += af >>> 16;
        af &= 65535;
        al += ae * ad + aa * aj + ag * ac + ab * ai;
        al &= 65535;
        return u.fromBits((Z << 16) | ah, (al << 16) | af, this.unsigned)
    };
    u.prototype.mul = u.prototype.multiply;
    u.prototype.divide = function y(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        if (Z.isZero()) {
            throw (new Error("division by zero"))
        }
        if (this.isZero()) {
            return this.unsigned ? u.UZERO : u.ZERO
        }
        var ae, ag, ac;
        if (this.equals(u.MIN_VALUE)) {
            if (Z.equals(u.ONE) || Z.equals(u.NEG_ONE)) {
                return u.MIN_VALUE
            } else {
                if (Z.equals(u.MIN_VALUE)) {
                    return u.ONE
                } else {
                    var aa = this.shiftRight(1);
                    ae = aa.divide(Z).shiftLeft(1);
                    if (ae.equals(u.ZERO)) {
                        return Z.isNegative() ? u.ONE : u.NEG_ONE
                    } else {
                        ag = this.subtract(Z.multiply(ae));
                        ac = ae.add(ag.divide(Z));
                        return ac
                    }
                }
            }
        } else {
            if (Z.equals(u.MIN_VALUE)) {
                return this.unsigned ? u.UZERO : u.ZERO
            }
        }
        if (this.isNegative()) {
            if (Z.isNegative()) {
                return this.negate().divide(Z.negate())
            }
            return this.negate().divide(Z).negate()
        } else {
            if (Z.isNegative()) {
                return this.divide(Z.negate()).negate()
            }
        }
        ac = u.ZERO;
        ag = this;
        while (ag.greaterThanOrEqual(Z)) {
            ae = Math.max(1, Math.floor(ag.toNumber() / Z.toNumber()));
            var ah = Math.ceil(Math.log(ae) / Math.LN2),
                af = (ah <= 48) ? 1 : Math.pow(2, ah - 48),
                ab = u.fromNumber(ae),
                ad = ab.multiply(Z);
            while (ad.isNegative() || ad.greaterThan(ag)) {
                ae -= af;
                ab = u.fromNumber(ae, this.unsigned);
                ad = ab.multiply(Z)
            }
            if (ab.isZero()) {
                ab = u.ONE
            }
            ac = ac.add(ab);
            ag = ag.subtract(ad)
        }
        return ac
    };
    u.prototype.div = u.prototype.divide;
    u.prototype.modulo = function W(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        return this.subtract(this.divide(Z).multiply(Z))
    };
    u.prototype.mod = u.prototype.modulo;
    u.prototype.not = function O() {
        return u.fromBits(~this.low, ~this.high, this.unsigned)
    };
    u.prototype.and = function N(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        return u.fromBits(this.low & Z.low, this.high & Z.high, this.unsigned)
    };
    u.prototype.or = function D(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        return u.fromBits(this.low | Z.low, this.high | Z.high, this.unsigned)
    };
    u.prototype.xor = function K(Z) {
        if (!u.isLong(Z)) {
            Z = u.fromValue(Z)
        }
        return u.fromBits(this.low ^ Z.low, this.high ^ Z.high, this.unsigned)
    };
    u.prototype.shiftLeft = function s(Z) {
        if (u.isLong(Z)) {
            Z = Z.toInt()
        }
        if ((Z &= 63) === 0) {
            return this
        } else {
            if (Z < 32) {
                return u.fromBits(this.low << Z, (this.high << Z) | (this.low >>> (32 - Z)), this.unsigned)
            } else {
                return u.fromBits(0, this.low << (Z - 32), this.unsigned)
            }
        }
    };
    u.prototype.shl = u.prototype.shiftLeft;
    u.prototype.shiftRight = function e(Z) {
        if (u.isLong(Z)) {
            Z = Z.toInt()
        }
        if ((Z &= 63) === 0) {
            return this
        } else {
            if (Z < 32) {
                return u.fromBits((this.low >>> Z) | (this.high << (32 - Z)), this.high >> Z, this.unsigned)
            } else {
                return u.fromBits(this.high >> (Z - 32), this.high >= 0 ? 0 : -1, this.unsigned)
            }
        }
    };
    u.prototype.shr = u.prototype.shiftRight;
    u.prototype.shiftRightUnsigned = function v(ab) {
        if (u.isLong(ab)) {
            ab = ab.toInt()
        }
        ab &= 63;
        if (ab === 0) {
            return this
        } else {
            var aa = this.high;
            if (ab < 32) {
                var Z = this.low;
                return u.fromBits((Z >>> ab) | (aa << (32 - ab)), aa >>> ab, this.unsigned)
            } else {
                if (ab === 32) {
                    return u.fromBits(aa, 0, this.unsigned)
                } else {
                    return u.fromBits(aa >>> (ab - 32), 0, this.unsigned)
                }
            }
        }
    };
    u.prototype.shru = u.prototype.shiftRightUnsigned;
    u.prototype.toSigned = function Y() {
        if (!this.unsigned) {
            return this
        }
        return new u(this.low, this.high, false)
    };
    u.prototype.toUnsigned = function w() {
        if (this.unsigned) {
            return this
        }
        return new u(this.low, this.high, true)
    };
    return u
});