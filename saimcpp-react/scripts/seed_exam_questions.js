import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hvizuvovmdcjixqwmcgw.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY; // Fallback only if service key missing, but likely needs service key

if (!process.env.SUPABASE_SERVICE_KEY) {
    console.warn('⚠️  Warning: SUPABASE_SERVICE_KEY not found in .env. Using fallback/anon key, which might fail RLS.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedExamQuestions() {
    console.log('🚀 Starting exam questions seeding...');

    try {
        // 1. Read the JSON file
        const jsonPath = path.join(__dirname, '../public/pf lab/cpp_final_exam_questions.json');
        console.log(`📖 Reading questions from: ${jsonPath}`);

        if (!fs.existsSync(jsonPath)) {
            throw new Error(`File not found: ${jsonPath}`);
        }

        const fileContent = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(fileContent);
        const questions = data.exam_questions;

        console.log(`📊 Found ${questions.length} questions in JSON.`);

        // 2. Get the Final Exam ID
        // We look for the specific exam or use the default one
        let { data: exam, error: examError } = await supabase
            .from('mock_exams')
            .select('id, title')
            .eq('title', 'PF Lab Final Exam')
            .single();

        if (examError || !exam) {
            console.log('⚠️ Exam not found, creating default Final Exam...');
            // Create it if it doesn't exist
            const { data: newExam, error: createError } = await supabase
                .from('mock_exams')
                .insert({
                    title: 'PF Lab Final Exam',
                    description: 'Comprehensive 3-hour final exam covering all PF Lab topics. Choose any 3 questions (25 marks each).',
                    duration_minutes: 180,
                    total_marks: 75,
                    is_active: true
                })
                .select()
                .single();

            if (createError) throw createError;
            exam = newExam;
        }

        console.log(`✅ Target Exam: ${exam.title} (${exam.id})`);

        // 3. Delete existing questions for this exam to avoid duplicates/conflicts
        console.log('🧹 Clearing existing questions for this exam...');
        const { error: deleteError } = await supabase
            .from('exam_questions')
            .delete()
            .eq('exam_id', exam.id);

        if (deleteError) throw deleteError;

        // 4. Insert new questions
        console.log('📝 Inserting new questions...');

        const questionsToInsert = questions.map(q => ({
            exam_id: exam.id,
            question_number: q.question_number,
            title: q.title,
            category: q.category,
            marks: q.marks,
            time_estimate_minutes: q.time_estimate_minutes,
            content: q.content,
            starter_code: q.starter_code,
            visible_test_cases: q.visible_test_cases, // Supabase handles JSONB auto-conversion from object
            hidden_test_cases: q.hidden_test_cases
        }));

        const { data: inserted, error: insertError } = await supabase
            .from('exam_questions')
            .insert(questionsToInsert)
            .select();

        if (insertError) {
            console.error('❌ Insert Error:', insertError);
            throw insertError;
        }

        console.log(`✅ Successfully seeded ${inserted.length} questions!`);

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedExamQuestions();
