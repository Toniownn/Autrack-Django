import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

admin.initializeApp();

export const makeAdmin = onCall(async (request) => {
  // request.data contains the input
  // request.auth contains the caller's authentication info

  // Ensure caller is authenticated and admin
//   if (!request.auth?.token?.admin) {
//     throw new Error("Permission denied: only admin users can assign roles");
//   }

  const email = request.data?.email;

  if (!email || typeof email !== "string") {
    throw new Error("Invalid argument: email is required");
  }

  // Get user by email
  const user = await admin.auth().getUserByEmail(email);

  // Assign admin role
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });

  return { message: `${email} is now an admin.` };
});
