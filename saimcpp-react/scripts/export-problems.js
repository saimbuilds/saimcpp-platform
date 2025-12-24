import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function exportProblems() {
    console.log('📤 Exporting problems from database...\n');

    // Fetch all problems
    const { data: problems, error } = await supabase
        .from('problems')
        .select('*')
        .order('track', { ascending: true })
        .order('category', { ascending: true })
        .order('difficulty', { ascending: true });

    if (error) {
        console.error('❌ Error fetching problems:', error);
        process.exit(1);
    }

    console.log(`✅ Fetched ${problems.length} problems\n`);

    // Group by category
    const grouped = {};
    problems.forEach(p => {
        const key = `${p.category}_${p.difficulty}`;
        if (!grouped[key]) {
            grouped[key] = {
                category: `${p.category} - ${p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}`,
                problems: []
            };
        }

        grouped[key].problems.push({
            title: p.title,
            difficulty: p.difficulty,
            description: p.description,
            inputFormat: p.input_format,
            outputFormat: p.output_format,
            constraints: p.constraints,
            sampleTestCases: p.sample_test_cases,
            hiddenTestCases: p.hidden_test_cases,
            points: p.points,
            starterCode: p.starter_code_cpp
        });
    });

    // Create backup directory
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupPath = path.join(backupDir, `problems-backup-${timestamp}.json`);

    fs.writeFileSync(backupPath, JSON.stringify(grouped, null, 2));

    console.log(`✅ Backup saved to: ${backupPath}`);
    console.log(`📊 Total problems: ${problems.length}`);
    console.log(`📁 Categories: ${Object.keys(grouped).length}\n`);

    console.log('🎉 Export complete!\n');
}

exportProblems().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
