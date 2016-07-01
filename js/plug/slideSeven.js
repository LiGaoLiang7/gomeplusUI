function Slide(elementId, hasCtrlPoints, isFlip, isAutoPlay) {
    this.element = elementId;
    this.slideBox = null;
    this.shfirstChild = null;
    this.shlastChild = null;
    this.boxWidth = 0;
    this.offsetLeft = 0;
    this.count = 0;
    this.ctrlBox = null;
    this.intervalId = 0;
    Slide.prototype.init = function() {
        this.slideBox = document.getElementById(this.element);
        if (this.slideBox.childNodes.length > 0) { // 初始化变量 复制两个节点并插入 无限循环滚动使用
            this.count = this.slideBox.querySelectorAll('li').length;
            this.shfirstChild = this.slideBox.querySelector('li').cloneNode(true);
            this.shlastChild = this.slideBox.querySelectorAll('li:last-child')[0].cloneNode(true);
            this.slideBox.appendChild(this.shfirstChild);
            this.slideBox.insertBefore(this.shlastChild, this.slideBox.firstChild);
            this.boxWidth = this.shfirstChild.clientWidth;
            if (this.boxWidth !== 0 && this.count > 1) {
                this.slideBox.style.width = this.boxWidth * (this.count + 2) + 'px';
                this.offsetLeft = '-' + this.boxWidth + 'px';
                this.slideBox.style.left = this.offsetLeft;
            } else if (this.boxWidth !== 0 && this.count <= 1) {
                this.slideBox.style.width = this.boxWidth * this.count + 'px';
            }
        }
        if (hasCtrlPoints) { //添加小点点
            var ctrlBox = document.createElement('div');
            ctrlBox.className = "ctrlbox";
            for (var i = 0; i < this.count; i++) {
                var ctrlItem = document.createElement('span');
                ctrlItem.setAttribute('data-item', i);
                if (i === 0) ctrlItem.className = "active";
                ctrlBox.appendChild(ctrlItem);
            }
            this.slideBox.parentNode.appendChild(ctrlBox);
            this.ctrlBox = this.slideBox.parentNode.querySelector('.ctrlbox');
            this.addDotEvent();
        }
        if (isFlip) { // 添加两边的翻页箭头
            var prev = document.createElement('a'),
                next = document.createElement('a');
            prev.className = 'flip prev';
            next.className = 'flip next';
            this.slideBox.parentNode.appendChild(prev);
            this.slideBox.parentNode.appendChild(next);
            this.addFlipEvent();
        }
        if (isAutoPlay) { // 自动翻页 5秒
            this.setAutoPlay();
        }
    };
    Slide.prototype.activeCtrl = function(direction) { // 改变点点的状态
        if (this.ctrlBox === null) return;
        var ctrlItems = this.ctrlBox.querySelectorAll('span');
        var indexMark = 0;
        for (var i = 0; i < ctrlItems.length; i++) {
            if (ctrlItems.item(i).className === 'active') {
                ctrlItems.item(i).className = '';
                indexMark = i;
            }
        }
        indexMark += direction ? 1 : -1;
        indexMark = (indexMark === ctrlItems.length) ? 0 : indexMark;
        indexMark = (indexMark === -1) ? (ctrlItems.length - 1) : indexMark;
        ctrlItems.item(indexMark).className = 'active';
    };
    Slide.prototype.goNext = function() { // 向后翻
        this.offsetLeft = parseInt(this.offsetLeft) - this.boxWidth + 'px';
        this.slideLeft(this.offsetLeft);
        this.slideBox.className = 'slidebox transition';
        if (parseInt(this.offsetLeft) === -this.boxWidth * (this.count + 1)) {
            var _this = this;
            setTimeout(function() {
                _this.slideBox.className += ' nonetransition';
                _this.offsetLeft = '-' + _this.boxWidth + 'px';
                _this.slideBox.style.left = _this.offsetLeft;
            }, 380);
        }
        this.activeCtrl(true);
    };
    Slide.prototype.goPrev = function() { // 向前翻
        this.offsetLeft = parseInt(this.offsetLeft) + this.boxWidth + 'px';
        this.slideLeft(this.offsetLeft);
        this.slideBox.className = 'slidebox transition';
        if (parseInt(this.offsetLeft) === this.boxWidth * 0) {
            var _this = this;
            setTimeout(function() {
                _this.slideBox.className += ' nonetransition';
                _this.offsetLeft = '-' + (_this.boxWidth * _this.count) + 'px';
                _this.slideBox.style.left = _this.offsetLeft;
            }, 380);
        }
        this.activeCtrl(false);
    };
    Slide.prototype.addFlipEvent = function() { // 给箭头添加事件
        var prevBtn = this.slideBox.parentNode.querySelector('.flip.prev');
        var nextBtn = this.slideBox.parentNode.querySelector('.flip.next');
        var _this = this;
        nextBtn.addEventListener('click', function(event) {
            _this.goNext();
            if (isAutoPlay) _this.clearIntervalId();
        });
        prevBtn.addEventListener('click', function(event) {
            _this.goPrev();
            if (isAutoPlay) _this.clearIntervalId();
        });
    };
    Slide.prototype.slideLeft = function(offsetLeft) {
        this.slideBox.style.left = offsetLeft;
    };
    this.setOffsetLeft = function(offsetLeft) { // 必须在这里修改变量 事件处理函数的作用域处理不了
        this.offsetLeft = offsetLeft;
    };
    this.clearIntervalId = function() { // 点击完毕停止自动播放 5秒后恢复
        clearInterval(this.intervalId);
        this.setAutoPlay();
    };
    this.setAutoPlay = function() {
        var _this = this;
        this.intervalId = setInterval(function() {
            _this.goNext();
        }, 5000);
    };
    Slide.prototype.addDotEvent = function() { //给小点点添加事件
        if (this.ctrlBox === null) return;
        var ctrlItems = this.ctrlBox.querySelectorAll('span');
        var _this = this;
        for (var i = 0; i < ctrlItems.length; i++) {
            ctrlItems.item(i).addEventListener('click', function(event) {
                var pos = (-(parseInt(event.target.getAttribute('data-item')) + 1) * _this.boxWidth) + 'px';
                _this.setOffsetLeft(pos);
                _this.slideLeft(pos);
                var siblings = event.target.parentNode.querySelectorAll('span');
                for (var i = 0; i < siblings.length; i++) {
                    siblings.item(i).className = '';
                }
                event.target.className = 'active';
            });
        }
    };
}
