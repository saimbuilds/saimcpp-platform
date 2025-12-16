// ========================================
// SaimCPP - Full Stack with Supabase
// ========================================

import supabaseClient from './lib/supabase.js';
import ProblemLoader from './lib/problemLoader.js';

// Application State
let currentUser = null;
let userProfile = null;
let monacoEditor = null;
let currentProblem = null;
let problemLoader = new ProblemLoader();
let allProblems = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load problems first
    allProblems = await problemLoader.loadAll();
    console.log(`Loaded ${allProblems.length} problems`);

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
    console.log('Loading profile for user:', currentUser.id);

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

    console.log('Profile query result:', { data, error });

    if (error) {
        console.error('Error loading profile:', error);
        showProfileCompletion();
    } else if (!data) {
        // First time user - show profile completion
        console.log('No profile found, showing completion form');
        showProfileCompletion();
    } else {
        userProfile = data;
        console.log('Profile loaded:', userProfile);
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

    // Difficulty filter
    document.getElementById('difficultyFilter')?.addEventListener('change', renderProblems);
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
    // Reload page to clear everything
    window.location.reload();
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
    console.log('showDashboard called');
    showScreen('dashboardScreen');

    // Scroll to top multiple times to ensure it works
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 0);

    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }, 100);

    updateHeader();
    renderProblems();

    // These might fail if no data yet, don't let them break the UI
    try {
        renderLeaderboard();
    } catch (e) {
        console.error('Leaderboard render failed:', e);
    }

    try {
        renderProfile();
    } catch (e) {
        console.error('Profile render failed:', e);
    }
}

function showScreen(screenId) {
    console.log('Switching to screen:', screenId);

    // Hide the app container (login screen container)
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.style.display = 'none';
        appContainer.style.height = '0';
        appContainer.style.overflow = 'hidden';
    }

    // Completely hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.style.display = 'none';
        screen.style.visibility = 'hidden';
        screen.style.height = '0';
        screen.style.overflow = 'hidden';
        screen.style.position = 'absolute';
        screen.style.top = '-99999px';
        console.log('Hiding screen:', screen.id);
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    console.log('Target screen:', targetScreen);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.style.display = 'block';
        targetScreen.style.visibility = 'visible';
        targetScreen.style.height = 'auto';
        targetScreen.style.overflow = 'visible';
        targetScreen.style.opacity = '1';
        targetScreen.style.zIndex = '9999';
        targetScreen.style.position = 'static';
        targetScreen.style.top = '0';
        console.log('Showing screen:', screenId);
    } else {
        console.error('Screen not found:', screenId);
    }

    // Force scroll to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
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
    const filter = document.getElementById('difficultyFilter')?.value || 'all';

    let filtered = filter === 'all' ? allProblems : allProblems.filter(p => p.difficulty === filter);

    console.log(`Rendering ${filtered.length} problems`);

    container.innerHTML = filtered.map(problem => {
        return `
      <div class="problem-card" onclick="openProblem(${problem.id})">
        <div class="problem-card-header">
          <h3>${problem.title}</h3>
          <span class="difficulty-badge ${problem.difficulty}">${problem.difficulty}</span>
        </div>
        <p>${problem.description.substring(0, 100)}...</p>
        <div class="problem-meta">
          <span>${problem.points} pts</span>
          <span>${problem.category}</span>
        </div>
      </div>
    `;
    }).join('');

    console.log('Problems rendered to container:', container);
}

// ========================================
// CODE EDITOR
// ========================================

function openProblem(problemId) {
    currentProblem = allProblems.find(p => p.id === problemId);
    if (!currentProblem) return;

    document.getElementById('problemTitle').textContent = currentProblem.title;
    document.getElementById('problemDifficulty').textContent = currentProblem.difficulty;
    document.getElementById('problemDifficulty').className = `difficulty-badge ${currentProblem.difficulty}`;
    document.getElementById('problemDescription').textContent = currentProblem.description;
    document.getElementById('problemInput').textContent = currentProblem.inputFormat;
    document.getElementById('problemOutput').textContent = currentProblem.outputFormat;

    // Show first sample test case - clean up display
    const sampleTest = currentProblem.sampleTestCases?.[0] || currentProblem.testCases?.[0];
    const cleanInput = (sampleTest?.input || '').replace(/\\n/g, '\n');
    const cleanOutput = (sampleTest?.expectedOutput || sampleTest?.output || '').replace(/\\n/g, '\n');
    document.getElementById('sampleInput').textContent = cleanInput;
    document.getElementById('sampleOutput').textContent = cleanOutput;

    if (!monacoEditor) {
        initMonacoEditor();
    } else {
        // Convert literal \n to actual newlines for Monaco
        const cleanCode = (currentProblem.starterCode || '').replace(/\\n/g, '\n');
        monacoEditor.setValue(cleanCode);
    }

    showScreen('editorScreen');
    clearOutput();
}

function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        // Convert literal \n to actual newlines
        const code = (currentProblem.starterCode || '').replace(/\\n/g, '\n');

        monacoEditor = monaco.editor.create(document.getElementById('codeEditor'), {
            value: code,
            language: 'cpp',
            theme: 'vs-dark',
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            wordWrap: 'on',
            lineNumbers: 'on'
        });
    });
}

// ========================================
// CODE EXECUTION
// ========================================

async function runCode() {
    const code = monacoEditor.getValue();

    // Use sampleTestCases if available, otherwise use testCases
    const testCases = currentProblem.sampleTestCases || currentProblem.testCases || [];
    if (testCases.length === 0) {
        displayOutput('No test cases available', 'error');
        return;
    }

    const testCase = testCases[0];
    displayOutput('Running...');

    try {
        // Convert \\n to actual newlines in input
        const rawInput = testCase.input || '';
        console.log('Raw input from JSON:', rawInput);

        const cleanInput = rawInput.replace(/\\n/g, '\n');
        console.log('Clean input (after replace):', cleanInput);
        console.log('Clean input (escaped for display):', JSON.stringify(cleanInput));

        const result = await executeCode(code, cleanInput);

        if (result.error) {
            displayOutput(`Error:\n${result.error}`, 'error');
        } else {
            const output = result.output.trim();
            const expected = (testCase.expectedOutput || testCase.output || '').trim();

            console.log('Output:', output);
            console.log('Expected:', expected);

            if (output === expected) {
                displayOutput(`Success!\n\nOutput:\n${output}`, 'success');
            } else {
                displayOutput(`Wrong Answer\n\nYour Output:\n${output}\n\nExpected:\n${expected}`, 'error');
            }
        }
    } catch (error) {
        displayOutput(`Error:\n${error.message}`, 'error');
    }
}

async function submitCode() {
    const code = monacoEditor.getValue();
    displayOutput('Running all test cases...');

    let passed = 0;
    let failed = 0;

    // Use both sample and hidden test cases
    const allTestCases = [
        ...(currentProblem.sampleTestCases || []),
        ...(currentProblem.hiddenTestCases || [])
    ];

    if (allTestCases.length === 0) {
        displayOutput('No test cases available', 'error');
        return;
    }

    for (let testCase of allTestCases) {
        try {
            // Convert \\n to actual newlines
            const cleanInput = (testCase.input || '').replace(/\\\\n/g, '\n');
            const result = await executeCode(code, cleanInput);
            const expected = (testCase.expectedOutput || testCase.output || '').trim();

            if (!result.error && result.output.trim() === expected) {
                passed++;
            } else {
                failed++;
            }
        } catch {
            failed++;
        }
    }

    const total = allTestCases.length;
    const status = failed === 0 ? 'accepted' : 'wrong';

    // Save to Supabase
    await saveSubmission(code, status, passed, total);

    const resultMessage = `${failed === 0 ? 'All Tests Passed!' : 'Some Failed'}\n\nPassed: ${passed}/${total}`;
    displayOutput(resultMessage, failed === 0 ? 'success' : 'error');

    if (status === 'accepted') {
        await updateUserScore(currentProblem.points);
        setTimeout(() => alert(`+${currentProblem.points} points!`), 500);
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
        const medal = rank === 1 ? '#1' : rank === 2 ? '#2' : rank === 3 ? '#3' : rank;
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
