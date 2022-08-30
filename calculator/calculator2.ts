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
 * Supported operator implementations
 */
const operators: Record<string, () => any> = {
  "+": () => stack.push(stack.pop() + stack.pop()),
  "-": () => stack.push(stack.pop() - stack.pop()),
  pop: () => stack.pop(),
  dup: () => stack.push(stack.slice(-1)[0]),
  quit: () => process.exit(0),
  help: () => console.log("supported commands:", Object.keys(operators).join(", ")),
}

/**
 * Processes a single token of input from the user
 * @param s token
 */
function processToken(s: string) {
  const n = Number(s)
  if (isNaN(n)) {
    operators[s]()
  } else {
    stack.push(n)
  }
}

/**
 * Processes a single line of input from the user
 * @param s input
 */
function processMultiple(s: string) {
  s.split(" ").forEach(processToken)
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