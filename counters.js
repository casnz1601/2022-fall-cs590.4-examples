let incrementBy = 1

function makeCounter(name) {
	let counter = 0
	return () => {
		console.log(`${name} incrementBy: ${incrementBy} -> ${incrementBy + 1}`)
		++incrementBy
		console.log(`${name} counter: ${counter} -> ${counter + incrementBy}`)
		counter += incrementBy
		return counter
	}
}

const counterA = makeCounter("a")
const counterB = makeCounter("b")

counterA()
counterB()
counterA()
counterB()
