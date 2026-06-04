import { createClient } from "@supabase/supabase-js";

const url = "https://fdmahmzuyvtbwukjjsjf.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWFobXp1eXZ0Ynd1a2pqc2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NTM4ODUsImV4cCI6MjA5NjEyOTg4NX0.reixQislAraBfa2BAc40cAE3SLoOZgSO7z7Lmi9MPm0";

const supabase = createClient(url, anonKey);

async function testConnection() {
  console.log("Testing Supabase connection...");

  // Test 1: Check if tasks table exists by selecting from it
  console.log("\n1. Testing LIST (SELECT) from tasks table...");
  const { data: listData, error: listError } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (listError) {
    console.error("  LIST failed:", listError.message);
  } else {
    console.log("  LIST succeeded:", listData?.length ?? 0, "tasks found");
    if (listData && listData.length > 0) {
      console.log("  Sample task:", JSON.stringify(listData[0], null, 2));
    }
  }

  // Test 2: Insert a test task
  console.log("\n2. Testing CREATE (INSERT) into tasks table...");
  const testTitle = `Test Task ${Date.now()}`;
  const { data: createData, error: createError } = await supabase
    .from("tasks")
    .insert({ title: testTitle, description: "Connection verification test" })
    .select()
    .single();

  if (createError) {
    console.error("  CREATE failed:", createError.message);
  } else {
    console.log("  CREATE succeeded:", JSON.stringify(createData, null, 2));

    // Test 3: Update the test task
    console.log("\n3. Testing UPDATE task...");
    const { data: updateData, error: updateError } = await supabase
      .from("tasks")
      .update({ description: "Updated via connection test", completed: true })
      .eq("id", createData.id)
      .select()
      .single();

    if (updateError) {
      console.error("  UPDATE failed:", updateError.message);
    } else {
      console.log("  UPDATE succeeded:", JSON.stringify(updateData, null, 2));
    }

    // Test 4: Delete the test task
    console.log("\n4. Testing DELETE task...");
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", createData.id);

    if (deleteError) {
      console.error("  DELETE failed:", deleteError.message);
    } else {
      console.log("  DELETE succeeded — test task cleaned up");
    }
  }

  console.log("\n✅ Supabase connection verification complete.");
}

testConnection().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
