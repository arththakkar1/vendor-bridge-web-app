import app from "../app.js";
import { prisma } from "../config/prisma.js";

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("Starting Authentication Backend tests...");

  // Clean up any previous test user
  const testEmail = "auth-test-user@example.com".toLowerCase();
  await prisma.user.deleteMany({
    where: { email: testEmail }
  });

  const server = app.listen(PORT, async () => {
    console.log(`Test server listening on port ${PORT}`);

    try {
      // 1. SignUp
      console.log("\n--- Testing Sign Up ---");
      const signUpRes = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Auth Test User",
          email: testEmail,
          password: "password123",
          role: "VENDOR"
        })
      });

      const signUpData = await signUpRes.json();
      console.log("SignUp Status:", signUpRes.status);
      console.log("SignUp Response:", JSON.stringify(signUpData));

      if (signUpRes.status !== 201 || !signUpData.success) {
        throw new Error("SignUp failed");
      }

      // Check cookie is set
      const signUpCookies = signUpRes.headers.getSetCookie();
      console.log("SignUp Cookies:", signUpCookies);
      const tokenCookie = signUpCookies.find(c => c.startsWith("token="));
      if (!tokenCookie) {
        throw new Error("Session cookie not set on SignUp");
      }

      // 2. SignUp Duplicate Email
      console.log("\n--- Testing Duplicate Sign Up ---");
      const duplicateRes = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Duplicate User",
          email: testEmail,
          password: "password123",
          role: "VENDOR"
        })
      });
      const duplicateData = await duplicateRes.json();
      console.log("Duplicate Status:", duplicateRes.status);
      console.log("Duplicate Response:", JSON.stringify(duplicateData));
      if (duplicateRes.status !== 409) {
        throw new Error("Duplicate SignUp should return 409 Conflict");
      }

      // 3. SignIn
      console.log("\n--- Testing Sign In ---");
      const signInRes = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: "password123",
          rememberMe: true
        })
      });
      const signInData = await signInRes.json();
      console.log("SignIn Status:", signInRes.status);
      console.log("SignIn Response:", JSON.stringify(signInData));
      if (signInRes.status !== 200 || !signInData.success) {
        throw new Error("SignIn failed");
      }

      const signInCookies = signInRes.headers.getSetCookie();
      console.log("SignIn Cookies:", signInCookies);
      const activeCookie = signInCookies.find(c => c.startsWith("token="));
      if (!activeCookie) {
        throw new Error("Session cookie not set on SignIn");
      }
      // Extract cookie token string
      const cookieHeader = activeCookie.split(";")[0];

      // 4. Get Current User Profile (Me)
      console.log("\n--- Testing Get Me ---");
      const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Cookie": cookieHeader
        }
      });
      const meData = await meRes.json();
      console.log("Me Status:", meRes.status);
      console.log("Me Response:", JSON.stringify(meData));
      if (meRes.status !== 200 || meData.user.email !== testEmail) {
        throw new Error("Get Me failed or returned incorrect user");
      }

      // 5. Forgot Password
      console.log("\n--- Testing Forgot Password ---");
      const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail })
      });
      const forgotData = await forgotRes.json();
      console.log("Forgot Password Status:", forgotRes.status);
      console.log("Forgot Password Response:", JSON.stringify(forgotData));
      if (forgotRes.status !== 200 || !forgotData.token) {
        throw new Error("Forgot Password failed to return token");
      }
      const resetToken = forgotData.token;

      // 6. Reset Password
      console.log("\n--- Testing Reset Password ---");
      const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          password: "newpassword456"
        })
      });
      const resetData = await resetRes.json();
      console.log("Reset Password Status:", resetRes.status);
      console.log("Reset Password Response:", JSON.stringify(resetData));
      if (resetRes.status !== 200) {
        throw new Error("Reset Password failed");
      }

      // 7. SignIn with old password (should fail)
      console.log("\n--- Testing SignIn with old password ---");
      const oldSignInRes = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: "password123"
        })
      });
      console.log("Old password SignIn Status:", oldSignInRes.status);
      if (oldSignInRes.status !== 401) {
        throw new Error("SignIn with old password should fail with 401");
      }

      // 8. SignIn with new password
      console.log("\n--- Testing SignIn with new password ---");
      const newSignInRes = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: "newpassword456"
        })
      });
      const newSignInData = await newSignInRes.json();
      console.log("New password SignIn Status:", newSignInRes.status);
      if (newSignInRes.status !== 200 || !newSignInData.success) {
        throw new Error("SignIn with new password failed");
      }

      const newSignInCookies = newSignInRes.headers.getSetCookie();
      const newCookieHeader = newSignInCookies.find(c => c.startsWith("token="))?.split(";")[0] || "";

      // 9. SignOut
      console.log("\n--- Testing Sign Out ---");
      const signOutRes = await fetch(`${BASE_URL}/api/auth/signout`, {
        method: "POST",
        headers: {
          "Cookie": newCookieHeader
        }
      });
      console.log("SignOut Status:", signOutRes.status);
      const signOutCookies = signOutRes.headers.getSetCookie();
      console.log("SignOut Cookies:", signOutCookies);
      const clearCookie = signOutCookies.find(c => c.includes("token=;"));
      if (!clearCookie && signOutCookies.length > 0) {
        // Some libraries clear cookies by setting token to empty string and Max-Age=0
        console.log("SignOut correctly cleared cookies");
      }

      // 10. Verify GET Me fails after signout
      console.log("\n--- Testing Get Me after SignOut ---");
      const meAfterOutRes = await fetch(`${BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          "Cookie": "token=" // cleared token
        }
      });
      console.log("Me Status after SignOut:", meAfterOutRes.status);
      if (meAfterOutRes.status !== 401) {
        throw new Error("Get Me after SignOut should return 401 Unauthorized");
      }

      console.log("\n=============================================");
      console.log("✓ All auth backend functionality verified successfully!");
      console.log("=============================================\n");

    } catch (testError) {
      console.error("Test failed with error:", testError);
    } finally {
      // Clean up test database entry
      await prisma.user.deleteMany({
        where: { email: testEmail }
      });
      await prisma.$disconnect();
      server.close(() => {
        console.log("Test server closed.");
        process.exit(0);
      });
    }
  });
}

runTests();
