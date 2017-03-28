$(function(){

var lei = new saolei({});
lei.init();

});

var saolei = function(options){

    var  defaultOptions = {
            area:'#area',
            xnum:10,//横轴数
            ynum:10,//纵轴数
            bnum:20,//炸弹个数
            success:function(){
                alert('success');
            },
            fail:function(){
                alert('fail');
            }
        };
    this.options = $.extend(defaultOptions, options);
    this._leftNum = this.options.bnum;
    this._realLeftNum = this.options.bnum;
    //是否初始化了雷
    this._isInitLei = false;
    this._isFinish = false;
    this.init = function(){
        var self = this;
        for (var i = 0; i <= self.options.xnum; i++) {
            for (var j = 0; j <=self.options.ynum; j++) {
                $(self.options.area).append($("<div class=\"item\">").attr("pos", i+","+j));
            }
            $(self.options.area).append("<p class=\"br\">");
        }
        // self.initLei();
        // self.initNum();
        self._bindEvent();

    };

    this._bindEvent = function(){
        var self = this;
        $(self.options.area).bind("contextmenu", function(){
            return false;
        });
        // $(self.options.area).find(".item").click(function(){

        // });
        $(self.options.area).find(".item").mousedown(function(e) {
            if(self._isFinish)
            {
                return;
            }
            var pos  = $(this).attr("pos");
            //右键为3
            if (3 == e.which) {
                if(!self._isInitLei)
                {
                    return;
                }
                if($(this).data("isopen"))
                {
                    return;
                }

                if($(this).data("isMarked")){
                    self._leftNum++;
                    $(this).data("isMarked", false);
                    if($(this).data("attribute") == "lei")
                    {
                        self._realLeftNum ++;
                    }
                    $(this).removeClass("marked");
                }else{
                    $(this).data("isMarked", true);
                    $(this).addClass("marked");
                    self._leftNum--;
                    if($(this).data("attribute") == "lei")
                    {
                        self._realLeftNum --;
                    }
                }

                if(self._realLeftNum == 0) {
                    self._isFinish = true;
                    self.options.success();
                    return;
                }

            } else if (1 == e.which) {
                if(!self._isInitLei)
                {
                    var nc = [pos];
                    //将周围的一些点排除
                    var cpx = parseInt(pos.split(",")[0]);
                    var cpy = parseInt(pos.split(",")[1]);
                    for (var i = cpx + 1; i >= cpx-1; i--) {
                        for (var j = cpy + 1; j >= cpy-1; j--) {
                            if(i < 0 || j < 0){
                                continue;
                            }
                            if(i > self.options.xnum || j > self.options.ynum ){
                                continue;
                            }
                            nc.push(i + "," + j);
                        }
                    }
                    self.initLei(nc);
                    self.initNum();
                }

                self.itemClick(pos.split(",")[0], pos.split(",")[1]);
            }
        });

        $(self.options.area).find(".item").dblclick(function(){
            if(self._isFinish)
            {
                return;
            }
            var pos  = $(this).attr("pos");
            self.doubleClick(parseInt(pos.split(",")[0]),parseInt(pos.split(",")[1]));
        });
    }

    this._shuffle = function(arr) {
        var i,j,temp;
        for (i = arr.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return arr;
    };
    //初始化雷
    //@param notInclude Array 指定不是雷的点，避免第一下就死掉
    this.initLei = function(notInclude){
        var self = this;
        self._isInitLei = true;
        var tempArr = [];
        var notMap = {};
        if(undefined == notInclude)
        {
            notInclude = [];
        }
        for (var i = notInclude.length - 1; i >= 0; i--) {
            notMap[notInclude[i]] = true;
        }
        $(self.options.area).find(".item").each(function(){
            var pos = $(this).attr("pos");
            if(!notMap[pos])
            {
                tempArr.push(pos);
            }

        });
        tempArr = self._shuffle(tempArr);
        for (var i = self.options.bnum - 1; i >= 0; i--) {
            var litem = $("[pos=\"" + tempArr[i] + "\"]");
            litem.data("attribute", 'lei');
            //litem.text('雷');
        }
    };

    //初始化其它元素
    this.initNum = function(){
        var self = this;
        for (var i = 0; i <= self.options.xnum; i++) {
            for (var j = 0; j <=self.options.ynum; j++) {
                if(self._isLei(i,j))
                {
                    continue;
                }
                var num = self._areaLeiNum(i,j);
                if(num == 0)
                {
                    //周围没有雷
                    $("[pos=\"" + i +","+ j + "\"]").data("attribute", 'blank');
                }else{
                    //周围有雷
                    $("[pos=\"" + i +","+ j + "\"]").data("attribute", 'area');
                }
                //$("[pos=\"" + i +","+ j + "\"]").text(num);
                $("[pos=\"" + i +","+ j + "\"]").data('bnum', num);

            }
        }
    };

    //判断当前元素是不是雷
    this._isLei = function(x,y){
        return $("[pos=\"" + x +","+ y + "\"]").data("attribute") == "lei";
    }

    //判断当前元素周围是否没雷
    this._isBlank = function(x,y){
        return $("[pos=\"" + x +","+ y + "\"]").data("attribute") == "blank";
    }

    //获取周围雷数量
    this._getNum = function(x,y){
        return $("[pos=\"" + x +","+ y + "\"]").data('bnum');
    }

    //计算元素周围雷的数量
    this._areaLeiNum = function(x, y){
        var num = 0;
        var self = this;
        //计算周围的8个点
        for (var i = x + 1; i >= x-1; i--) {
            for (var j = y + 1; j >= y-1; j--) {
                if(i < 0 || j < 0){
                    continue;
                }
                if(i > self.options.xnum || j > self.options.ynum ){
                    continue;
                }
                if(i==x && j==y){
                    continue;
                }
                if(self._isLei(i,j)){
                    num++;
                }
            }

        }
        return num;
    }

    //双击有数字的自动展开
    this.doubleClick = function(x,y){
        var self = this;
        var bnum = self._getNum(x,y);
        if(undefined == bnum || 0 == bnum)
        {
            return;
        }
        var mnum = self.getMarkNum(x,y);
        //当周围标记数量等于实际数量时自动查找
        if(mnum == bnum)
        {
            for (var i = x + 1; i >= x-1; i--) {
                for (var j = y + 1; j >= y-1; j--) {
                    if(i < 0 || j < 0){
                        continue;
                    }
                    if(i > self.options.xnum || j > self.options.ynum ){
                        continue;
                    }
                    if(!$("[pos=\"" + i +","+ j + "\"]").data("isMarked") && !$("[pos=\"" + i +","+ j + "\"]").data("isopen"))
                    {
                        if(!self.itemClick(i,j)){
                        }
                    }

                }
            }
        }

    }

    //查找周围已经被标记的雷的个数
    this.getMarkNum = function(x,y){
        var self = this;
        var mnum = 0;
        for (var i = x + 1; i >= x-1; i--) {
            for (var j = y + 1; j >= y-1; j--) {
                if(i < 0 || j < 0){
                    continue;
                }
                if(i > self.options.xnum || j > self.options.ynum ){
                    continue;
                }
                var item = $("[pos=\"" + i +","+ j + "\"]");
                if(item.data("isMarked")){
                    mnum ++;
                }
            }
        }
        return mnum;
    }

    //元素单击事件
    this.itemClick = function(x,y){
        var self = this;
        //点击雷
        if(self._isLei(x,y))
        {
            if($("[pos=\"" + x +","+ y + "\"]").data("isMarked"))
            {
                return;
            }
            $("[pos=\"" + x +","+ y + "\"]").addClass("marked");
            self._isFinish = true;
            self.options.fail();
            return false;
        }

        //点击周围有雷的
        if(self._getNum(x,y) > 0)
        {
            $("[pos=\"" + x +","+ y + "\"]").data('isopen', true);
            $("[pos=\"" + x +","+ y + "\"]").css({'background':'rgb(250, 250, 250)'});
            $("[pos=\"" + x +","+ y + "\"]").text(self._getNum(x,y));
            return true;
        }

        //点击空白的
        self._clickBlank(x,y);
        return true;

    }

    //点击一个空白的点
    this._clickBlank = function(x,y){
        x = parseInt(x);
        y = parseInt(y);

        var self = this;
        $("[pos=\"" + x +","+ y + "\"]").data('isopen', true);
        $("[pos=\"" + x +","+ y + "\"]").css({'background':'#fff'});
        for (var i = x + 1; i >= x-1; i--) {
            for (var j = y + 1; j >= y-1; j--) {
                if(i < 0 || j < 0){
                    continue;
                }
                if(i > self.options.xnum || j > self.options.ynum ){
                    continue;
                }

                var item = $("[pos=\"" + i +","+ j + "\"]");
                //没有被展开过
                if(!item.data('isopen'))
                {
                    item.data('isopen', true);
                    if(self._isBlank(i,j))
                    {
                        self._clickBlank(i,j);
                    }else{
                        item.css({'background':'rgb(250, 250, 250)'});
                        item.text(self._getNum(i,j));
                    }
                }

            }

        }

    }


}