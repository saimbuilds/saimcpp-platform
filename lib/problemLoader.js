class ProblemLoader {
    constructor() {
        this.problems = [];
        this.problemFiles = [
            // Arrays
            'problems/Arrays/arrays_1d_easy.json',
            'problems/Arrays/arrays_1d_medium.json',
            'problems/Arrays/arrays_1d_hard.json',
            'problems/Arrays/arrays_2d_easy.json',
            'problems/Arrays/arrays_2d_medium.json',
            'problems/Arrays/arrays_2d_hard.json',
            'problems/Arrays/arrays_3d.json',
            // Functions
            'problems/Functions/functions_easy.json',
            'problems/Functions/functions_medium.json',
            'problems/Functions/functions_hard.json',
            // Pointers
            'problems/Pointers/pointers_easy.json',
            'problems/Pointers/pointers_medium.json',
            'problems/Pointers/pointers_hard.json',
            // Bitwise
            'problems/Bitwise/bitwise_easy.json',
            'problems/Bitwise/bitwise_medium.json',
            'problems/Bitwise/bitwise_hard.json',
            // Dynamic Memory
            'problems/DynamicMemory/dynamic_easy.json',
            'problems/DynamicMemory/dynamic_medium.json',
            'problems/DynamicMemory/dynamic_hard.json',
            // Recursion
            'problems/Recursion/recursion_easy.json',
            'problems/Recursion/recursion_medium.json',
            'problems/Recursion/recursion_hard.json'
        ];
    }

    parseNewlines(str) {
        if (!str) return '';
        // Handle both \\n (double backslash) and \n (single backslash) from JSON
        // First replace \\n with actual newlines
        let result = str.replace(/\\\\n/g, '\n');
        // Then replace any remaining \n with actual newlines  
        result = result.replace(/\\n/g, '\n');
        return result;
    }

    async loadFile(filePath) {
        try {
            const response = await fetch(filePath);
            const data = await response.json();

            if (!data.problems || !Array.isArray(data.problems)) {
                console.warn(`Invalid format in ${filePath}`);
                return [];
            }

            return data.problems.map((problem, index) => ({
                id: this.problems.length + index + 1,
                ...problem,
                category: data.category || 'Uncategorized',
                description: this.parseNewlines(problem.description),
                inputFormat: this.parseNewlines(problem.inputFormat),
                outputFormat: this.parseNewlines(problem.outputFormat),
                constraints: this.parseNewlines(problem.constraints),
                starterCode: this.parseNewlines(problem.starterCode),
                sampleTestCases: (problem.sampleTestCases || []).map(tc => ({
                    ...tc,
                    input: this.parseNewlines(tc.input),
                    output: this.parseNewlines(tc.output || tc.expectedOutput),
                    expectedOutput: this.parseNewlines(tc.output || tc.expectedOutput),
                    explanation: this.parseNewlines(tc.explanation)
                })),
                hiddenTestCases: (problem.hiddenTestCases || []).map(tc => ({
                    ...tc,
                    input: this.parseNewlines(tc.input),
                    output: this.parseNewlines(tc.output || tc.expectedOutput),
                    expectedOutput: this.parseNewlines(tc.output || tc.expectedOutput)
                }))
            }));
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            return [];
        }
    }

    async loadAll() {
        for (const file of this.problemFiles) {
            const problems = await this.loadFile(file);
            this.problems.push(...problems);
        }
        return this.problems;
    }

    getByDifficulty(difficulty) {
        return this.problems.filter(p => p.difficulty === difficulty);
    }

    getById(id) {
        return this.problems.find(p => p.id === id);
    }
}

export default ProblemLoader;
