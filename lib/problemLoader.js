// Problem Loader - Loads problems from JSON files
class ProblemLoader {
    constructor() {
        this.problems = [];
        this.categories = [
            { name: 'Arrays 1D - Easy', file: 'problems/Arrays/arrays_1d_easy.json' },
            { name: 'Arrays 1D - Medium', file: 'problems/Arrays/arrays_1d_medium.json' },
            { name: 'Arrays 1D - Hard', file: 'problems/Arrays/arrays_1d_hard.json' },
            { name: 'Arrays 2D - Easy', file: 'problems/Arrays/arrays_2d_easy.json' },
            { name: 'Arrays 2D - Medium', file: 'problems/Arrays/arrays_2d_medium.json' },
            { name: 'Arrays 2D - Hard', file: 'problems/Arrays/arrays_2d_hard.json' },
            { name: 'Arrays 3D', file: 'problems/Arrays/arrays_3d.json' }
        ];
    }

    async loadAll() {
        const allProblems = [];
        let problemId = 1;

        for (const category of this.categories) {
            try {
                const response = await fetch(category.file);
                const data = await response.json();

                if (data.problems && Array.isArray(data.problems)) {
                    data.problems.forEach(problem => {
                        // Parse escaped newlines in test cases
                        const parsedProblem = {
                            ...problem,
                            id: problemId++,
                            category: data.category || category.name,
                            sampleTestCases: problem.sampleTestCases?.map(tc => ({
                                input: tc.input?.replace(/\\\\n/g, '\n'),
                                output: tc.output?.replace(/\\\\n/g, '\n'),
                                explanation: tc.explanation
                            })),
                            hiddenTestCases: problem.hiddenTestCases?.map(tc => ({
                                input: tc.input?.replace(/\\\\n/g, '\n'),
                                output: tc.output?.replace(/\\\\n/g, '\n')
                            })),
                            starterCode: problem.starterCode?.replace(/\\\\n/g, '\n'),
                            inputFormat: problem.inputFormat?.replace(/\\\\n/g, '\n'),
                            outputFormat: problem.outputFormat?.replace(/\\\\n/g, '\n'),
                            constraints: problem.constraints?.replace(/\\\\n/g, '\n')
                        };

                        // Combine all test cases
                        parsedProblem.testCases = [
                            ...(parsedProblem.sampleTestCases || []),
                            ...(parsedProblem.hiddenTestCases || [])
                        ].map(tc => ({
                            input: tc.input || '',
                            expectedOutput: tc.output || ''
                        }));

                        allProblems.push(parsedProblem);
                    });
                }
            } catch (error) {
                console.error(`Failed to load ${category.file}:`, error);
            }
        }

        this.problems = allProblems;
        return allProblems;
    }

    getByDifficulty(difficulty) {
        if (difficulty === 'all') return this.problems;
        return this.problems.filter(p => p.difficulty === difficulty);
    }

    getByCategory(category) {
        return this.problems.filter(p => p.category === category);
    }

    getById(id) {
        return this.problems.find(p => p.id === id);
    }

    getCategories() {
        return [...new Set(this.problems.map(p => p.category))];
    }
}

export default ProblemLoader;
