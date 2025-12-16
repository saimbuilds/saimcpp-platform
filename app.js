// ========================================
// CodeGrind Arena - Full Stack with Supabase
// ========================================

import supabaseClient from './lib/supabase.js';

// Sample Problems (will be replaced with Supabase data)
const SAMPLE_PROBLEMS = [
    {
        id: 1,
        title: "Hello World",
        difficulty: "easy",
        category: "Basics",
        description: "Write a program that prints 'Hello, World!' to the console.",
        inputFormat: "No input required.",
        outputFormat: "Print 'Hello, World!' exactly as shown.",
        sampleInput: "",
        sampleOutput: "Hello, World!",
        testCases: [{ input: "", expectedOutput: "Hello, World!" }],
        points: 10,
        starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}`
    },
    {
        id: 2,
        title: "Sum of Two Numbers",
        difficulty: "easy",
        category: "Basics",
        description: "Given two integers, calculate and print their sum.",
        inputFormat: "Two space-separated integers a and b.",
        outputFormat: "Print the sum of a and b.",
        sampleInput: "5 3",
        sampleOutput: "8",
        testCases: [
            { input: "5 3", expectedOutput: "8" },
            { input: "10 20", expectedOutput: "30" }
        ],
        points: 10,
        starterCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    \n    return 0;\n}`
    }
];

// Application State
let currentUser = null;
let userProfile = null;
let monacoEditor = null;
let currentProblem = null;

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

async function checkAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        currentUser = session.user;
        await loadUserProfile();
    } else {
        showLoginScreen();
    }
}

async function loadUserProfile() {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (error || !data) {
        // First time user - show profile completion
        showProfileCompletion();
    } else {
        userProfile = data;
        showDashboard();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Google Sign In
    document.getElementById('googleSignInBtn')?.addEventListener('click', signInWithGoogle);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // Back to problems
    document.getElementById('backToProblems')?.addEventListener('click', () => {
        showScreen('dashboardScreen');
        switchView('problems');
    });

    // Code editor actions
    document.getElementById('runCodeBtn')?.addEventListener('click', runCode);
    document.getElementById('submitCodeBtn')?.addEventListener('click', submitCode);
    document.getElementById('clearOutput')?.addEventListener('click', clearOutput);
}

// ========================================
// AUTHENTICATION
// ========================================

async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        alert('Sign in failed: ' + error.message);
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    userProfile = null;
    showLoginScreen();
}

// ========================================
// PROFILE COMPLETION
// ========================================

function showProfileCompletion() {
    const html = `
    <div class="modal-overlay active">
      <div class="modal">
        <div class="modal-header">
          <h2>Complete Your Profile</h2>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 2rem; color: var(--text-secondary);">
            Welcome to CodeGrind Arena! Please tell us about yourself:
          </p>
          
          <div class="input-group">
            <label class="input-label">Batch</label>
            <select id="batchSelect" class="select-field">
              <option value="">Select your batch</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          
          <div class="input-group">
            <label class="input-label">Department</label>
            <select id="departmentSelect" class="select-field">
              <option value="">Select your department</option>
              <option value="CS">Computer Science (CS)</option>
              <option value="DS">Data Science (DS)</option>
              <option value="AI">Artificial Intelligence (AI)</option>
              <option value="CY">Cyber Security (CY)</option>
              <option value="SE">Software Engineering (SE)</option>
            </select>
          </div>
          
          <button class="btn-primary btn-large" id="completeProfileBtn" style="margin-top: 2rem;">
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  `;

    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('completeProfileBtn').addEventListener('click', async () => {
        const batch = document.getElementById('batchSelect').value;
        const department = document.getElementById('departmentSelect').value;

        if (!batch || !department) {
            alert('Please select both batch and department');
            return;
        }

        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({
                id: currentUser.id,
                email: currentUser.email,
                full_name: currentUser.user_metadata.full_name || 'User',
                avatar_url: currentUser.user_metadata.avatar_url,
                batch,
                department
            })
            .select()
            .single();

        if (error) {
            alert('Error creating profile: ' + error.message);
        } else {
            userProfile = data;
            document.querySelector('.modal-overlay').remove();
            showDashboard();
        }
    });
}

// ========================================
// SCREEN MANAGEMENT
// ========================================

function showLoginScreen() {
    showScreen('loginScreen');
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

function updateHeader() {
    document.getElementById('usernameDisplay').textContent = userProfile.full_name || 'User';
    document.getElementById('streakDisplay').textContent = userProfile.current_streak || 0;
    document.getElementById('scoreDisplay').textContent = userProfile.total_score || 0;
}

// ========================================
// PROBLEMS VIEW
// ========================================

function renderProblems() {
    const container = document.getElementById('problemsGrid');

    container.innerHTML = SAMPLE_PROBLEMS.map(problem => {
        return `
      <div class="problem-card" onclick="openProblem(${problem.id})">
        <div class="problem-card-header">
          <h3>${problem.title}</h3>
          <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
        </div>
        <p>${problem.description}</p>
        <div class="problem-meta">
          <span>💎 ${problem.points} pts</span>
          <span>📚 ${problem.category}</span>
        </div>
      </div>
    `;
    }).join('');
}

// ========================================
// CODE EDITOR
// ========================================

function openProblem(problemId) {
    currentProblem = SAMPLE_PROBLEMS.find(p => p.id === problemId);
    if (!currentProblem) return;

    document.getElementById('problemTitle').textContent = currentProblem.title;
    document.getElementById('problemDifficulty').textContent = currentProblem.difficulty;
    document.getElementById('problemDifficulty').className = `difficulty-badge ${currentProblem.difficulty}`;
    document.getElementById('problemDescription').textContent = currentProblem.description;
    document.getElementById('problemInput').textContent = currentProblem.inputFormat;
    document.getElementById('problemOutput').textContent = currentProblem.outputFormat;
    document.getElementById('sampleInput').textContent = currentProblem.sampleInput;
    document.getElementById('sampleOutput').textContent = currentProblem.sampleOutput;

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
            automaticLayout: true
        });
    });
}

// ========================================
// CODE EXECUTION
// ========================================

async function runCode() {
    const code = monacoEditor.getValue();
    const testCase = currentProblem.testCases[0];

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
        displayOutput(`❌ Error:\n${error.message}`, 'error');
    }
}

async function submitCode() {
    const code = monacoEditor.getValue();
    displayOutput('Running all test cases...');

    let passed = 0;
    let failed = 0;

    for (let testCase of currentProblem.testCases) {
        try {
            const result = await executeCode(code, testCase.input);
            if (!result.error && result.output.trim() === testCase.expectedOutput.trim()) {
                passed++;
            } else {
                failed++;
            }
        } catch {
            failed++;
        }
    }

    const total = currentProblem.testCases.length;
    const status = failed === 0 ? 'accepted' : 'wrong';

    // Save to Supabase
    await saveSubmission(code, status, passed, total);

    const resultMessage = `${failed === 0 ? '🎉 All Tests Passed!' : '❌ Some Failed'}\n\nPassed: ${passed}/${total}`;
    displayOutput(resultMessage, failed === 0 ? 'success' : 'error');

    if (status === 'accepted') {
        await updateUserScore(currentProblem.points);
        setTimeout(() => alert(`🎉 +${currentProblem.points} points!`), 500);
    }
}

async function executeCode(code, input) {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            language: 'c++',
            version: '10.2.0',
            files: [{ name: 'main.cpp', content: code }],
            stdin: input
        })
    });

    const data = await response.json();

    if (data.compile?.code !== 0) {
        return { error: data.compile.output };
    }

    return { output: data.run.output || '' };
}

async function saveSubmission(code, status, passed, total) {
    await supabaseClient.from('submissions').insert({
        user_id: userProfile.id,
        problem_id: currentProblem.id,
        code,
        status,
        test_cases_passed: passed,
        test_cases_total: total,
        points_earned: status === 'accepted' ? currentProblem.points : 0
    });
}

async function updateUserScore(points) {
    const newScore = userProfile.total_score + points;
    await supabaseClient
        .from('profiles')
        .update({ total_score: newScore, problems_solved: userProfile.problems_solved + 1 })
        .eq('id', userProfile.id);

    userProfile.total_score = newScore;
    userProfile.problems_solved++;
    updateHeader();
}

function displayOutput(text, type = '') {
    document.getElementById('output').innerHTML = `<pre class="output-${type}">${text}</pre>`;
}

function clearOutput() {
    document.getElementById('output').innerHTML = '<p class="output-placeholder">Run your code to see output here...</p>';
}

// ========================================
// LEADERBOARD
// ========================================

async function renderLeaderboard() {
    const { data: users } = await supabaseClient
        .from('profiles')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(10);

    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = users.map((user, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank;
        return `
      <tr style="${user.id === userProfile.id ? 'background: var(--bg-hover); font-weight: 600;' : ''}">
        <td class="rank-cell">${typeof medal === 'string' ? `<span class="rank-medal">${medal}</span>` : medal}</td>
        <td>${user.full_name}${user.id === userProfile.id ? ' (You)' : ''}</td>
        <td>${user.total_score}</td>
        <td>${user.problems_solved}</td>
        <td>${user.current_streak || 0}</td>
      </tr>
    `;
    }).join('');
}

// ========================================
// PROFILE
// ========================================

function renderProfile() {
    document.getElementById('profileUsername').textContent = userProfile.full_name;
    document.getElementById('profileSolved').textContent = userProfile.problems_solved || 0;
    document.getElementById('profileScore').textContent = userProfile.total_score || 0;
    document.getElementById('profileStreak').textContent = userProfile.current_streak || 0;
}

window.openProblem = openProblem;
