function Observe(data) {  // 实际上的数据监听器
    this.data = data;
    this.walk(data);
}

Observe.prototype = {
    walk: function(data) {
        var self = this;
        Object.keys(data).forEach((key) => self.defineReactive(data, key, data[key]));  // 遍历对象的每一个属性并添加到订阅器上
    },
    defineReactive: function(data, key, val) {
        var dep = new Dep();  // 为每一个属性都添加一个消息订阅器
        var childObj = observe(val);  // 遍历所有属性
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                if(Dep.target) {  // 判断是否需要添加订阅者
                    dep.addSub(Dep.target)  // 添加订阅者
                }
                return val;
            },
            set: function(newVal) {
                if(val === newVal){
                    return;
                }
                val = newVal;
                console.log('属性'+ key + '已经被监听了，现在值为：'+newVal.toString() + '!')
                dep.notify();  // 如果数据变化，通知所有订阅者
            }
        })
    }
}



function observe(value, vm) {  // 表现上的监听器，劫持数据
    if(!value || typeof value !== 'object') {
        return;
    }
    return new Observe(value)
}

// 消息订阅器，负责收集订阅者
function Dep() {
    this.subs = []
}
Dep.prototype = {
    addSub: function(sub) {  // 添加订阅者
        this.subs.push(sub)
    },
    notify: function() {  // 调用对象属性的update() 更新视图
        this.subs.forEach((sub) => sub.update())
    }
}
Dep.target = null;