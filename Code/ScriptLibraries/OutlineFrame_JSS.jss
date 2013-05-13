var OutlineFrame = {};

OutlineFrame.afterPageLoad = function (){
    OutlineFrame._setIeCompatible();
    
};
OutlineFrame.beforRenderResponse = function (){
    OutlineFrame._setIeCompatibleInHttpHeader();
}
OutlineFrame._setPageTitle = function(){
    
};
OutlineFrame._setIeCompatible = function(){
        var xuiComp = null;
        switch (compositeData.ieCompatible){
            case '7':
                xuiComp = 'IE=7';
                break;
            case '8':
                xuiComp = 'IE=8';
                break;
            case '9':
                xuiComp = 'IE=9';
                break;
            case '10':
                xuiComp = 'IE=edge';
                break;
            default:
                break;
        }
        viewScope.put('X-UA-Compatible', xuiComp);
};

OutlineFrame._setIeCompatibleInHttpHeader = function(){
    var response = facesContext.getExternalContext().getResponse(),
        xuiComp = viewScope.get('X-UA-Compatible');
    if(xuiComp !== null){
        response.setHeader("X-UA-Compatible", xuiComp);
    }
};