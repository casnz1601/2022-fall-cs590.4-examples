async function nonBlockingFindPrimesWithPromiseAsync(n) {
  const a = new Array(n + 1)
  a.fill(true)
  a[0] = false
  a[1] = false

  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (i % 100 === 0) {
      console.log(`STILL WORKING! ${i}`)
      await new Promise((resolve, reject) => {
        // this tells Node.js to let the event loop run
        setImmediate(resolve)
      })
    }
    for (let j = 2; i * j <= n; j++) {
      a[i * j] = false
    }
  }

  // completely done now
  return a.flatMap((x, i) => x ? [i] : [])
}

// this tells Node.js to call our function every 100 milliseconds -- so long as the event loop is available
setInterval(() => console.log("100 millisecond timer!"), 100)

// keep the program from running forever by setting a one-time timer to exit the program after 10 seconds -- again, using a timer event on the event loop
setTimeout(() => process.exit(0), 10000)

nonBlockingFindPrimesWithPromiseAsync(30000000).then(primes => {
  console.log("found", primes.length, "primes")
})

// this code will, more or less, run immediately
console.log("ok, now all the asynchronous stuff has been launched... we'll wait for the stuff to happen")
