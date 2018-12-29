const mutex = require('./mutex.js')

const delay = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

console.log('We have a method we want to make sure are is not being called at the same time/multiple times.')
console.log('To make sure it doesn’t, we have it checking if X is 0. If X === 0, the program stops.')
console.log('Each time this method is called, it reduces X by 1, so if it is called at the same time, it will make X to 0')

let counter = 1;

const tester = async (mutex, miliseconds) => {
    console.log('Tester has been called with the following ms', miliseconds)
    await mutex.lock(`tester w/${miliseconds} ms`)
    if (counter === 0) {
        throw new Error('Testing failed.')
    }
    counter -= 1;
    await delay(3000);
    counter += 1;
    console.log(`Tester ${miliseconds} ms has successfully passed the counter test`)
    mutex.release(`tester w/${miliseconds} ms`);
}

(() => {
    let waitingTime;
    for (let i = 0; i < 5; i++) {
        waitingTime = Math.random() * 10000;
        ((ms) => {
            setTimeout(() => tester(mutex, ms), ms)
        })(waitingTime);
    }
})();