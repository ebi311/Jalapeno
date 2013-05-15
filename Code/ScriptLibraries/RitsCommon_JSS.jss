/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global java:true */
/** 
 * @fileOverview XPAGESで使用できる、汎用な静的関数群です。 
 * @author Copyrightc Ricoh IT Solutions Co.,Ltd. All Rights Reserved.<a href="Kenji.Ebihara@jrits.ricoh.co.jp">EBIHARA Kenji</a> 
 * @version 1.0.0
 */
/** 
 * Arrray,Stringオブジェクト拡張スイッチ<br />
 * trueの場合Arrray,Stringオブジェクトを拡張します
 * @type Boolean
 */
var __extendBuidinObject = true;
/**
 * @namespace 共通関数の最上位オブジェクトです 。
 */
print('common:' + applicationScope.get('RITS'))

var RITS = applicationScope.get('RITS') || {};
/**
 * @namespace 名前空間RITSのエイリアスです。
 * @description 名前空間"RITS"と比べて、短い表記ができる以外に違いはありません。
 */
var R$ = RITS;
/**
 * RITS名前空間に名前空間またはオブジェクトを安全に追加します。<br />
 * 引数の名前空間名には、「RITS」を指定しないでください。
 * @function
 * @param {String} ns_string RITSに追加定義する名前空間の名称を指定します。"."で区切って、階層を定義することもできます。
 * @return {Object} 定義した名前空間をオブジェクトを返します。
 * @example var newNamespace = RITS.addNamespace('newNS.newNS1');
 * newNamespace.obj = {} // RITS.newNS.newNS1.obj が定義されます。
 */
RITS.addNamespace = function (ns_string) {
    var names = ns_string.split("."),
        i = 0,
        max = names.length,
        parent = RITS;
    for (; i < max; i++) {
        if (typeof parent[names[i]] === "undefined") {
            parent[names[i]] = {};
        }
        parent = parent[names[i]];
    }
    return parent;
};

/**
 * 指定したURLに対して、Webサービスの問い合わせをします。レスポンスのボディーは文字列であることが前提です。<br />
 * このメソッドはすべての場合に対応できるわけではありません。必ず動作の確認をしてください。
 * @function 
 * @param {string} strUrl 問い合わせ先のURL
 * @param {string} data 送信するデータ Objectの場合は、JSONに変換して送ります。そのほかの場合は、そのまま文字列として送ります。
 * @param {any} method "GET","POST"のどちらかを入れてください。
 * @param {string} encode nullの場合、"utf-8"として送ります。それ以外の文字列の場合は、渡された文字をそのままエンコードとして、リクエストヘッダに渡します。
 * @return {string} レスポンスのボディーを文字列で返します。
 */

RITS.sendJsonWebService = function (strUrl, data, method, encode) {
    var url = java.net.URL(strUrl),
        http = url.openConnection(),
        bufferReader,
        str = "",
        buffer = null;
    http.setRequestMethod(method);
    http.setRequestProperty("Accept", '*/*');
    http.setRequestProperty("Accept-Charset", "UTF-8,*;q=0.5");
    http.setRequestProperty("Content-Type", "text/json");
    if (method === "POST") {
        http.setDoOutput(true);
        var osw = new java.io.OutputStreamWriter(http.getOutputStream(), "utf-8");
        try {
            if (typeof(data) === "object") {
                osw.write(R$.objectToJSON(data));
            } else {
                osw.write(data);
            }
        } catch (e) {
            throw e;
        } finally {
            print("Closing Output Stream");
            osw.flush();
            osw.close();
        }
    }
    http.connect();
    try {
        if (!encode) {
            encode = 'utf-8';
        }
        bufferReader = new java.io.BufferedReader(new java.io.InputStreamReader(http.getInputStream(), encode));
        do {
            buffer = bufferReader.readLine();
            if (buffer !== null) {
                str += buffer + "\r\n";
            } 
        }while (buffer != null);
    } catch (e) {
        print(e);
        throw e;
    } finally {
        print("Closing HTTP Connection");
        http.disconnect();        
    }
    return str;    
};
/**
 * 引数をURLエンコードします。
 * @requires 
 * @param {string} value URLエンコードする文字列
 * @return {string} URLエンコードされた文字列
 */
RITS.URLEncode = function (value) {
    return java.net.URLEncoder.encode(value, "UTF-8");
};
/**
 * 引数の文字列のHTMLの特殊文字をエスケープします
 * @requires 
 * @param {string} str HTMLエスケープする文字列
 * @return {string} HTMLエスケープされた文字列
 */
RITS.HTMLEscape = function (str) {
    var ret = str
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#03");
    return ret;
};
//標準オブジェクト拡張
(function () {
    if (__extendBuidinObject === false) { return; }
/**
 * ※ __extendBuidinObject = true を宣言して使用してください。<br />
 * 配列のすべての要素に対して引数で指定された関数の処理を実施します。<br />
 * 引数のfunctionでは、thisは配列の要素として参照できますが、プリミティブ型（String,Number,Boolean）は、オブジェクト型のラッパーオブジェクトになりますので注意してください。<br />
 * ラッパーオブジェクトへの変換が好ましくない場合は、第2引数を利用してください<br />
 * 戻り値は、メソッドチェーンパターンを考慮し、処理後の配列(オブジェクトは現在のものと同一)となります。
 * @function
 * @param {function}    callBack 配列の要素に対して実行する関数を指定します。2つの引数を定義することができます。<br />
 * 第1引数は処理のインデクサがNumberで入ります。<br />
 * 第2引数は配列の要素が入ります。thisとほぼ同じですが、プリミティブ型がObject型に変換されない事が異なります。
 * @return {Array}        処理後の配列（オブジェクトは現在のものと同一）を返します。メソッドチェーンとして利用できます。
 */
    Array.prototype.each = function (callBack) {
        //引数callBackが関数でなければ例外
        if (typeof callBack !== "function") {
            throw "引数にfunctionを指定してください";
        }
        var i = 0, max = this.length;
        for (; i < max; i++) {
            callBack.call(this[i], i, this[i]);
        }
        return this;
    };
/**
 * ※ __extendBuidinObject = true を宣言して使用してください。<br />
 * 配列のすべての要素に対して、引数の関数の処理を行い、戻り値がtrueの要素だけ含まれる配列を返します。<br />
 * 引数のfunctionでは、thisは配列の要素となりますが、プリミティブ型（String,Number,Boolean）は、オブジェクト型のラッパーになりますので注意してください。<br />
 * オブジェクト型への変換が好ましくない場合は、第2引数を利用してください<br />
 * 戻り値は、メソッドチェーンパターンを考慮し、処理後の配列(オブジェクトは現在のものと同一)となります。
 * @function
 * @param {function} query 配列の要素に対して実行される関数を指定します。必ず戻り値としてBooleanを返すようにしてください。<br/>
 * 2つの引数を定義することができます。<br />
 * 第1引数は処理のインデクサがNumberで入ります。<br />
 * 第2引数は配列の要素が入ります。thisとほぼ同じですが、プリミティブ型がObject型に変換されない事が異なります。
 * @return {Array} 引数の関数で戻り値がtrueとなる要素のみにフィルタされた配列を返します。チェーンメソッドとして利用できます。
  */
    Array.prototype.where = function (query) {
        if (typeof query !== "function") {
            throw "引数にfunctionを指定してください";
        }
        var retArray = [];
        var i = 0, max = this.length;
        for (; i < max; i++) {
            var ret = query.call(this[i], i, this[i]);
            if (ret === true) {
                retArray.push(this[i]);
            }
        }
        return retArray;
    };
/**
 * ※ __extendBuidinObject = true を宣言して使用してください。<br />
 * 配列の要素を巡回し、引数の関数実行し、その戻り値がtrueとなる初めの要素のみを返します。<br />
 * 配列を巡回する順番はインデクサの順番です。関数でtrueとなる要素が複数ある場合は、もっとも配列のインデックスの小さい要素となります。<br />
 * 引数のfunctionでは、thisは配列の要素となりますが、プリミティブ型（String,Number,Boolean）は、オブジェクト型のラッパーになりますので注意してください。<br />
 * オブジェクト型への変換が好ましくない場合は、第2引数を利用してください<br />
 * @function
 * @param {function} query 配列の要素に対して実行される関数を指定します。必ず戻り値としてBooleanを返すようにしてください。<br/>
 * 2つの引数を定義することができます。<br />
 * 第1引数は処理のインデクサがNumberで入ります。<br />
 * 第2引数は配列の要素が入ります。thisとほぼ同じですが、プリミティブ型がObject型に変換されない事が異なります。
 * @return {Object} 初めに引数の関数で戻り値がtrueとなる要素を返します。
 */
    Array.prototype.first = function (query) {
        if (typeof query !== "function") {
            throw "引数にfunctionを指定してください";
        }
        var i = 0, max = this.length;
        for (; i < max; i++) {
            var ret = query.call(this[i], i, this[i]);
            if (ret === true) {
                return this[i];
            }
        }
        return null;
    };
/**
 * ※ __extendBuidinObject = true を宣言して使用してください。<br />
 * 配列の要素を巡回し、引数のオブジェクトが存在していたら、そのインデックス(Number)を返します。存在しない場合は-1を返します。<br />
 * 配列を巡回する順番はインデクサの順番です。引数objと同じ要素が複数ある場合は、もっとも配列のインデックスの小さい要素となります。<br />
 * 比較は、"==="演算子が使用されます。
 * @function
 * @param {Object} obj 見つける対象のオブジェクト
 * @return {Number} 初めに引数の関数で戻り値がtrueとなる要素のインデックスを返します。
 */
    Array.prototype.indexOf = function (obj) {
        var counter = 0,
            ret = -1;
        this.each(function (i, item) {
            if (item === obj) {
                ret = counter;
            }
            counter++;
        });
        return ret;
    };
    /**
     * ※ __extendBuidinObject = true を宣言して使用してください。<br />
     * 配列の要素を巡回し、引数のオブジェクトが存在していたらtrueを返し、無ければfalseを返します。<br />
     * 比較は、"==="演算子が使用されます。
     * @function
     * @param {Object} obj 見つける対象のオブジェクト
     * @return {Object} 初めに引数の関数で戻り値がtrueとなる要素を返します。
     */
    Array.prototype.isExist = function (obj) {
        return this.indexOf(obj) !== -1;
    };
})();
/**
 * JavaScriptオブジェクトをJSONに変換します。
 * @function
 * @param {Object} obj JSONに変換するオブジェクト
 * @return {String} JSON文字列
 * @description XPages付属のtoJSONではマルチバイト文字が16進数になりますが、この関数はそのままの文字コードで変換します。
 */
RITS.objectToJSON = function (obj) {
    var ret = "", buf = [];
    if (obj === null) {
        ret = "null";
    } else {
        switch (obj.constructor) {
        case String:
            obj = obj.replace('\\', '\\\\')
                    .replace('"', '\\"')
                    .replace('\t', ' ');
            ret = '"' + obj + '"';
            break;
        case Boolean:
            ret = obj ? "true" : "false";
            break;
        case Number:
            ret = isNaN(obj) || !isFinite(obj) ? "null" : obj.toString();
            break;
        case Array:
            for (var i = 0; i < obj.length; i++) {
                //再帰呼出
                buf.push(RITS.objectToJSON(obj[i]));
            }
            ret = "[" + buf.join(",") + "]";
            break;
        case Object:
            for (var key in obj) {
                //Object汚染回避判定有
                if (obj.hasOwnProperty(key)) {
                    //再帰呼出
                    buf[buf.length] = R$.objectToJSON(key) + ":" + R$.objectToJSON(obj[key]);
                }
            }
            ret = "{" + buf.join(",") + "}";
            break;
        default:
            ret = "null";
            break;
        }
    }
    return ret;
};
applicationScope.put('RITS', RITS);