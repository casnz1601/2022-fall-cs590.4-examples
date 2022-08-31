export interface Entry {
	lastName: string
	firstName: string
	phoneNumber: string
}

export let entries: Entry[] = []

export function addEntry(entry: Entry) {
	entries.push(entry)
}

// an easier to understand search implementation
export function search1(criteria: Partial<Entry>): Entry[] {
  const results: Entry[] = []
  for (const entry of entries) {
    if (criteria.lastName != null && !entry.lastName.startsWith(criteria.lastName)) {
      continue
    }
    if (criteria.firstName != null && !entry.firstName.startsWith(criteria.firstName)) {
      continue
    }
    if (criteria.phoneNumber != null && !entry.phoneNumber.startsWith(criteria.phoneNumber)) {
      continue
    }
    results.push(entry)
  }
  return results
}

// a version of search that does not need to be updated every time a new field is added
export function search2(criteria: Partial<Entry>): Entry[] {
	return entries.filter(entry => {
		return Object.entries(criteria).every(([field, constraint]) => {
			if (!constraint) {
				return true
			}

			const value = (entry as any)[field]
			return typeof value !== "string" || value.startsWith(constraint)
		})
	})
}

export function exportRoughCsv() {
	return entries.map(({ lastName, firstName, phoneNumber }) => [lastName, firstName, phoneNumber].join(",")).join("\n")
}