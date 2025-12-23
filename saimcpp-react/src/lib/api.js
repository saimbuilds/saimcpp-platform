// Problem loader - fetches problems from JSON files
export async function loadProblems(category) {
    try {
        const response = await fetch(`/problems/${category}/problems.json`)
        const data = await response.json()
        return data.problems || []
    } catch (error) {
        console.error(`Failed to load ${category} problems:`, error)
        return []
    }
}

export async function loadAllProblems() {
    const categories = ['Arrays', 'Functions', 'Pointers', 'Bitwise', 'DynamicMemory', 'Recursion']
    const allProblems = []

    for (const category of categories) {
        const problems = await loadProblems(category)
        allProblems.push(...problems)
    }

    return allProblems
}

export async function loadDryRunProblems() {
    const difficulties = ['easy', 'medium', 'hard']
    const allDryRuns = []

    for (const difficulty of difficulties) {
        try {
            const response = await fetch(`/problems/DryRun/${difficulty}.json`)
            const data = await response.json()
            const problems = (data.problems || []).map(p => ({ ...p, difficulty }))
            allDryRuns.push(...problems)
        } catch (error) {
            console.error(`Failed to load ${difficulty} dry runs:`, error)
        }
    }

    return allDryRuns
}

// Code execution via Piston API
export async function executeCode(code, input = '') {
    try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: 'c++',
                version: '10.2.0',
                files: [
                    {
                        name: 'main.cpp',
                        content: code,
                    },
                ],
                stdin: input,
            }),
        })

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Code execution failed:', error)
        throw error
    }
}
