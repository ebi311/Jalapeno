/**
 * @author Copyrightc Ricoh IT Solutions Co.,Ltd. All Rights Reserved.
 * @version 0.0.1
 * @fileOverview RITSで利用する共通関数・オブジェクト郡です。
 * @description 名前空間"RITS","R$"を無条件に定義します。すでに存在する場合は、上書きされます。
 */
/**
 * @namespace 共通関数の最上位オブジェクトです 。
 */
var RITS = {};
/**
 * @namespace 名前空間RITSのエイリアスです。
 * @description 名前空間"RITS"と比べて、短い表記ができる以外に違いはありません。
 */
var R$ = RITS;
/**
 * RITS名前空間に名前空間またはオブジェクトを安全に追加します。
 * @function
 * @param {String} ns_string RITSに追加定義する名前空間の名称を指定します。"."で区切って、階層を定義することもできます。
 * @return {Object} 定義した名前空間をオブジェクトを返します。
 * @example var newNamespace = RITS.addNamespace('newNS.newNS1');
 * newNamespace.obj = {} // RITS.newNS.newNS1.obj が定義されます。
 * @description 引数の名前空間名には、"RITS."を指定しないでください。
 */
RITS.addNamespace = function(ns_string){
	var names = ns_string.split("."),
		i = 0,
		max = names.length,
		parent = RITS;
	for(; i < max; i++){
		if(typeof parent[names[i]] === "undefined"){
			parent[names[i]] = {};
		}
		parent = parent[names[i]];
	}
	return parent;
}
/**
 * XPagesで自動生成されたIDでの、jQueryの$("#...")によるオブジェクト取得を容易にします。
 * @requires jQueryが必要です
 * @param {string} xspIdName XPagesで自動生成されたIDを指定します。IDのみを指定してください。先頭の"#"は必要ありません。
 * @return {jQuery} 指定したID要素のjQueryオブジェクト
 * @description XPagesで自動生成されたIDは、":"が入っておりjQueryではエスケープが必要ですが、それを自動的に行いjQueryオブジェクトを返します。
 * jQueryが読み込まれていない場合は、nullを返します。
 */
RITS.getId = function(xspIdName){
	if(jQuery){
		return jQuery("#" + xspIdName.replace(/:/g,"\\:"));
	}
	return null;
}
RITS.$id = RITS.getId;
RITS.createVaridator = function(condition){
	var _condition = {};
	_condition.required = condition.required instanceof undefined ? false : condition.required;
	_condition.minLength = condition.minLength instanceof undefined ? 0 : condition.minLength;
	_condition.maxLength = condition.maxLength instanceof undefined ? 0 : condition.maxLength;
	_condition.numberOnly = condition.numberOnly instanceof undefined ? false : condition.numberOnly;
	_condition.dateFormat = condition.dateFormat instanceof undefined ? false : condition.dateFormat;
	_condition.regex = condition.regex instanceof undefined ? null : condition.regex;
	var prop = {
		value : "",
		validate : function(){
			
		}
	};
}
RITS.DotNetVer = (function(){
    var reg20 = /\.NET CLR 2\.0/,
        reg30 = /\.NET CLR 3\.0/,
        reg35 = /\.NET CLR 3\.5/,
        reg40C =  /\.NET4\.0C/,
        reg40 = /\.NET4\.0E/,
        agent = navigator.userAgent;
    return {
        lt20: reg20.test(agent),
        lt30: reg30.test(agent),
        lt35: reg35.test(agent),
        lt40C: reg40C.test(agent),
        lt40: reg40.test(agent)
    }
})();
RITS.showMessageBox = function(message,type,title){
	title = !title ? "" : title;
	message = !message ? "" : message;
	var icon = $("#RITSFUC_Icon");
	var messagePara = $("#RITSFUC_Message");
	icon.removeAttr("class");
	switch(type){
		case "E","e":
			icon.addClass("RITSFUC_dialog-error");
			break;
		case "W","w":
			icon.addClass("RITSFUC_dialog-warning");
			break;
		case "I","i":
		default:
			icon.addClass("RITSFUC_dialog-information");			
	}
	var html = messagePara.text(message).html().replace(/\\n/g,"<br />");
	messagePara.html(html);
	$("#RITS_MessageBox").dialog({
		modal:true,
		buttons:{
			Ok: function(){
				$(this).dialog("close");
			}
		},
		width: 300,
		title: title
	});
}
RITS.UAType = (function(){
	var obj =
	{
		ltIE6:typeof window.addEventListener == "undefined" && typeof document.documentElement.style.maxHeight == "undefined",
		ltIE7:typeof window.addEventListener == "undefined" && typeof document.querySelectorAll == "undefined",
		ltIE8:typeof window.addEventListener == "undefined" && typeof document.getElementsByClassName == "undefined",
		ie:!!(document.uniqueID),
		ltIE9: false, //後で設定
		firefox:window.globalStorage,
		opera:window.opera,
		webkit:!document.uniqueID && !window.opera && !window.globalStorage && window.localStorage,
		mobile:/android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
	};
	obj.ltIE9 = obj.ie && !obj.ltIE6 && !obj.ltIE7 && !obj.ltIRE;
	//IE9でレンダリングモードを後方互換にしていてもIE9として判別する
	obj.realIE9 = (navigator.userAgent.toLowerCase().indexOf("msie 9.0") !== -1);
	return obj;
})();
//標準オブジェクト拡張
/**
 * 配列のすべての要素に対して処理を行います。
 * @function
 * @param {function}	callBack 配列の要素に対して実行する関数を指定します。
 * @return {Array}		処理後の配列（オブジェクトは現在のものと同一）を返します。メソッドチェーンとして利用できます。
 * @description			配列の各要素に対して、引数のfunctionを実行します。引数のfunctionでは、thisは配列の要素となす。戻り値は、メソッドチェーンパターンを考慮し、処理後の配列(オブジェクトは現在のものと同一)となります。
 */
Array.prototype.each = function(callBack) {
	//引数callBackが関数でなければ例外
	if( typeof callBack !== "function") {
		throw "引数にfunctionを指定してください";
	}
	var i = 0, max = this.length;
	for(; i < max; i++) {
		callBack.call(this[i],i);
	}
	return this;
}
/**
 * 配列のすべての要素に対して、引数の関数の処理を行い、戻り値がtrueの要素だけ含まれる配列を返します。
 * @function
 * @param {function} query 配列の要素に対して実行し、戻り値としてBooleanを返す関数を指定します。
 * @return {Array} 引数の関数で戻り値がtrueとなる要素のみにフィルタされた配列を返します。チェーンメソッドとして利用できます。
 * @description 配列の各要素に対して、引数のfunctionを実行します。functionの戻り値がtrueの要素のみだけの配列を返します。
 */
Array.prototype.where = function(query){
	if( typeof query !== "function") {
		throw "引数にfunctionを指定してください";
	}
	var retArray = [];
	var i = 0, max = this.length;
	for(; i < max; i++) {
		var ret = query.call(this[i]);
		if(ret === true){
			retArray.push(this[i]);
		}
	}
	return retArray;
}
/**
 * 配列の要素を巡回し、引数の関数を行い、はじめに戻り値がtrueの要素のみを返します。
 * @function
 * @param {function} query 配列の要素に対して実行し、戻り値としてBooleanを返す関数を指定します。
 * @return {Object} 初めに引数の関数で戻り値がtrueとなる要素を返します。
 * @description 配列を受戒する順番はインデクサの順番です。関数でtrueとなる要素が複数ある場合は、もっとも配列のインデックスの小さい要素となります。
 */
Array.prototype.first = function(query){
	if( typeof query !== "function") {
		throw "引数にfunctionを指定してください";
	}
	var i = 0, max = this.length;
	for(; i < max; i++) {
		var ret = query.call(this[i]);
		if(ret === true){
			return this[i];
		}
	}
	return null;
}
/*
--------------------------------------------------------
dateformat.js - Simple date formatter
Version 1.1 (Update 2008/04/02)

Copyright (c) 2007-2008 onozaty (http://www.enjoyxstudy.com)

Released under an MIT-style license.

For details, see the web site:
 http://www.enjoyxstudy.com/javascript/dateformat/

--------------------------------------------------------
patterns
y : Year         ex. "yyyy" -> "2007", "yy" -> "07"
M : Month        ex. "MM" -> "05" "12", "M" -> "5" "12"
d : Day          ex. "dd" -> "09" "30", "d" -> "9" "30"
H : Hour (0-23)  ex. "HH" -> "00" "23", "H" -> "0" "23"
m : Minute       ex. "mm" -> "01" "59", "m" -> "1" "59"
s : Second       ex. "ss" -> "00" "59", "H" -> "0" "59"
S : Millisecond  ex. "SSS" -> "000" "012" "999", 
                     "SS" -> "00" "12" "999", "S" -> "0" "12" "999"

Text can be quoted using single quotes (') to avoid interpretation.
"''" represents a single quote. 


Useing..

 var fmt = new DateFormat("yyyy/MM/dd HH:mm:ss SSS");

 var str = fmt.format(new Date()); // "2007/05/10 12:21:19 002"
 var date = fmt.parse("2007/05/10 12:21:19 002"); // return Date object

--------------------------------------------------------
*/
Date.prototype.toFormatedString = function(pattern){
	var fmt = new RITS.dateFormat(pattern);
	return fmt.format(this);
};
RITS.dateFormat = function(pattern) {
  this._init(pattern);
};

RITS.dateFormat.prototype = {
  _init: function(pattern) {

    this.pattern = pattern;
    this._patterns = [];

    for (var i = 0; i < pattern.length; i++) {
      var ch = pattern.charAt(i);
      if (this._patterns.length == 0) {
        this._patterns[0] = ch;
      } else {
        var index = this._patterns.length - 1;
        if (this._patterns[index].charAt(0) == "'") {
          if (this._patterns[index].length == 1 
             || this._patterns[index].charAt(this._patterns[index].length - 1) != "'") {
            this._patterns[index] += ch;
          } else {
            this._patterns[index + 1] = ch;
          }
        } else if (this._patterns[index].charAt(0) == ch) {
          this._patterns[index] += ch;
        } else {
          this._patterns[index + 1] = ch;
        }
      }
    }
  },

  format: function(date) {

    var result = [];
    for (var i = 0; i < this._patterns.length; i++) {
      result[i] = this._formatWord(date, this._patterns[i]);
    }
    return result.join('');
  },
  _formatWord: function(date, pattern) {

    var formatter = this._formatter[pattern.charAt(0)];
    if (formatter) {
      return formatter.apply(this, [date, pattern]);
    } else {
      return pattern;
    }
  },
  _formatter: {
    "y": function(date, pattern) {
      // Year
      var year = String(date.getFullYear());
      if (pattern.length <= 2) {
        year = year.substring(2, 4);
      } else {
        year = this._zeroPadding(year, pattern.length);
      }
      return year;
    },
    "M": function(date, pattern) {
      // Month in year
      return this._zeroPadding(String(date.getMonth() + 1), pattern.length);
    },
    "d": function(date, pattern) {
      // Day in month
      return this._zeroPadding(String(date.getDate()), pattern.length);
    },
    "H": function(date, pattern) {
      // Hour in day (0-23)
      return this._zeroPadding(String(date.getHours()), pattern.length);
    },
    "m": function(date, pattern) {
      // Minute in hour
      return this._zeroPadding(String(date.getMinutes()), pattern.length);
    },
    "s": function(date, pattern) {
      // Second in minute
      return this._zeroPadding(String(date.getSeconds()), pattern.length);
    },
    "S": function(date, pattern) {
      // Millisecond
      return this._zeroPadding(String(date.getMilliseconds()), pattern.length);
    },
    "'": function(date, pattern) {
      // escape
      if (pattern == "''") {
        return "'";
      } else {
        return pattern.replace(/'/g, '');
      }
    }
  },

  _zeroPadding: function(str, length) {
    if (str.length >= length) {
      return str;
    }

    return new Array(length - str.length + 1).join("0") + str;
  },


  /// Parser ///
  parse: function(text) {

    if (typeof text != 'string' || text == '') return null;

    var result = {year: 1970, month: 1, day: 1, hour: 0, min: 0, sec: 0, msec: 0};

    for (var i = 0; i < this._patterns.length; i++) {
       if (text == '') return null; // parse error!!
       text = this._parseWord(text, this._patterns[i], result);
       if (text === null) return null; // parse error!!
    }
    if (text != '') return null; // parse error!!

    return new Date(
                result.year,
                result.month - 1,
                result.day,
                result.hour,
                result.min,
                result.sec,
                result.msec);
  },
  _parseWord: function(text, pattern, result) {

    var parser = this._parser[pattern.charAt(0)];
    if (parser) {
      return parser.apply(this, [text, pattern, result]);
    } else {
      if (text.indexOf(pattern) != 0) {
        return null;
      } else {
        return text.substring(pattern.length);
      }
    }
  },
  _parser: {
    "y": function(text, pattern, result) {
      // Year
      var year;
      if (pattern.length <= 2) {
        year = text.substring(0, 2);
        year = year < 70 ? '20' + year : '19' + year;
        text = text.substring(2);
      } else {
        var length = (pattern.length == 3) ? 4 : pattern.length;
        year = text.substring(0, length);
        text = text.substring(length);
      }
      if (!this._isNumber(year)) return null; // error
      result.year = parseInt(year, 10);
      return text;
    },
    "M": function(text, pattern, result) {
      // Month in year
      var month;
      if (pattern.length == 1 && text.length > 1
          && text.substring(0, 2).match(/1[0-2]/) != null) {
        month = text.substring(0, 2);
        text  = text.substring(2);
      } else {
        month = text.substring(0, pattern.length);
        text  = text.substring(pattern.length);
      }
      if (!this._isNumber(month)) return null; // error
      result.month = parseInt(month, 10);
      return text;
    },
    "d": function(text, pattern, result) {
      // Day in month
      var day;
      if (pattern.length == 1 && text.length > 1 
          && text.substring(0, 2).match(/1[0-9]|2[0-9]|3[0-1]/) != null) {
        day  = text.substring(0, 2);
        text = text.substring(2);
      } else {
        day  = text.substring(0, pattern.length);
        text = text.substring(pattern.length);
      }
      if (!this._isNumber(day)) return null; // error
      result.day = parseInt(day, 10);
      return text;
    },
    "H": function(text, pattern, result) {
      // Hour in day (0-23)
      var hour;
      if (pattern.length == 1 && text.length > 1
          && text.substring(0, 2).match(/1[0-9]|2[0-3]/) != null) {
        hour = text.substring(0, 2);
        text = text.substring(2);
      } else {
        hour = text.substring(0, pattern.length);
        text = text.substring(pattern.length);
      }
      if (!this._isNumber(hour)) return null; // error
      result.hour = parseInt(hour, 10);
      return text;
    },
    "m": function(text, pattern, result) {
      // Minute in hour
      var min;
      if (pattern.length == 1 && text.length > 1
          && text.substring(0, 2).match(/[1-5][0-9]/) != null) {
        min  = text.substring(0, 2);
        text = text.substring(2);
      } else {
        min  = text.substring(0, pattern.length);
        text = text.substring(pattern.length);
      }
      if (!this._isNumber(min)) return null; // error
      result.min = parseInt(min, 10);
      return text;
    },
    "s": function(text, pattern, result) {
      // Second in minute
      var sec;
      if (pattern.length == 1 && text.length > 1
          && text.substring(0, 2).match(/[1-5][0-9]/) != null) {
        sec  = text.substring(0, 2);
        text = text.substring(2);
      } else {
        sec  = text.substring(0, pattern.length);
        text = text.substring(pattern.length);
      }
      if (!this._isNumber(sec)) return null; // error
      result.sec = parseInt(sec, 10);
      return text;
    },
    "S": function(text, pattern, result) {
      // Millimsecond
      var msec;
      if (pattern.length == 1 || pattern.length == 2) {
        if (text.length > 2 && text.substring(0, 3).match(/[1-9][0-9][0-9]/) != null) {
          msec = text.substring(0, 3);
          text = text.substring(3);
        } else if (text.length > 1 && text.substring(0, 2).match(/[1-9][0-9]/) != null) {
          msec = text.substring(0, 2);
          text = text.substring(2);
        } else {
          msec = text.substring(0, pattern.length);
          text = text.substring(pattern.length);
        }
      } else {
        msec = text.substring(0, pattern.length);
        text = text.substring(pattern.length);
      }
      if (!this._isNumber(msec)) return null; // error
      result.msec = parseInt(msec, 10);
      return text;
    },
    "'": function(text, pattern, result) {
      // escape
      if (pattern == "''") {
        pattern = "'";
      } else {
        pattern = pattern.replace(/'/g, '');
      }
      if (text.indexOf(pattern) != 0) {
        return null; // error
      } else {
        return text.substring(pattern.length);
      }
    }
  },

  _isNumber: function(str) {
    return /^[0-9]*$/.test(str);
  }
}
/* 3桁区切書式に変換する。引数Numericは任意の1バイト数字 */
RITS.num2str = function(numeric){
    numeric += ''; //文字列化
	
	// ","が入っていた場合は消す
	numeric = numeric.replace(",","");
	//数値化できるか判定
	if(isNaN(numeric)){
		throw "RITS.num2fig:引数が数値化できません";
		return;
	}
	//数値化して文字に戻す
	numeric = (numeric * 1) + "";
	//マイナスがある場合は、確保し削除
	var containtMinus = false;
	if(numeric.substr(0,1)=="-"){
		containtMinus = true;
		numeric = numeric.replace(/^-/,"");
	}
	//小数点で区分し保持
	var numSplited = numeric.split(".");
	//小数点より前の部分を後ろから検索し、3桁ごとにカンマを入れる
	var res = "";
	for(var i=0,max=numSplited[0].length; i < max; i++){
		var ii = numSplited[0].length - i - 1;
		if(i % 3 == 0 && i != 0){
			res = "," + res;
		}
		res = numSplited[0].substr(ii,1) + res;
	}
	//一番初めに","がある場合は削除
	res = res.replace(/^,/,"");
	//小数点とマイナスがそれぞれあればつける
	if(1 < numSplited.length){
		res += "." + numSplited[1];
	}
	if(containtMinus){
		res = "-" + res;
	}
	return res;
}

/**
 * UUID.js: The RFC-compliant UUID generator for JavaScript.
 *
 * @fileOverview
 * @author  LiosK
 * @version 3.2 beta
 * @license The MIT License: Copyright (c) 2010 LiosK.
 */

// Core Component {{{

/** @constructor */
RITS.UUID = function(){};
(function(){
var UUID = RITS.UUID;

/**
 * The simplest function to get an UUID string.
 * @returns {string} A version 4 UUID string.
 */
UUID.generate = function() {
  var rand = UUID._getRandomInt, hex = UUID._hexAligner;
  return  hex(rand(32), 8)          // time_low
        + "-"
        + hex(rand(16), 4)          // time_mid
        + "-"
        + hex(0x4000 | rand(12), 4) // time_hi_and_version
        + "-"
        + hex(0x8000 | rand(14), 4) // clock_seq_hi_and_reserved clock_seq_low
        + "-"
        + hex(rand(48), 12);        // node
};

/**
 * Returns an unsigned x-bit random integer.
 * @param {int} x A positive integer ranging from 0 to 53, inclusive.
 * @returns {int} An unsigned x-bit random integer (0 <= f(x) < 2^x).
 */
UUID._getRandomInt = function(x) {
  if (x <   0) return NaN;
  if (x <= 30) return (0 | Math.random() * (1 <<      x));
  if (x <= 53) return (0 | Math.random() * (1 <<     30))
                    + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
  return NaN;
};

/**
 * Returns a function that converts an integer to a zero-filled string.
 * @param {int} radix
 * @returns {function(num&#44; length)}
 */
UUID._getIntAligner = function(radix) {
  return function(num, length) {
    var hex = num.toString(radix), i = length - hex.length, z = "0";
    for (; i > 0; i >>>= 1, z += z) { if (i & 1) { hex = z + hex; } }
    return hex;
  };
};

UUID._hexAligner = UUID._getIntAligner(16);

// }}}

// UUID Object Component {{{

/**
 * Names of each UUID field.
 * @type string[]
 * @constant
 * @since 3.0
 */
UUID.FIELD_NAMES = ["timeLow", "timeMid", "timeHiAndVersion",
                    "clockSeqHiAndReserved", "clockSeqLow", "node"];

/**
 * Sizes of each UUID field.
 * @type int[]
 * @constant
 * @since 3.0
 */
UUID.FIELD_SIZES = [32, 16, 16, 8, 8, 48];

/**
 * Generates a version 4 {@link UUID}.
 * @returns {UUID} A version 4 {@link UUID} object.
 * @since 3.0
 */
UUID.genV4 = function() {
  var rand = UUID._getRandomInt;
  return new UUID()._init(rand(32), rand(16), // time_low time_mid
                          0x4000 | rand(12),  // time_hi_and_version
                          0x80   | rand(6),   // clock_seq_hi_and_reserved
                          rand(8), rand(48)); // clock_seq_low node
};

/**
 * Converts hexadecimal UUID string to an {@link UUID} object.
 * @param {string} strId UUID hexadecimal string representation ("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
 * @returns {UUID} {@link UUID} object or null.
 * @since 3.0
 */
UUID.parse = function(strId) {
  var r, p = /^(?:urn:uuid:|\{)?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{2})([0-9a-f]{2})-([0-9a-f]{12})(?:\})?$/i;
  if (r = p.exec(strId)) {
    return new UUID()._init(parseInt(r[1], 16), parseInt(r[2], 16),
                            parseInt(r[3], 16), parseInt(r[4], 16),
                            parseInt(r[5], 16), parseInt(r[6], 16));
  } else {
    return null;
  }
};

/**
 * Initializes {@link UUID} object.
 * @param {uint32} [timeLow=0] time_low field (octet 0-3).
 * @param {uint16} [timeMid=0] time_mid field (octet 4-5).
 * @param {uint16} [timeHiAndVersion=0] time_hi_and_version field (octet 6-7).
 * @param {uint8} [clockSeqHiAndReserved=0] clock_seq_hi_and_reserved field (octet 8).
 * @param {uint8} [clockSeqLow=0] clock_seq_low field (octet 9).
 * @param {uint48} [node=0] node field (octet 10-15).
 * @returns {UUID} this.
 */
UUID.prototype._init = function() {
  var names = UUID.FIELD_NAMES, sizes = UUID.FIELD_SIZES;
  var bin = UUID._binAligner, hex = UUID._hexAligner;

  /**
   * List of UUID field values (as integer values).
   * @type int[]
   */
  this.intFields = new Array(6);

  /**
   * List of UUID field values (as binary bit string values).
   * @type string[]
   */
  this.bitFields = new Array(6);

  /**
   * List of UUID field values (as hexadecimal string values).
   * @type string[]
   */
  this.hexFields = new Array(6);

  for (var i = 0; i < 6; i++) {
    var intValue = parseInt(arguments[i] || 0);
    this.intFields[i] = this.intFields[names[i]] = intValue;
    this.bitFields[i] = this.bitFields[names[i]] = bin(intValue, sizes[i]);
    this.hexFields[i] = this.hexFields[names[i]] = hex(intValue, sizes[i] / 4);
  }

  /**
   * UUID version number defined in RFC 4122.
   * @type int
   */
  this.version = (this.intFields.timeHiAndVersion >> 12) & 0xF;

  /**
   * 128-bit binary bit string representation.
   * @type string
   */
  this.bitString = this.bitFields.join("");

  /**
   * UUID hexadecimal string representation ("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
   * @type string
   */
  this.hexString = this.hexFields[0] + "-" + this.hexFields[1] + "-" + this.hexFields[2]
                 + "-" + this.hexFields[3] + this.hexFields[4] + "-" + this.hexFields[5];

  /**
   * UUID string representation as a URN ("urn:uuid:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").
   * @type string
   */
  this.urn = "urn:uuid:" + this.hexString;

  return this;
};

UUID._binAligner = UUID._getIntAligner(2);

/**
 * Returns UUID string representation.
 * @returns {string} {@link UUID#hexString}.
 */
UUID.prototype.toString = function() { return this.hexString; };

/**
 * Tests if two {@link UUID} objects are equal.
 * @param {UUID} uuid
 * @returns {bool} True if two {@link UUID} objects are equal.
 */
UUID.prototype.equals = function(uuid) {
  if (!(uuid instanceof UUID)) { return false; }
  for (var i = 0; i < 6; i++) {
    if (this.intFields[i] !== uuid.intFields[i]) { return false; }
  }
  return true;
};

// }}}

// UUID Version 1 Component {{{

/**
 * Generates a version 1 {@link UUID}.
 * @returns {UUID} A version 1 {@link UUID} object.
 * @since 3.0
 */
UUID.genV1 = function() {
  var now = new Date().getTime(), st = UUID._state;
  if (now != st.timestamp) {
    if (now < st.timestamp) { st.sequence++; }
    st.timestamp = now;
    st.tick = UUID._getRandomInt(4);
  } else if (Math.random() < UUID._tsRatio && st.tick < 9984) {
    // advance the timestamp fraction at a probability
    // to compensate for the low timestamp resolution
    st.tick += 1 + UUID._getRandomInt(4);
  } else {
    st.sequence++;
  }

  // format time fields
  var tf = UUID._getTimeFieldValues(st.timestamp);
  var tl = tf.low + st.tick;
  var thav = (tf.hi & 0xFFF) | 0x1000;  // set version '0001'

  // format clock sequence
  st.sequence &= 0x3FFF;
  var cshar = (st.sequence >>> 8) | 0x80; // set variant '10'
  var csl = st.sequence & 0xFF;

  return new UUID()._init(tl, tf.mid, thav, cshar, csl, st.node);
};

/**
 * Re-initializes version 1 UUID state.
 * @since 3.0
 */
UUID.resetState = function() {
  UUID._state = new UUID._state.constructor();
};

/**
 * Probability to advance the timestamp fraction: the ratio of tick movements to sequence increments.
 * @type float
 */
UUID._tsRatio = 1 / 4;

/**
 * Persistent state for UUID version 1.
 * @type UUIDState
 */
UUID._state = new function UUIDState() {
  var rand = UUID._getRandomInt;
  this.timestamp = 0;
  this.sequence = rand(14);
  this.node = (rand(8) | 1) * 0x10000000000 + rand(40); // set multicast bit '1'
  this.tick = rand(4);  // timestamp fraction smaller than a millisecond
};

/**
 * @param {Date|int} time ECMAScript Date Object or milliseconds from 1970-01-01.
 * @returns {object}
 */
UUID._getTimeFieldValues = function(time) {
  var ts = time - Date.UTC(1582, 9, 15);
  var hm = ((ts / 0x100000000) * 10000) & 0xFFFFFFF;
  return  { low: ((ts & 0xFFFFFFF) * 10000) % 0x100000000,
            mid: hm & 0xFFFF, hi: hm >>> 16, timestamp: ts };
};

// }}}

// Backward Compatibility Component {{{

/**
 * Reinstalls {@link UUID.generate} method to emulate the interface of UUID.js version 2.x.
 * @since 3.1
 * @deprecated Version 2.x. compatible interface is not recommended.
 */
UUID.makeBackwardCompatible = function() {
  var f = UUID.generate;
  UUID.generate = function(o) {
    return (o && o.version == 1) ? UUID.genV1().hexString : f.call(UUID);
  };
  UUID.makeBackwardCompatible = function() {};
};
// }}}

// vim: et ts=2 sw=2 fdm=marker fmr&
Array.prototype.indexOf = function(obj){
	var counter = 0;
	var ret = -1;
	this.each(function(){
		if(this == obj){
			ret = counter;
		}
		counter++;
	});
	return ret;
};
})();

RITS.getUrlVars = function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i <hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}