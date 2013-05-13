var ContentManagement = function () {
    var contentTypeDoc;
    this.getContentTypeDoc = function () {
        var contentTypeCode, contentTypeView;
        if (!contentTypeDoc) {
            contentTypeCode = param.get("contentType") || "01";
            contentTypeView = database.getView("ContentTypes");
               contentTypeDoc = contentTypeView.getDocumentByKey(contentTypeCode);
        }
        return contentTypeDoc;
    }
    this.getContentTypeCode = function (){
        var doc = this.getContentTypeDoc();
        return doc.getItemValueString("Code");
    }
    this.getDutyName = function (code) {
        return this.duties[code];
    }
    this.duties = (function () {
        var dutiesView = database.getView('Duties'),
            entries = dutiesView.getAllEntries(),
            entry = entries.getFirstEntry(),
            colVals, ret = [];
        while(entry){
            colVals = entry.getColumnValues();
            ret[colVals[0]+""] = colVals[1];
            entry = entries.getNextEntry();
        }
        return ret;
    })();
    this.getFilterItems = function(){
        var notesView, nav, ent, duties, code, ret=["すべて|*"];
        notesView = database.getView(compositeData.notesViewName);
        nav = notesView.createViewNavMaxLevel(0);
        ent = nav.getFirst();
        duties = this.duties;
        while(ent){
            code = ent.getColumnValues().firstElement().toString();
            ret.push(duties[code] + '|' + code);
            ent = nav.getNextCategory ();
        }
        return ret.join('\n');
    }
}