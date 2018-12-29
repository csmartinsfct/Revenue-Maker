class Mutex {
    constructor () {
        this.queue = [];
        this.locked = false;
    }

    lock (methodName) {
        console.log(`[ mutex ] Locking by method ${methodName}`)
        return new Promise((resolve, reject) => {
            if (this.locked) {
                this.queue.push([resolve, reject]);
            } else {
                this.locked = true;
                resolve();
            }
        });
    }

    release (methodName) {
        console.log(`[ mutex ] Releasing by method ${methodName}`)
        if (this.queue.length > 0) {
            const [resolve, reject] = this.queue.shift();
            resolve();
        } else {
            this.locked = false;
        }
    }
}

module.exports = new Mutex();