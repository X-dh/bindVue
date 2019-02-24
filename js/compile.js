function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    // 初始化函数，将所有DOM节点读入然后传递给判断、执行函数
    init: function() {
        if(this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在')
        }
    },
    // 此函数的作用是将页面中所有的DOM节点全部读取，免去后期多次渲染
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while(child) {
            // 将DOM元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    // 此函数是判断页面中是否有  {{ *** }} 的文字出现，如果出现则进行相关操作
    compileElement: function(el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function(node) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            
            // 如果是节点，则进行指令解析；否则如果是文本节点并且符合{{}}形式的则进行文本的指令解析
            if (self.isElementNode(node)) {
                self.compile(node);
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1])
            }

            // 遍历所有子节点
            if(node.childNodes && node.childNodes.length) {
                self.compileElement(node)
            }
        })
    },
    // 节点指令解析
    compile: function(node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function(attr) {
            var attrName = attr.name;
            // isDirective() 判断是否有 'v-' 字符串开头的代码
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                // 拿到 v- 后面的代码
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {  // v-on事件指令
                    self.compileEvent(node, self.vm, exp, dir);
                } else {  // v-model 指令
                    self.compileModel(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName);  // 将 v-xx 删除
            }
        });
    },
    // 如果是文本，则初始化然后将自己加入订阅器
    compileText: function(node, exp) {
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText);
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value);
        });
    },
    // 绑定 v-on: somefunc() 中的somefunc()
    compileEvent: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    // 将自己加入订阅器，然后添加一个监听器，保持自己和输入框中的值一致
    compileModel: function (node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    // textContent 获取该节点的文本和它所有的后代
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function(node, value, oldVal) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') == 0;
    },
    // nodeType，元素返回1，属性返回2，文本返回3
    isElementNode: function(node) {
        return node.nodeType == 1;
    },
    isTextNode: function(node) {
        return node.nodeType == 3;
    }
}
