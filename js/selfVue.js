// 此函数的作用是将赋值时  options.data.exp 简化成 options.exp，方法就是用Object.defineProperty()将 options.data 包起来 ——proxyGetter 和 proxySetter
function selfVue(options) {
    var self = this;
    this.data = options.data;
    this.methods = options.methods;

    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key);
    });  // 绑定代理属性

    observe(this.data);
    new Compile(options.el, this)
    options.mounted.call(this);   // 所有事情处理好后执行mounted函数
}

selfVue.prototype = {
    proxyKeys: function(key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function proxyGetter() {
                return self.data[key]
            },
            set: function proxySetter(newVal) {
                self.data[key] = newVal
            }
        })
    }
}