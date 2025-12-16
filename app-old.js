// ========================================
// CodeGrind Arena - Main Application
// ========================================

// Sample Problems Database
const PROBLEMS = [
    {
        id: 1,
        title: "Hello World",
        difficulty: "easy",
        topic: "basics",
        description: "Write a program that prints 'Hello, World!' to the console.",
        inputFormat: "No input required.",
        outputFormat: "Print 'Hello, World!' exactly as shown.",
        sampleInput: "",
        sampleOutput: "Hello, World!",
        testCases: [
            { input: "", expectedOutput: "Hello, World!" }
        ],
        points: 10,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`
    },
    {
        id: 2,
        title: "Sum of Two Numbers",
        difficulty: "easy",
        topic: "basics",
        description: "Given two integers, calculate and print their sum.",
        inputFormat: "Two space-separated integers a and b.",
        outputFormat: "Print the sum of a and b.",
        sampleInput: "5 3",
        sampleOutput: "8",
        testCases: [
            { input: "5 3", expectedOutput: "8" },
            { input: "10 20", expectedOutput: "30" },
            { input: "-5 10", expectedOutput: "5" }
        ],
        points: 10,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    
    // Calculate and print sum here
    
    return 0;
}`
    },
    {
        id: 3,
        title: "Even or Odd",
        difficulty: "easy",
        topic: "conditionals",
        description: "Given an integer n, print 'Even' if it's even, otherwise print 'Odd'.",
        inputFormat: "A single integer n.",
        outputFormat: "Print 'Even' or 'Odd'.",
        sampleInput: "4",
        sampleOutput: "Even",
        testCases: [
            { input: "4", expectedOutput: "Even" },
            { input: "7", expectedOutput: "Odd" },
            { input: "0", expectedOutput: "Even" }
        ],
        points: 10,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    // Check if even or odd
    
    return 0;
}`
    },
    {
        id: 4,
        title: "Print Pattern",
        difficulty: "medium",
        topic: "loops",
        description: "Given an integer n, print a pattern of stars in a right triangle shape with n rows.",
        inputFormat: "A single integer n (1 ≤ n ≤ 10).",
        outputFormat: "Print n lines, where line i has i stars.",
        sampleInput: "3",
        sampleOutput: "*\n**\n***",
        testCases: [
            { input: "3", expectedOutput: "*\n**\n***" },
            { input: "5", expectedOutput: "*\n**\n***\n****\n*****" }
        ],
        points: 20,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    // Print the pattern
    
    return 0;
}`
    },
    {
        id: 5,
        title: "Array Sum",
        difficulty: "medium",
        topic: "arrays",
        description: "Given n integers in an array, calculate and print the sum of all elements.",
        inputFormat: "First line: integer n (number of elements). Second line: n space-separated integers.",
        outputFormat: "Print the sum of all array elements.",
        sampleInput: "5\n1 2 3 4 5",
        sampleOutput: "15",
        testCases: [
            { input: "5\n1 2 3 4 5", expectedOutput: "15" },
            { input: "3\n10 20 30", expectedOutput: "60" }
        ],
        points: 20,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    int arr[100];
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    // Calculate sum
    
    return 0;
}`
    }
];

// Application State
let currentUser = null;
let monacoEditor = null;
let currentProblem = null;

// LocalStorage Keys
const STORAGE_KEYS = {
    USERS: 'codegrind_users',
    CURRENT_USER: 'codegrind_current_user',
    SUBMISSIONS: 'codegrind_submissions'
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Check for existing user session
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLoginScreen();
    }

    setupEventListeners();
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // Difficulty filter
    document.getElementById('difficultyFilter').addEventListener('change', renderProblems);

    // Back to problems
    document.getElementById('backToProblems').addEventListener('click', () => {
        showScreen('dashboardScreen');
        switchView('problems');
    });

    // Code editor actions
    document.getElementById('runCodeBtn').addEventListener('click', runCode);
    document.getElementById('submitCodeBtn').addEventListener('click', submitCode);
    document.getElementById('clearOutput').addEventListener('click', clearOutput);
}

// ========================================
// AUTHENTICATION
// ========================================

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert('Please enter a username');
        return;
    }

    // Create or load user
    let users = getUsers();
    let user = users.find(u => u.username === username);

    if (!user) {
        // Create new user
        user = {
            username,
            score: 0,
            solved: 0,
            streak: 0,
            joinedAt: Date.now(),
            submissions: []
        };
        users.push(user);
        saveUsers(users);
    }

    currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    showDashboard();
}

function handleLogout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    currentUser = null;
    showLoginScreen();
}

// ========================================
// SCREEN MANAGEMENT
// ========================================

function showLoginScreen() {
    showScreen('loginScreen');
    updateLoginStats();
}

function showDashboard() {
    showScreen('dashboardScreen');
    updateHeader();
    renderProblems();
    renderLeaderboard();
    renderProfile();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });
}

// ========================================
// UI UPDATES
// ========================================

function updateLoginStats() {
    const users = getUsers();
    const submissions = getAllSubmissions();

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalSolved').textContent = submissions.filter(s => s.status === 'accepted').length;
}

function updateHeader() {
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    document.getElementById('streakDisplay').textContent = currentUser.streak;
    document.getElementById('scoreDisplay').textContent = currentUser.score;
}

// ========================================
// PROBLEMS VIEW
// ========================================

function renderProblems() {
    const container = document.getElementById('problemsGrid');
    const filter = document.getElementById('difficultyFilter').value;

    let filtered = PROBLEMS;
    if (filter !== 'all') {
        filtered = PROBLEMS.filter(p => p.difficulty === filter);
    }

    container.innerHTML = filtered.map(problem => {
        const status = getProblemStatus(problem.id);
        const statusClass = status === 'solved' ? 'solved' : status === 'attempted' ? 'attempted' : '';
        const statusText = status === 'solved' ? '✓ Solved' : status === 'attempted' ? '○ Attempted' : '';

        return `
      <div class="problem-card" onclick="openProblem(${problem.id})">
        <div class="problem-card-header">
          <h3>${problem.title}</h3>
          <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
        </div>
        <p>${problem.description}</p>
        <div class="problem-meta">
          <span>💎 ${problem.points} pts</span>
          <span>📚 ${problem.topic}</span>
        </div>
        ${statusText ? `<div class="problem-status ${statusClass}">${statusText}</div>` : ''}
      </div>
    `;
    }).join('');
}

function getProblemStatus(problemId) {
    const submissions = currentUser.submissions || [];
    const problemSubs = submissions.filter(s => s.problemId === problemId);

    if (problemSubs.some(s => s.status === 'accepted')) {
        return 'solved';
    } else if (problemSubs.length > 0) {
        return 'attempted';
    }
    return 'unsolved';
}

// ========================================
// CODE EDITOR
// ========================================

function openProblem(problemId) {
    currentProblem = PROBLEMS.find(p => p.id === problemId);
    if (!currentProblem) return;

    // Update problem panel
    document.getElementById('problemTitle').textContent = currentProblem.title;
    document.getElementById('problemDifficulty').textContent = currentProblem.difficulty;
    document.getElementById('problemDifficulty').className = `difficulty-badge ${currentProblem.difficulty}`;
    document.getElementById('problemDescription').textContent = currentProblem.description;
    document.getElementById('problemInput').textContent = currentProblem.inputFormat;
    document.getElementById('problemOutput').textContent = currentProblem.outputFormat;
    document.getElementById('sampleInput').textContent = currentProblem.sampleInput;
    document.getElementById('sampleOutput').textContent = currentProblem.sampleOutput;

    // Initialize Monaco Editor if not already
    if (!monacoEditor) {
        initMonacoEditor();
    } else {
        monacoEditor.setValue(currentProblem.starterCode);
    }

    showScreen('editorScreen');
    clearOutput();
}

function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        monacoEditor = monaco.editor.create(document.getElementById('codeEditor'), {
            value: currentProblem.starterCode,
            language: 'cpp',
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on'
        });
    });
}

// ========================================
// CODE EXECUTION
// ========================================

async function runCode() {
    const code = monacoEditor.getValue();
    const testCase = currentProblem.testCases[0]; // Run first test case

    displayOutput('Running...');

    try {
        const result = await executeCode(code, testCase.input);
        if (result.error) {
            displayOutput(`❌ Error:\n${result.error}`, 'error');
        } else {
            const output = result.output.trim();
            const expected = testCase.expectedOutput.trim();

            if (output === expected) {
                displayOutput(`✅ Success!\n\nOutput:\n${output}`, 'success');
            } else {
                displayOutput(`❌ Wrong Answer\n\nYour Output:\n${output}\n\nExpected:\n${expected}`, 'error');
            }
        }
    } catch (error) {
        displayOutput(`❌ Execution Error:\n${error.message}`, 'error');
    }
}

async function submitCode() {
    const code = monacoEditor.getValue();

    displayOutput('Running all test cases...');

    let passed = 0;
    let failed = 0;
    let outputs = [];

    for (let i = 0; i < currentProblem.testCases.length; i++) {
        const testCase = currentProblem.testCases[i];

        try {
            const result = await executeCode(code, testCase.input);

            if (result.error) {
                failed++;
                outputs.push(`Test ${i + 1}: ❌ Error - ${result.error}`);
            } else {
                const output = result.output.trim();
                const expected = testCase.expectedOutput.trim();

                if (output === expected) {
                    passed++;
                    outputs.push(`Test ${i + 1}: ✅ Passed`);
                } else {
                    failed++;
                    outputs.push(`Test ${i + 1}: ❌ Wrong Answer`);
                }
            }
        } catch (error) {
            failed++;
            outputs.push(`Test ${i + 1}: ❌ Error - ${error.message}`);
        }
    }

    const total = currentProblem.testCases.length;
    const status = failed === 0 ? 'accepted' : 'wrong';

    // Save submission
    saveSubmission({
        problemId: currentProblem.id,
        code,
        status,
        passedTests: passed,
        totalTests: total,
        timestamp: Date.now()
    });

    // Display results
    const resultMessage = `
    ${failed === 0 ? '🎉 All Tests Passed!' : '❌ Some Tests Failed'}
    
    Passed: ${passed}/${total}
    Failed: ${failed}/${total}
    
    ${outputs.join('\n')}
  `;

    displayOutput(resultMessage, failed === 0 ? 'success' : 'error');

    // Update user stats if accepted
    if (status === 'accepted' && getProblemStatus(currentProblem.id) !== 'solved') {
        currentUser.solved++;
        currentUser.score += currentProblem.points;
        saveCurrentUser();
        updateHeader();

        setTimeout(() => {
            alert(`🎉 Problem Solved! +${currentProblem.points} points`);
        }, 500);
    }
}

async function executeCode(code, input) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language: 'c++',
            version: '10.2.0',
            files: [{
                name: 'main.cpp',
                content: code
            }],
            stdin: input,
            args: [],
            compile_timeout: 10000,
            run_timeout: 3000
        })
    });

    const data = await response.json();

    if (data.compile && data.compile.code !== 0) {
        return { error: data.compile.output };
    }

    if (data.run.code !== 0 && data.run.stderr) {
        return { error: data.run.stderr };
    }

    return { output: data.run.output || data.run.stdout || '' };
}

function displayOutput(text, type = '') {
    const output = document.getElementById('output');
    output.innerHTML = `<pre class="output-${type}">${text}</pre>`;
}

function clearOutput() {
    const output = document.getElementById('output');
    output.innerHTML = '<p class="output-placeholder">Run your code to see output here...</p>';
}

// ========================================
// LEADERBOARD
// ========================================

function renderLeaderboard() {
    const users = getUsers().sort((a, b) => b.score - a.score);
    const tbody = document.getElementById('leaderboardBody');

    tbody.innerHTML = users.slice(0, 10).map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        const isCurrentUser = currentUser && user.username === currentUser.username;

        return `
      <tr style="${isCurrentUser ? 'background: var(--bg-hover); font-weight: 600;' : ''}">
        <td class="rank-cell">${typeof medal === 'string' ? `<span class="rank-medal">${medal}</span>` : medal}</td>
        <td>${user.username}${isCurrentUser ? ' (You)' : ''}</td>
        <td>${user.score}</td>
        <td>${user.solved}</td>
        <td>${user.streak > 0 ? '🔥 ' + user.streak : '0'}</td>
      </tr>
    `;
    }).join('');
}

// ========================================
// PROFILE
// ========================================

function renderProfile() {
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileSolved').textContent = currentUser.solved;
    document.getElementById('profileScore').textContent = currentUser.score;
    document.getElementById('profileStreak').textContent = currentUser.streak;

    const users = getUsers().sort((a, b) => b.score - a.score);
    const rank = users.findIndex(u => u.username === currentUser.username) + 1;
    document.getElementById('profileRank').textContent = rank > 0 ? `#${rank}` : '-';

    // Render submissions
    const submissions = (currentUser.submissions || []).slice(-5).reverse();
    const container = document.getElementById('submissionsHistory');

    if (submissions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No submissions yet. Start solving!</p>';
    } else {
        container.innerHTML = submissions.map(sub => {
            const problem = PROBLEMS.find(p => p.id === sub.problemId);
            return `
        <div class="submission-item">
          <span class="submission-problem">${problem ? problem.title : 'Unknown'}</span>
          <span class="submission-status ${sub.status}">${sub.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}</span>
          <span style="color: var(--text-secondary); font-size: 0.875rem;">${sub.passedTests}/${sub.totalTests}</span>
        </div>
      `;
        }).join('');
    }
}


// ========================================
// DATA MANAGEMENT
// ========================================

function getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function saveCurrentUser() {
    let users = getUsers();
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index !== -1) {
        users[index] = currentUser;
    } else {
        users.push(currentUser);
    }
    saveUsers(users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
}

function saveSubmission(submission) {
    if (!currentUser.submissions) {
        currentUser.submissions = [];
    }
    currentUser.submissions.push(submission);
    saveCurrentUser();
}

function getAllSubmissions() {
    const users = getUsers();
    return users.flatMap(u => u.submissions || []);
}

// Make openProblem globally accessible
window.openProblem = openProblem;
