import fs from "fs"
import { Case, LogEntry, Severity } from "./data"

export let cases: Case[] = []

export function load() {
  cases = JSON.parse(fs.readFileSync("cases.json").toString("utf-8"))
}

export function save() {
  fs.writeFileSync("cases.json", JSON.stringify(cases, null, 2))
}

export function newCase(summary: string, severity: Severity) {
  cases.push({
    id: cases.length, 
    summary, 
    log: [{ timestamp: Date.now(), comment: "new case", severity, status: "unassigned" }],
  })
  save()
}

export function updateCase(id: number, logEntry: Partial<LogEntry>) {
  const c = cases.find(c => c.id === id)
  c.log.unshift({ ...c.log[0], timestamp: Date.now(), ...logEntry })
  save()
}

export function printCases(x = cases) {
  x.forEach(c => {
    console.log(JSON.stringify(c, null, 2))
    console.log()
  })
}

export function printUnassignedCases() {
  printCases(cases.filter(c => c.log[0].status === "unassigned"))
}
