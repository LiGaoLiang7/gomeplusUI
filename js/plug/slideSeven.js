/*  @Class: Slide
    @function: 
        Unlimited scrolling
        You can use the arrows or the point to switch the picture
    @parameter:
        elementId     string
        hasCtrlPoints boolean
        isFlip        boolean
        isAutoPlay    boolean
    @author ligaoliang0211@gmail.com
 */
function Slide(elementId, hasCtrlPoints, isFlip, isAutoPlay) {
    this.element = elementId;
    this.hasCtrlPoints = hasCtrlPoints;
    this.isFlip = isFlip;
    this.isAutoPlay = isAutoPlay;
    this.slideBox = null;
    this.shfirstChild = null;
    this.shlastChild = null;
    this.boxWidth = 0;
    this.offsetLeft = 0;
    this.count = 0;
    this.ctrlBox = null;
    this.intervalId = 0;
    /* EventUtil For Cross Browser */
    this.EventUtil = {
        addEventHandler: function(element, type, handlerFunction) {
            if (element.addEventListener) {
                element.addEventListener(type, handlerFunction, false);
            } else if (element.attachEvent) { /* IE<=8 */
                element.attachEvent('on' + type, handlerFunction);
            }
        },
        removeEventHandler: function(element, type, handlerFunction) {
            if (element.removeEventListener) {
                element.removeEventListener(type, handlerFunction, false);
            } else if (element.detachEvent) { /* IE<=8 */
                element.detachEvent('on' + type, handlerFunction);
            }
        }
    };
}

Slide.prototype = {
    /* Change pointer status */
    activeCtrl: function(direction) {
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
    },
    goNext: function() {
        this.offsetLeft = parseInt(this.offsetLeft) - this.boxWidth + 'px';
        this.slideLeft(this.offsetLeft);
        this.slideBox.className = 'slidebox transition';
        if (parseInt(this.offsetLeft) === -this.boxWidth * (this.count + 1)) {
            var _this = this;
            setTimeout(function() {
                _this.slideBox.className += ' nonetransition';
                _this.offsetLeft = '-' + _this.boxWidth + 'px';
                _this.slideLeft(_this.offsetLeft);
            }, 300);
        }
        this.activeCtrl(true);
    },
    goPrev: function() {
        this.offsetLeft = parseInt(this.offsetLeft) + this.boxWidth + 'px';
        this.slideLeft(this.offsetLeft);
        this.slideBox.className = 'slidebox transition';
        if (parseInt(this.offsetLeft) === this.boxWidth * 0) {
            var _this = this;
            setTimeout(function() {
                _this.slideBox.className += ' nonetransition';
                _this.offsetLeft = '-' + (_this.boxWidth * _this.count) + 'px';
                _this.slideLeft(_this.offsetLeft);
            }, 300);
        }
        this.activeCtrl(false);
    },
    addFlipEvent: function() {
        var prevBtn = this.slideBox.parentNode.querySelector('.flip.prev');
        var nextBtn = this.slideBox.parentNode.querySelector('.flip.next');
        var _this = this;
        this.EventUtil.addEventHandler(nextBtn, 'click', function(event) {
            _this.goNext();
            if (_this.isAutoPlay) _this.clearIntervalId();
        });
        this.EventUtil.addEventHandler(prevBtn, 'click', function(event) {
            _this.goPrev();
            if (_this.isAutoPlay) _this.clearIntervalId();
        });
    },
    slideLeft: function(offsetLeft) {
        this.slideBox.style.left = offsetLeft;
    },
    addDotEvent: function() {
        if (this.ctrlBox === null) return;
        var ctrlItems = this.ctrlBox;
        var _this = this;
        this.EventUtil.addEventHandler(ctrlItems, 'click', function(event) {
            if (event.target.nodeName === "DIV") return;
            /* click not on span bugs */
            var pos = (-(parseInt(event.target.getAttribute('data-item')) + 1) * _this.boxWidth) + 'px';
            _this.setOffsetLeft(pos);
            _this.slideLeft(pos);
            var siblings = ctrlItems.querySelectorAll('span');
            for (var i = 0; i < siblings.length; i++) {
                siblings.item(i).className = '';
            }
            event.target.className = 'active';
        });
    },
    /* set leftoffest value */
    setOffsetLeft: function(offsetLeft) {
        this.offsetLeft = offsetLeft;
    },
    /* stop auto play while Filped, then start it again after 5 senconds */
    clearIntervalId: function() {
        clearInterval(this.intervalId);
        this.setAutoPlay();
    },
    setAutoPlay: function() {
        var _this = this;
        this.intervalId = setInterval(function() {
            _this.goNext();
        }, 5000);
    },
    init: function() {
        this.slideBox = document.getElementById(this.element);
        if (this.slideBox.querySelectorAll('li').length > 0) {
            this.count = this.slideBox.querySelectorAll('li').length;
            this.shfirstChild = this.slideBox.querySelector('li').cloneNode(true);
            this.shlastChild = this.slideBox.querySelector('li:last-child').cloneNode(true);
            this.slideBox.appendChild(this.shfirstChild);
            this.slideBox.insertBefore(this.shlastChild, this.slideBox.firstChild);
            this.boxWidth = this.shfirstChild.clientWidth;
            if (this.boxWidth !== 0 && this.count > 1) {
                this.slideBox.style.width = this.boxWidth * (this.count + 2) + 'px';
                this.offsetLeft = '-' + this.boxWidth + 'px';
                this.slideBox.style.left = this.offsetLeft;
            } else if (this.boxWidth !== 0 && this.count <= 1) {
                this.slideBox.style.width = this.boxWidth * this.count + 'px';
                this.slideBox.style.left = '0';
                this.isFlip = this.hasCtrlPoints = this.isAutoPlay = false;
            }
        }
        /* add control points and events for them */
        if (this.hasCtrlPoints) {
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
        /* add arrow */
        if (this.isFlip) {
            var prev = document.createElement('a'),
                next = document.createElement('a');
            prev.className = 'flip prev';
            next.className = 'flip next';
            this.slideBox.parentNode.appendChild(prev);
            this.slideBox.parentNode.appendChild(next);
            this.addFlipEvent();
        }
        /* auto play */
        if (this.isAutoPlay) {
            this.setAutoPlay();
        }
    }
};
