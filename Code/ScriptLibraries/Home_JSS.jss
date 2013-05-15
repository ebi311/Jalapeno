var home = {};
home.Controller = function(){
    if(!(this instanceof home.Controller)){
        return new home.Controller();
    }
    var _this = this;
    this.indexToName = (function(){
        var _ret = applicationScope.get('indexToName'),
            _view, _doc;
        if(!_ret){
            _view = database.getView('SettingDoc');
            _doc = _view.getFirstDocument();
            _ret = {
               0: _doc.getItemValueString('textCounter00'),
               1: _doc.getItemValueString('textCounter01'),
               2: _doc.getItemValueString('textCounter02'),
               3: _doc.getItemValueString('textCounter03'),
               4: _doc.getItemValueString('textCounter04'),
               5: _doc.getItemValueString('textCounter05'),
               6: _doc.getItemValueString('textCounter06'),
               7: _doc.getItemValueString('textCounter07'),
               8: _doc.getItemValueString('textCounter08'),
               9: _doc.getItemValueString('textCounter09'),
               10: _doc.getItemValueString('textCounter10')
            }
        }
        return _ret;
    })();
    this.sum = (function(){
        var _view = database.getView('byDate'),
            _nav = _view.createViewNav(),
            _lastEntry = _nav.getLast(),
            _colVal = _lastEntry.getColumnValues(),
            _ret = [['名前','合計']];
        for(var i = 0; i < 8; i++){
            _ret.push([
				_this.indexToName[i],
				_colVal[i+2]
                       ]);
        }
        return _ret;
    })();
    print('sum:' + this.sum);
};