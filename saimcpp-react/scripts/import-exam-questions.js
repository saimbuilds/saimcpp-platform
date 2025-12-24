import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function importExamQuestions() {
    console.log('🚀 Starting exam questions import...\n');

    // Read exam questions JSON
    const filePath = path.join(__dirname, '../public/pf lab/cpp_final_exam_questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Get or create exam
    const { data: exams, error: examError } = await supabase
        .from('mock_exams')
        .select('id')
        .eq('title', 'PF Lab Final Exam')
        .single();

    if (examError && examError.code !== 'PGRST116') {
        console.error('❌ Error fetching exam:', examError);
        return;
    }

    let examId;
    if (!exams) {
        // Create exam
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

        if (createError) {
            console.error('❌ Error creating exam:', createError);
            return;
        }
        examId = newExam.id;
        console.log('✅ Created exam:', examId);
    } else {
        examId = exams.id;
        console.log('✅ Using existing exam:', examId);
    }

    // Transform and insert questions
    console.log(`\n📝 Importing ${data.exam_questions.length} questions...\n`);

    let successCount = 0;
    let failCount = 0;

    for (const question of data.exam_questions) {
        try {
            const { error } = await supabase
                .from('exam_questions')
                .upsert({
                    exam_id: examId,
                    question_number: question.question_number,
                    title: question.title,
                    category: question.category,
                    marks: question.marks,
                    time_estimate_minutes: question.time_estimate_minutes,
                    content: question.content,
                    starter_code: question.starter_code,
                    visible_test_cases: question.visible_test_cases,
                    hidden_test_cases: question.hidden_test_cases
                }, {
                    onConflict: 'exam_id,question_number'
                });

            if (error) {
                console.error(`   ✗ Q${question.question_number}: ${question.title} - ${error.message}`);
                failCount++;
            } else {
                console.log(`   ✓ Q${question.question_number}: ${question.title}`);
                successCount++;
            }
        } catch (err) {
            console.error(`   ✗ Q${question.question_number}: ${err.message}`);
            failCount++;
        }
    }

    console.log('\n============================================================');
    console.log('📊 IMPORT SUMMARY');
    console.log('============================================================');
    console.log(`✅ Successfully imported: ${successCount} questions`);
    console.log(`❌ Failed: ${failCount} questions`);
    console.log(`📈 Success rate: ${((successCount / data.exam_questions.length) * 100).toFixed(1)}%`);
    console.log('============================================================\n');

    // Verify
    const { data: verifyData, error: verifyError } = await supabase
        .from('exam_questions')
        .select('id')
        .eq('exam_id', examId);

    if (!verifyError) {
        console.log(`🔍 Database verification: ${verifyData.length} questions in exam\n`);
    }

    console.log('🎉 Import complete!');
}

importExamQuestions().catch(console.error);
