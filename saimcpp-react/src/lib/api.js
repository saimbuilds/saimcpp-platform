// Problem loader - fetches problems from JSON files
async function loadCategoryFiles(category, files) {
    const allProblems = []

    for (const file of files) {
        try {
            const response = await fetch(`/problems/${category}/${file}`)
            if (!response.ok) {
                console.warn(`Failed to fetch ${category}/${file}`)
                continue
            }
            const data = await response.json()
            const problems = data.problems || []
            allProblems.push(...problems)
        } catch (error) {
            console.error(`Error loading ${category}/${file}:`, error)
        }
    }

    return allProblems
}

export async function loadProblems(category) {
    const categoryFiles = {
        'Arrays': ['arrays_1d_easy.json', 'arrays_1d_medium.json', 'arrays_1d_hard.json',
            'arrays_2d_easy.json', 'arrays_2d_medium.json', 'arrays_2d_hard.json'],
        'Functions': ['functions_easy.json', 'functions_medium.json', 'functions_hard.json'],
        'Pointers': ['pointers_easy.json', 'pointers_medium.json', 'pointers_hard.json'],
        'Bitwise': ['bitwise_easy.json', 'bitwise_medium.json', 'bitwise_hard.json'],
        'DynamicMemory': ['dynamic_easy.json', 'dynamic_medium.json', 'dynamic_hard.json'],
        'Recursion': ['recursion_easy.json', 'recursion_medium.json', 'recursion_hard.json'],
    }

    const files = categoryFiles[category] || []
    const problems = await loadCategoryFiles(category, files)

    return problems.map((p, index) => ({
        ...p,
        category: category,
        sampleInput: p.sampleTestCases?.[0]?.input || '',
        sampleOutput: p.sampleTestCases?.[0]?.output || '',
        explanation: p.sampleTestCases?.[0]?.explanation || '',
    }))
}

export async function loadAllProblems() {
    try {
        console.log('🚀 Starting to load all problems...')
        const categories = ['Arrays', 'Functions', 'Pointers', 'Bitwise', 'DynamicMemory', 'Recursion']
        const allProblems = []
        let globalId = 1

        for (const category of categories) {
            console.log(`📂 Loading ${category}...`)
            const problems = await loadProblems(category)
            console.log(`✓ Loaded ${problems.length} ${category} problems`)

            // Add global sequential IDs
            problems.forEach(p => {
                p.id = globalId++
            })
            allProblems.push(...problems)
        }

        console.log(`✅ Successfully loaded ${allProblems.length} total problems`)

        // If no problems loaded, return mock data
        if (allProblems.length === 0) {
            console.warn('⚠️ No problems loaded from JSON files, using fallback data')
            return getMockProblems()
        }

        return allProblems
    } catch (error) {
        console.error('❌ Error loading problems:', error)
        console.warn('⚠️ Returning fallback mock data')
        return getMockProblems()
    }
}

// Fallback mock data
function getMockProblems() {
    const mockProblems = []
    for (let i = 1; i <= 10; i++) {
        mockProblems.push({
            id: i,
            title: `Sample Problem ${i}`,
            difficulty: i <= 3 ? 'easy' : i <= 7 ? 'medium' : 'hard',
            category: 'Arrays',
            description: `This is a sample problem ${i}. The actual JSON files may not be loading correctly.`,
            inputFormat: 'Sample input format',
            outputFormat: 'Sample output format',
            sampleInput: '5',
            sampleOutput: '5',
            explanation: 'Sample explanation',
            points: i * 10,
        })
    }
    return mockProblems
}

export async function loadDryRunProblems() {
    try {
        console.log('🚀 Starting to load dry runs...')
        const files = ['dryrun_easy.json', 'dryrun_medium.json', 'dryrun_hard.json']
        const allDryRuns = []
        let id = 1

        for (const file of files) {
            try {
                const response = await fetch(`/problems/DryRun/${file}`)
                if (!response.ok) continue
                const data = await response.json()
                const difficulty = file.includes('easy') ? 'easy' : file.includes('medium') ? 'medium' : 'hard'
                const problems = (data.problems || []).map(p => ({
                    ...p,
                    id: id++,
                    difficulty
                }))
                allDryRuns.push(...problems)
            } catch (error) {
                console.error(`Failed to load ${file}:`, error)
            }
        }

        console.log(`✅ Loaded ${allDryRuns.length} dry runs`)
        return allDryRuns
    } catch (error) {
        console.error('❌ Error loading dry runs:', error)
        return []
    }
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
