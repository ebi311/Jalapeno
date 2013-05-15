/*jshint forin:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, unused:true, curly:true, browser:true, indent:4, maxerr:50 */
/*global requestScope:true, viewScope:true, getComponent:true, com:true, getClientId:true, compositeData:true, toJson:true */
/**
 * @fileOverview XPages標準のViewPanelを拡張するカスタムコントロールの、主要コンポーネントです。
 * @version 2013.01.10.001
 * 2013.01.09.002 : 初版
 * 2013.01.10.001 : カテゴリ開閉時にスクロール位置を保持する
 *                  クライアントスクリプトで既読の表示変更と該当文書へのスクロールを行う
 */
print('viewtable:' + applicationScope.get('RITS'))
var RITS = applicationScope.get('RITS') || {};
/**
 * 拡張テーブルビュー
 * @namespace
 */
RITS.ViewTablePlus = RITS.ViewTablePlus || {};
/*
RITS.ViewTablePlus.getManager = function () {
    var _this = requestScope.get('RITS.ViewTablePlus.Manager');
    if (_this instanceof RITS.ViewTablePlus.Manager) {
        return _this;
    } else {
        throw 'viewScope.get("RITS.ViewTablePlus")で予想外のオブジェクトが取得されました。';
    }
};*/
/**
 * カスタムコントロールの拡張ビューテーブルを値の取得や操作をするためのクラスです。<br/>
 * このクラスは、外部からnewされることを想定していません。<br/>
 * RITS.ViewTablePlus.Manager#getInstance (静的メソッド) でオブジェクトを取得してください。
 * @class
 */
RITS.ViewTablePlus.Manager = function () {
    if (!(this instanceof RITS.ViewTablePlus.Manager)) {
        return new RITS.ViewTablePlus.Manager();
    }
    var _gControles = [],
        _this,
        _idList = [];
    //RequestScopeの範囲でシングルトンなオブジェクトとする。
    //2回目以降の呼び出しは、インスタンスを生成せずに、requestScopeから取得する。
    //ViuewScopeにしたいが、シリアライズできないため、値を格納できない。
    if (requestScope.containsKey('RITS.ViewTablePlus.Manager')) {
        _this = requestScope.get('RITS.ViewTablePlus.Manager');
        if (_this instanceof RITS.ViewTablePlus.Manager) {
            return _this;
        } else {
            throw 'viewScope.get("RITS.ViewTablePlus")で予想外のオブジェクトが取得されました。';
        }
    }
    _this = this;
    /**
     * ※この関数は、カスタムコントロール内から呼ばれるものです。使用しないでください。
     * 本管理オブジェクトにコントロールを追加します。
     * @inner
     * @param controle UIIncludeCompositeオブジェクトを指定します。カスタムコントロールのページイベント処理でthisで参照できます。
     * @exsample
     * // カスタムコントロールのbeforPageLoadにて
     * var _this = this;
     * (function () {
     * 　　　　RITS.ViewTablePlus._addControle(_this);
     * })();
     */
    _this._addControle = function (controle) {
        var _ctrl = new RITS.ViewTablePlus.Controle(controle);
        _gControles.push(_ctrl);
        _idList.push(controle.getId());
        viewScope.put('RITS.ViewTablePlus.idList', _idList);
        return _ctrl;
    };
    /**
     * ViewTablePlusのコントロールオブジェクトを配列で返します。
     * コントロールオブジェクトは、カスタムコントロールのクラスそのものではなく、ラップされたクラス「RITS.ViewTablePlus.Controle」のオブジェクトです。
     * @returns {Array} RITS.ViewTablePlus.Controleクラスのオブジェクトの配列
     */
    this.getControleList = function () {
        return _gControles;
    };
    /**
     * ViewTablePlusのコントロールオブジェクトを取得します。
     * @param {Object} arg　カスタムコントロールオブジェクトを指定します。
     * @return {RITS.ViewTablePlus.Controle} RITS.ViewTablePlus.Controleクラスのオブジェクト
     */
    this.getControle = function (arg) {
        var _ctrl;
        if (arg.getClass().getName() === 'com.ibm.xsp.component.UIIncludeComposite') {
            for (var i = 0, max = _gControles.length; i < max; i++) {
                _ctrl = _gControles[i];
                if (_ctrl.controle === arg) {
                    return _ctrl;
                }
            }
            //ポストバック時には、初期処理でオブジェクトが作成されていない。
            //そのため、取得時に作成する。
            _ctrl = this._addControle(arg);
            return _ctrl;
        } else {
            throw '引数が不正です。カスタムコントロールオブジェクトを渡してください。';
        }
    };
    //ViewScopeに格納
    requestScope.put('RITS.ViewTablePlus.Manager', this);
};

/**
 * カスタムコントロールの拡張ビューテーブルを値の取得や操作をするためのオブジェクトを取得します。
 * @static
 * @function
 */
RITS.ViewTablePlus.Manager.getInstance = function () {
    var _this = requestScope.get('RITS.ViewTablePlus.Manager');
    if (_this instanceof RITS.ViewTablePlus.Manager) {
        return _this;
    } else {
        print('manager:' + _this);
        throw 'viewScope.get("RITS.ViewTablePlus")で予想外のオブジェクトが取得されました。';
    }
};
RITS.ViewTablePlus.Manager.afterPageLoad = function (_this) {
    var _manager = new RITS.ViewTablePlus.Manager(),
        _controle = _manager.getControle(_this),
        _params, _viewName,
        properties = getComponent("properties");
    //dojoType等属性の設定
    _controle._setDijit();
    //dijitパラメータの設定
    //クライアントScript側でdijit初期時にオプションをセットする。
    //オプションの値は、非表示inputに格納し、dijit初期処理はこれを参照する。
    _viewName = _controle.getViewName(),
    _params = {
        bodyHeight: compositeData.bodyHeight,
        checkBoxValueBox: getClientId('checkedValues'),
        isFixedHeader: compositeData.isFixedHeader,
        isOpenWindow: compositeData.isOpenWindow,
        targetViewName: _viewName,
        scrollY_Position: getClientId('scrollY_Position')
    };
    properties.setValue(toJson(_params));
    //ViewPanelのデフォルトの1ページ毎表示行数の設定
    _controle._setRows(compositeData.defaultRowNumberAtPage);
};
/**
 * カスタムコントロールのアクセサクラス<br/>
 * このクラスは、外部からnewされることを想定していません。
 * RITS.ViewTablePlus.ManagerオブジェクトのgetControleListまたはgetControlメソッドで本クラスのオブジェクトを取得します。
 * @class
 */
RITS.ViewTablePlus.Controle = function (controle) {
    var _viewName = '',
        _viewControle = null,
        _obj, controles, max, i, _cname,
        _this = this;
    //newを強制する定石パターン
    if (!(this instanceof RITS.ViewTablePlus.Controle)) {
        return new RITS.ViewTablePlus.Controle();
    }
    /**
     * 編集可能領域にセットされたViewPanelコントロールオブジェクトを取得できます。
     * @return {com.ibm.xsp.component.xp.XspViewPanel} 編集可能領域にセットされたViewPanelコントロールオブジェクト
     */
    this.getViewPanel = function () {
            if (_viewControle === null) {
                controles = _this.controle.getChildren();
                max = controles.size();
                for (i = 0; i < max; i++) {
                    _obj = controles[i];
                    _cname = _obj.getClass().getName();
                    if (_cname === 'com.ibm.xsp.component.xp.XspViewPanel') {
                        _viewControle = _obj;
                        break;
                    }
                }
            }
            return _viewControle;
        };
    /**
     * カスタムコントロールオブジェクトを取得できます。変更はしないでください。
     * @property {com.ibm.xsp.component.UIIncludeComposite} カスタムコントロールオブジェクト getComponent(id:string)で取得できるものと同様です。
     */
    this.controle = controle;
    /**
     * カスタムコントロールオブジェクトのIDを取得できます。変更はしないでください。
     * @property {String} カスタムコントロールオブジェクトのID
     */
    this.id = controle.getId();
    /**
     * ViewPanelのチェックボックスにチェックを入れた文書のNoteIDを配列で返します。
     * @return {Array} チェックを入れた文書のNoteID（String）の配列
     */
    this.getSelectedNoteIds = function () {
        var value = _this.controle.findComponent('checkedValues').getValue();
        return value.split(',');
    };
    /**
     * ViewPanelで文書を選択状態にします。<br/>
     * 呼び出し以前の選択項目は消去され、指定されたNoteIDのみ選択状態となります。<br/>
     * NoteIDの文書存在チェックは行われません。
     * @param {Array|String} ids 選択する文書のNoteID。単一の文字列か、
     * 文字列の配列を渡すことができます。
     * 単一の文字列の場合は、カンマ区切りで複数登録することもできます。
     */
    this.setSelectedNoteIds = function (ids) {
        var value = '';
        if (ids instanceof Array) {
            value = ids.join(',');
        } else if (typeof(ids) === 'string') {
            value = ids;
        } else {
            throw '引数は文字列の配列か、文字列のみが有効です。';
        }
        _this.controle.findComponent('checkedValues').setValue(value);
    };
    /**
     * 本カスタムコントロールの編集可能領域にセットされたViewPanelのデータソースとなっている、NotesView名を取得できます。
     * @return {String} ViewPanelのデータソースのNotesView名
     */
    this.getViewName = function () {
        if (_viewName === '') {
            _viewName = _this.getViewPanel().getDataSource().getViewName();
        }
        return _viewName;
    };
    this._setDijit = function () {
        var _obj = _this.getViewPanel();
        _obj.addAttr(new com.ibm.xsp.complex.Attr('dojoType', 'rits.widget.ViewTablePlus'));
        _obj.addAttr(new com.ibm.xsp.complex.Attr('options', getClientId('properties')));
        //初期は非表示とし、ヘッダ固定等の初期処理が完了してから表示する。
        _obj.setDataTableStyle('display:none;');
        
    };
    this._setRows = function (num) {
        var _view = _this.getViewPanel();
        if (num === -1) {
            num = Number.MAX_VALUE;
        }
        _view.setRows(num);
    };
    this._setSearch = function (string) {
        var _view = _this.getViewPanel();
        if(string !== ""){
	        _view.getData().setSearch(string);
        }else{
            _view.getData().setSearch(null);
        }
    }
};
applicationScope.put('RITS', RITS);