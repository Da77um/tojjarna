const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tzyyomsdqtfwcdvphuaq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eXlvbXNkcXRmd2NkdnBodWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODgwMjksImV4cCI6MjA4Nzk2NDAyOX0.XGRg6wFzikZ5jIp-97Yg9HTMrxfZ2ftbIwoMbCffVuQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase Auth signup...');
    const email = `test.user.${Date.now()}@example.com`;
    console.log('Using email:', email);

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'Password123!',
        options: {
            data: {
                name: 'Test User',
                phone: '0790000000',
            }
        }
    });

    if (error) {
        console.error('ERROR RESPONSE:');
        console.error(error);
    } else {
        console.log('SUCCESS:');
        console.log(data);
    }
}

test();
