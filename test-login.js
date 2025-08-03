// Quick test script to verify login functionality
const TEST_CREDENTIALS = {
  patient: {
    email: "patient@example.com",
    password: "password",
    phone: "1234567890",
  },
  doctor: {
    email: "doctor@example.com", 
    password: "password",
    phone: "9876543210",
  },
};

const mockUsers = [
  {
    id: "patient1",
    name: "John Patient",
    email: "patient@example.com",
    phone: "1234567890",
    role: "patient",
    avatar: "/placeholder.svg?height=100&width=100&text=JP",
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "doctor1",
    name: "Dr. Adarsh Babu",
    email: "doctor@example.com",
    phone: "9876543210",
    role: "doctor",
    avatar: "/placeholder.svg?height=100&width=100&text=AB",
    createdAt: "2023-01-15T00:00:00Z",
  },
];

function testLogin(email, password, userType) {
  console.log(`\n=== Testing Login ===`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`UserType: ${userType}`);
  
  // Check credentials
  const testCreds = Object.values(TEST_CREDENTIALS);
  const matchingCred = testCreds.find((cred) => cred.email === email);
  
  console.log(`Matching credential found: ${!!matchingCred}`);
  
  if (matchingCred && password === "password") {
    const user = mockUsers.find((u) => u.email === email && u.role === userType);
    console.log(`Matching user found: ${!!user}`);
    
    if (user) {
      console.log(`✅ SUCCESS: Login would work for ${user.name}`);
      return { success: true, user };
    }
  }
  
  console.log(`❌ FAILED: Invalid credentials`);
  return { success: false };
}

// Test the exact credentials mentioned by user
testLogin("patient@example.com", "password", "patient");
testLogin("patient@example.com", "password", "doctor"); // This should fail
testLogin("doctor@example.com", "password", "doctor");
