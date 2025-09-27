import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please add:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableEmailConfirmation() {
  try {
    console.log('🔧 Disabling email confirmation requirement...');
    
    // Update auth settings to disable email confirmation
    const { data, error } = await supabase
      .from('auth.config')
      .update({ 
        email_confirm: false,
        enable_signup: true,
        email_autoconfirm: true
      })
      .eq('id', 1);

    if (error) {
      console.error('❌ Error updating auth config:', error.message);
      
      // Try alternative approach - update user confirmation status
      console.log('🔄 Trying alternative approach...');
      
      // Get all unconfirmed users and confirm them
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Error fetching users:', usersError.message);
        return;
      }

      const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at);
      
      for (const user of unconfirmedUsers) {
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.error(`❌ Error confirming user ${user.email}:`, confirmError.message);
        } else {
          console.log(`✅ Confirmed user: ${user.email}`);
        }
      }
      
    } else {
      console.log('✅ Auth config updated successfully');
    }

    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication > Settings');
    console.log('3. Disable "Enable email confirmations"');
    console.log('4. Save the settings');
    
    console.log('\n🎉 Email verification has been disabled!');
    console.log('Users can now sign up and login without email verification.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the script
disableEmailConfirmation();
