// Problem Loader - Loads problems from JSON files
class ProblemLoader {
    constructor() {
        this.problems = [];
        this.problemFiles = [
            'problems/Arrays/arrays_1d_easy.json',
            'problems/Arrays/arrays_1d_medium.json',
            'problems/Arrays/arrays_1d_hard.json',
            'problems/Arrays/arrays_2d_easy.json',
            'problems/Arrays/arrays_2d_medium.json',
            'problems/Arrays/arrays_2d_hard.json',
            'problems/Arrays/arrays_3d.json'
        ];
    }

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
