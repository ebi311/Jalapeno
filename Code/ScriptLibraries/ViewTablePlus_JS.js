/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50, plusplus:true */
/*global dojo:true, dijit:true */
// JSHINT チェック済み http://www.jshint.com/ */
dojo.provide('rits.widget.ViewTablePlus');
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.declare('rits.widget.ViewTablePlus', [dijit._Widget, dijit._Templated], {
/* ViewTablePlus ver 0.9.2
 * 機能1 ヘッダの分離と、ボディー部のスクロール
 * ビューコントロールは、テーブルが入れ子になっており、本体は内部のテーブルである
 * このテーブルを複製し、元のほうをヘッダ表示のテーブルとしてtbodyを削除
 * 複製したテーブルをボディー表示のテーブルとして、theadを削除する
 * ボディー用テーブルは、DIVで囲む。DIVでは指定した高さでoverflow:scrollを定義する。
 * 
 * 機能2 チェック項目の記憶
 * 通常、テーブル内のチェックボックスは、サーバーでバインドされないためカテゴリを開閉した時のAjax処理でチェックが消えてしまう。またページャーで移動した時もきえる。
 * このdijitは、チェックボックスにイベント処理を仕込み、チェックした項目を記憶する。
 * テーブルの前にinput[type=hidden]のボックスが生成され、選択した項目はここに保存される。
 * そのため、カテゴリを閉じていたり、ベージャーで別のページを表示していても、POSTで値が送られる。
 * POST時の名称は、内側のテーブルのクライアントID+"_checked"となっている。
 * 例(view:_id1:viewPanel1_checked)
 * 値はカンマ区切りとなっている。
 * ※注意!!※ラジオボタンの値に","が含まれる場合は考慮していない。
 * 
 * 前提条件・制約事項
 * ・Domino 8.5.3 FP3で検証済み
 * ・ブラウザはIE7、chromeで検証済み
 * ・列の幅を揃えるため、tabel-layout:fixedを指定しているが、これはテーブルの一番上の行の幅を基準とするため、
 * 一番上の行がカテゴリによってマージされていると、全体が崩れてしまう。
 * そのため、ボディーの一番上に空行を追加している。この行は visibility:hidden としているが、
 * スクリプトで行を走査する場合は注意すること。 
 * ・列の幅は、ヘッダで指定されていること。ボディー部は無視される。
 * ・列の幅は、1つを除いてすべて設定されていること。単位(px, em, %など)は任意で良い。
 * ・チェックボックスは、1行に1つのみとすること。
 * 
 * 使い方
 * スクリプトライブラリに、JSファイルをインポートする。
 * XPageでリソースとして、JSファイルを指定する。
 * XPageのページのプロパティで、「dojo」→「ロード時にDojo解析をトリガー」をOnにする。
 * XPageで適用するビューコントロールの「すべてのプロパティ」→「attrs」に下記の2項目を追加する。
 *      name="dojoType" , value="rits.widget.ViewTablePlus"
 *      name="bodyHeight" , value="20em"
 * 
 * チェックボックスにJavaScriptでcheckedをセットした場合、イベントが動かないのでチェック情報が更新されません。
 * 強制的に更新する関数「resettingCheckBox」を用意していますので、JavaScriptで更新した後に、コールしてください。
 * その場合、#{id:table1} の後ろに"_OUTER_TABLE"をつけてください。
 * 例)dijit.byId('view:_id1:viewPanel1_OUTER_TABLE').resettingCheckBox();
 */
        bodyHeight: '150px',
        checkBoxValueBox: null,
        isFixedHeader: false,
        isOpenWindow: false,
        targetViewName: '',
        scrollY_PositionBox: null,
        options: '',
        _headerTable: null,
        _bodyTable: null,
        postMixInProperties: function () {
            var _optionsObj = dojo.byId(this.options),
                _options;
            _options = dojo.fromJson(_optionsObj.value);
            this.bodyHeight = _options.bodyHeight;
            this.isFixedHeader = _options.isFixedHeader;
            this.isOpenWindow = _options.isOpenWindow;
            this.checkBoxValueBox = dojo.byId(_options.checkBoxValueBox);
            this.targetViewName = _options.targetViewName;
            this.scrollY_PositionBox = dojo.byId(_options.scrollY_Position);
        },
        buildRendering: function buildRendering() {
            var _sourceTable,
            _tempElements,
            _this = this,
            _checkValues = [],
            _fixHeader = function _fixHeader() {
                var _outerTd, _outerDiv, _thead,
                    _thWidth = [], _ths;
                //ボディー部を取得
                _this._bodyTable = $(_tempElements[0]);
                //ヘッダテーブルを作成する
                _this._headerTable = $('<table></table>')
                                    .insertBefore(_this._bodyTable);
                //テーブルの属性をコピーする
                //IE7以下はattributesの戻り値がおかしいので、class と styleだけをコピーの対象とする
                if (_this._bodyTable[0]['hasAttribute'] === undefined) {
                    _this._headerTable.attr('style', _this._headerTable.attr('style'));
                    _this._headerTable.attr('class', _this._headerTable.attr('class'));
                } else {
                    $.each(_this._bodyTable[0].attributes, function (key, value){
                        if (value.name !== 'id') {
                            _this._headerTable.attr(value.name, value.value);
                        }
                    });
                }
                //ヘッダ行をボディー部から移動(コピー＆削除)する
                $('thead:first-child', _this._bodyTable).clone(true).appendTo(_this._headerTable);
                $('thead:first-child > tr > th', _this._bodyTable)
                    .empty()
                    .css({'visibility':'hidden', 'height':'1px'});
                //セルの内容によって列幅が変わらないようにする。
                _this._headerTable.css('tableLayout', 'fixed')
                                  .addClass('viewTablePlus');
                _this._bodyTable.css('tableLayout', 'fixed')
                                .addClass('viewTablePlus');
                //ヘッダ行のwidthをボディーのtdに反映するため、列のインデックスごとに幅を配列に格納する
                $('tr > th', _this._headerTable).each(function (index) {
                    var _this = $(this);
                    //thのdivにもwidthが入ってしまうので除去
                    $('div:first-child', _this).css('width', 'auto');
                    //幅を配列にセット
                    _thWidth.push(_this.width());
                });
                //bodyテーブルの埋め込み
                _outerTd = _this._headerTable[0].parentNode;
                //スクロールを実施するために、divで囲う
                _outerDiv = dojo.create('div',
                    { style: { 
                        height: _this.bodyHeight,
                        overflow: 'scroll',
                        overflowY: 'scroll',
                        overflowX: 'hidden'
                    }
                }, _outerTd);
                dojo.place(_this._bodyTable[0], _outerDiv, 'last');
                dojo.place(_outerDiv, _outerTd, 'last');
                //部分更新時にスクロールの位置を覚えておく
                //onscrollイベントで最新のスクロール位置を補足しておく
                _outerDiv.onscroll = function () {
                    var _timer = null;
                    _timer = setTimeout(function () {
                        if (_timer !== null) {
                            clearTimeout(_timer);
                        }
                        _this.scrollY_PositionBox.value = Number(_outerDiv.scrollTop);
                    }, 100);
                };
            },
            _linkAdded = function () {
                $(_this._bodyTable).on('click', 'a.xspLinkViewColumn', function (){
                    var _href = this.href, _windowName = '_blank';
                    //リンクに?をつける。すでにある場合は、無視する xspLinkViewColumn
                    if (!(/\?/.test(_href))) {
                        _href += '?';
                    } else {
                        _href += '&';
                    }
                    //対象ビューをGETパラメータで渡す
                    _href += 'viewName=' + _this.targetViewName;
                    _href += '&dijitId=' + _this.id;
                    //ヘッダ無しで開く
                    _href += '&noheader=true';
                    //別ウィンドウで開く場合は、window nameをつける。
                    if (_this.isOpenWindow === true) {
                        //DocumentIDを取得する
                        _reg = new RegExp("\\?(.*)$");
                        _reg.exec(_href);
                        _gets = RegExp.$1.split('&');
                        dojo.forEach(_gets, function (e) {
                            var a = e.split('=');
                            if (a[0] === 'documentId') {
                                _windowName = a[1];
                            }
                        });
                    }
                    window.open(_href, _windowName);
                    return false;
                });
            };
            //処理ここから
            _sourceTable = _this.srcNodeRef;
            //対象テーブルの取得
            _tempElements = dojo.query('.xspDataTable', _sourceTable);
            if (_tempElements.length === 0) {
                throw "target table not found!!";
            }
            if (_tempElements.length !== 1) {
                throw "target table many found!!";
            }
            //this._bodyTable は、ヘッダ固定の場合テーブルがわかれるので、
            //_fixHeader処理で、上書きしている。
            _this._bodyTable = $(_tempElements[0]);
            //ヘッダ固定処理
            if (this.isFixedHeader === true) { _fixHeader(_tempElements); }
            //リンクにtargetとビューIDをつける
            _linkAdded();
            
            //チェックボックス処理
            _checkValues = _this.checkBoxValueBox.value.split(',');
            dojo.place(_this.checkBoxValueBox, _sourceTable, 'before');
            //チェックボックスにチェックした時にチェックを入れ、外した時にチェックを入れる
            //というイベント処理を追加する
            //ついでにテキストボックスから、前の選択項目を取得して、チェックを付ける
            $(_this._bodyTable).on('change', ':checkbox', function (){
                var _checkValues = _this.checkBoxValueBox.value.split(','),
                    _exist = dojo.indexOf(_checkValues, this.value) !== -1,
                    _currentValue = this.value;
                if (this.checked === true) {
                    if (_exist === false) {
                        _checkValues.push(_currentValue);
                    }
                } else {
                    if (_exist === true){
                        _checkValues = dojo.filter(_checkValues, function (e1) {
                            return e1 !== _currentValue;
                        });
                    }
                }
                _this.checkBoxValueBox.value = _checkValues.join(',');
            });
            $(':checkbox', _this._bodyTable).each(function (index){
                $(this).prop('checked', dojo.indexOf(_checkValues, this.value) !== -1);
            });
            //FukokuOriginal
            (function(){
                var colCount = $("th", _this._bodyTable).length;
                $("tr", _this._bodyTable).each(function(){
                    var tdCount = $("td", this).length,
                        lastTd = $("td:last", this),
                        setCol = (colCount - tdCount + 1);
                    if (setCol === 1) {
                        lastTd.removeAttr("colSpan");
                    } else {
                        lastTd.attr("colSpan", (colCount - tdCount + 1));
                    }
                });
            })();

            //テーブルを表示する
            if (dojo.isIE === 7) {
                dojo.query('table', _sourceTable).style('display', 'block');
            } else {
                dojo.query('table', _sourceTable).style('display', 'table');
            }
        },
        startup: function () {
            var _this = this;
            if (this._started) {
                return;
            }
            if (this._headerTable !== null && this._bodyTable !== null) {            
            //スクロールバーの分だけ、ボディーテーブルの幅が短くなるので、ヘッダテーブルを揃える
                //IEの場合はずれる
                //if (!dojo.isIE) {
                    dojo.style(this._headerTable[0], 'width', dojo.style(this._bodyTable[0], 'width') + 'px');
                //}
            }
            //スクロール位置戻す
            var _outerDiv = this._bodyTable[0].parentElement;
            _outerDiv.scrollTop = this.scrollY_PositionBox.value;
            $(_this._bodyTable).on('click', '.xspPagerContainer > div a', function (){
                _this.scrollY_PositionBox.value = '0';
            });
            /*dojo.query('.xspPagerContainer > div a')
                .connect('onclick', function () {
                    _this.scrollY_PositionBox.value = '0';
                });
            */
        },
        resettingCheckBox: function (that) {
            if (!that) { that = this; }
            var _value = that.checkBoxValueBox.value,
                _values = _value === '' ? [] : _value.split(',');
            //イベント呼び出しの場合は、thisがwindowオブジェクトになる。
            if (!that._bodyTable[0]) { return; }
            //チェックのついていない項目を削除する
            //チェックのついている項目を追加する
            dojo.query('input[type=checkbox]', that._bodyTable[0]).forEach(function (e) {
                if (e.checked === true) {
                    if (dojo.indexOf(_values, e.value) === -1) {
                        _values.push(e.value);
                    }
                } else {
                    _values = dojo.filter(_values, function (e1) {
                        return e1 !== e.value;
                    });
                }
            });
            //項目のない値はそのまま
            that.checkBoxValueBox.value = _values.join(',');
        },
        markRead: function (unid) {
            var _target, _position, _outerDiv, _outerDivPosition;
            _target = $('[href*=' + unid + ']', this._bodyTable)
                        .parentsUntil('tbody', 'tr')
                        .remove('xspDataTableRowUnread')
                        .addClass('xspDataTableRowRead');
            //スクロールさせる
            if (this.isFiedHeader === true && _target.length !== 0) {
                _position = dojo.position(_target[0]);
                _outerDiv = this._bodyTable[0].parentElement;
                _outerDivPosition = dojo.position(_outerDiv);
                _outerDiv.scrollTop += _position.y - _outerDivPosition.y;
            }
        }
    }
);
var RITS = RITS || {};
RITS.ViewTablePlus = RITS.ViewTablePlus || {};
RITS.ViewTablePlus.markRead = function (dijitId, unid) {
    var table = dijit.byId(dijitId);
    table.markRead(unid);
};