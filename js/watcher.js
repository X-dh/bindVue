function Watcher(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get(); // 把自己添加到订阅器
}

Watcher.prototype = {
    update: function() {
        this.run()
    },
    run: function() {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if(value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal)
        }
    },
    get: function() {
        Dep.target = this;  // 缓存本对象
        var value = this.vm.data[this.exp];  // 强制执行监听器中的get(),把自己添加到消息订阅器中
        Dep.target = null;  // 释放自己
        return value;
    }
}