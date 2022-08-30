import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

/**
 * Stack of operands
 */
const stack: number[] = []

/**
 * Processes a single token of input from the user
 * @param s token
 */
function processToken(s: string) {
  const n = Number(s)
  if (isNaN(n)) {
    if (s === "+") {
      stack.push(stack.pop() + stack.pop())
    } else if (s === "-") {
      stack.push(stack.pop() - stack.pop())
    } else if (s === "pop") {
      stack.pop()
    } else if (s === "dup") {
      stack.push(stack.slice(-1)[0])
    } else if (s === "quit") {
      process.exit(0)
    } else if (s === "help") {
      console.log("supported commands: +, -, pop, dup, quit, help")
    }
  } else {
    stack.push(n)
  }
}

/**
 * Processes a single line of input from the user
 * @param s input
 */
function processMultiple(s: string) {
  const tokens = s.split(" ")
  for (const token of tokens) {
    processToken(token)
  }
  console.log(stack.join(" "), "<- top")
  prompt()
}

/**
 * Prompts the user for the next line of input
 */
function prompt() {
  rl.question('> ', processMultiple)
}

prompt()