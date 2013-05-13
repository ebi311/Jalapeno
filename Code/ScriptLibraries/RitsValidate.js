/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*
数値(Number型)
    N … 数値型または数値文字であること
    N1..2 … 1以上2以下
    N1...2 … 1以上2未満
    N1..  … 1以上Max以下
    N1...  … 1以上Max未満
    ※下記は0を省略した形式
    N..1 … 0以上1以下
    N...2 … 0以上2未満
    ※負の数、小数点でもOK
数値(Number,String)
    n … 数値型または数値文字であること
    n1..2 … 1以上2以下
    n1...2 … 1以上2未満
    n1..  … 1以上Max以下
    n1...  … 1以上Max未満
    ※下記は0を省略した形式
    n..1 … 0以上1以下
    n...2 … 0以上2未満
    ※負の数、小数点でもOK
文字(String, そのほか)
    s1..2 … 1文字以上2文字以下
    s1...3 … 1文字以上3文字未満
    s/^[abc]\d{10}$/ … 正規表現
    ※正規表現の場合初めのsは省略できる
    /^[abc]\d{10}$/ … 正規表現
日付(Date型)
    D … 日付型であること
    D20120101..20121231 … 2012/1/1から2012/12/31まで
    D20120101...20130101 … 2012/1/1から2012/12/31まで
    D20120101.. … 2012/01/01から2999/12/31まで
    D..20130101 … 0/01/01から2013/01/01まで
    D...20130101 … 0/01/01から2012/12/31まで
    Dyymm … yyyy/MM もしくは yyyy-MM 形式
    D201201..201212 … 2012/1から2012/12まで
    D201201...201301 … 2012/1から2012/12まで
    D201201.. … 2012/01から2999/12まで
    D..201301 … 0/01から2013/01まで
    D...201301 … 0/01から2012/12まで
日付(に変換できる文字列)
    dyyyymmdd … yyyy/MM/dd もしくは yyyy-MM-dd 形式
    d20120101..20121231 … 2012/1/1から2012/12/31まで
    d20120101...20130101 … 2012/1/1から2012/12/31まで
    d20120101.. … 2012/01/01から2999/12/31まで
    d..20130101 … 1970/01/01から2013/01/01まで
    d...20130101 … 1970/01/01から2012/12/31まで
*/
var RITS = RITS || {};
RITS.validate = function (targets, valids) {
    var i, max, innerParam,
        retArray = [],
        _validate = function (target, valid) {
        var numRegExp = new RegExp('^([nN])(([+-]?(?:[0-9]+(?:\\.[0-9]+)?))?(\\.{2,3})([+-]?(?:[0-9]+(?:\\.[0-9]+)?))?)?$'),
            strRegExp = new RegExp('^s(([+-]?(?:[0-9]+(?:\\.[0-9]+)?))?(\\.{2,3})([+-]?(?:[0-9]+(?:\\.[0-9]+)?))?)?$'),
            dateRegExp = new RegExp('^([dD])((\\d{8})?(\\.{2,3})(\\d{8})?)?$'),
            regRegExp = new RegExp('^s?/([^/]*)/$'),
//日付チェック共通関数
            isRangeDate = function(target, fromStr, compStr, toStr) {
                var from, to, comp
                    toDate = function (str) {
                        var date,
                            y = Number(str.substr(0,4)),
                            m = Number(str.substr(4,2)) - 1,
                            d = Number(str.substr(6,2));
                            date = new Date(y,m,d, 0, 0, 0, 0);
                        return date;
                    };
                //日付型のチェック
                from = fromStr === '' ? new Date(-62167251600000) : toDate(fromStr);
                comp = compStr === '..';
                to = toStr === '' ? new Date(32503561200000) : toDate(toStr);
                if (comp === true) {
                    to.setTime(to.getTime() + 86400000 - 1);
                    return (from <= target) && (target <= to);
                } else {
                    return (from <= target) && (target < to);
                }
            };
        if (numRegExp.test(valid)) {
//数値(Number, String)
            return (function () {
                var min, comp, max, val;
                if (String(RegExp.$1) === 'N') {
                    if ('number' !== typeof target) { return false; }
                } else {
                    //NaNチェック
                    if (isNaN(target)) { return false; }
                }
                if (RegExp.$2 === '') {
                    return true;
                }
                val = Number(target);
                //最小値
                min = RegExp.$3 === '' ? 0 : Number(RegExp.$3);
                //比較
                comp = RegExp.$4 === '..';
                //最大値
                max = RegExp.$5 === '' ? Number.MAX_VALUE : Number(RegExp.$5);
                if (comp === true) {
                    return (min <= val) && (val <= max);
                } else {
                    return (min <= val) && (val < max);
                }
            })();
        } else if (strRegExp.test(valid)) {
//文字列
            return (function () {
                var min, comp, max, val;
                if ('string' !== typeof target) { return false; }
                if (RegExp.$1 === '') { return true; }
                val = target.length;
                //最小値
                min = RegExp.$2 === '' ? 0 : Number(RegExp.$2);
                //比較
                comp = RegExp.$3 === '..';
                //最大値
                max = RegExp.$4 === '' ? Number.MAX_VALUE : Number(RegExp.$4);
                if (comp === true) {
                    return (min <= val) && (val <= max);
                } else {
                    return (min <= val) && (val < max);
                }
            })();
        } else if (regRegExp.test(valid)) {
//文字列：正規表現
            return (function () {
                var reg;
                if ('string' !== typeof target) { return false; }
                reg = new RegExp(RegExp.$1);
                return reg.test(target);
            })();
        } else if (dateRegExp.test(valid)) {
//日付
            var targetType = RegExp.$1,
                validPattern = RegExp.$2,
                from = RegExp.$3,
                comp = RegExp.$4,
                to = RegExp.$5,
                regDate = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/;
            if (targetType === 'D' && !(target instanceof Date)) { return false; }
            if (targetType === 'd') {
                if (typeof target !== 'string') { return false; }
                if (!regDate.test(target)) { return false; }
                target = new Date(Number(RegExp.$1), Number(RegExp.$2) - 1, Number(RegExp.$3));
            }
            if (validPattern === '') { return true; }
            return isRangeDate(target, from, comp, to);
        } else {
            throw new Error('検証パターンに誤りがあります');
        }
    };
    //targetのタイプを調べる
    if (targets instanceof Array){
        i = 0;
        max = targets.length;
        for (''; i < max; i++) {
            innerParam = targets[i];
            if (innerParam instanceof Array && innerParam.length === 2 && typeof innerParam[1] === 'string') {
                retArray.push(_validate(innerParam[0], innerParam[1]));
            } else {
                retArray.push(null);
            }
        }
        return retArray;
    }else{
        return _validate(targets, valids);
    }
};

