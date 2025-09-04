// src/pages/UserProfilePage.tsx
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserProfile,
  useClerk,
} from "@clerk/clerk-react";
import type { Theme } from "@clerk/types";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------- Summary ----------------
// This page shows the Clerk User Profile when the user is signed in,
// themed with Aara’s pink + soft gold palette. It also provides a clear
// Sign out button. If the user is signed out, it renders a prompt with
// a button that redirects to the sign-in flow.

// Props type definition for consistency
type Props = {};

// Pink + gold theme for Clerk's UserProfile component.
// Using `satisfies Theme` ensures proper type-checking and keeps literal strings intact.
const pinkGoldAppearance = {
  variables: {
    colorPrimary: "#be185d", // deep pink
    colorPrimaryForeground: "#ffffff",
    colorBackground: "#ffffff",
    colorForeground: "#1f2937", // slate-800
    colorNeutral: "#fce7f3", // soft pink neutral
    colorBorder: "#f4d28b", // soft gold border
    colorRing: "#be185d",
    borderRadius: "14px",
    fontFamily: "Inter, ui-sans-serif, system-ui",
  },
  elements: {
    // Container + card
    rootBox: "w-full",
    card: "rounded-2xl border border-amber-200 shadow-xl bg-white/95",
    // Headings
    headerTitle: "text-pink-700",
    headerSubtitle: "text-amber-700/80",
    // Form controls
    formButtonPrimary: "rounded-xl bg-pink-700 hover:bg-pink-800 text-white",
    formFieldInput:
      "rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-pink-600",
    formFieldLabel: "text-gray-700",
    // Navigation inside UserProfile
    navbar: "border-r border-amber-200 bg-pink-50/40",
    navbarButton:
      "data-[active=true]:text-pink-700 data-[active=true]:bg-white rounded-lg",
    // Dividers
    dividerLine: "bg-amber-200",
  },
} satisfies Theme;

// A page that shows the Clerk User Profile if signed in.
// If not signed in, it will redirect to the Sign In page.
const UserProfilePage = (props: Props) => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Signs out the current session and sends the user to a public route.
  const handleSignOutClick = async () => {
    try {
      await signOut(); // end Clerk session
      navigate("/"); // navigate to a safe public page
    } catch (signOutError) {
      // In a real app, show a toast or log the error
      console.error("Failed to sign out:", signOutError);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50 flex items-center justify-center px-4 py-24">
      {/* If the user is signed in, show their profile */}
      <SignedIn>
        <Card className="w-full max-w-4xl shadow-xl rounded-2xl border border-amber-200 bg-white/90 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold text-pink-700">
              My Profile
            </CardTitle>

            {/* Top-right actions: Go Home + Sign Out */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="border-amber-200"
              >
                Home
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOutClick}
                className="bg-pink-700 hover:bg-pink-800 text-white"
              >
                Sign out
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Clerk's ready-made profile component, themed to pink+gold */}
            <UserProfile
              routing="path"
              path="/profile"
              appearance={pinkGoldAppearance}
            />
          </CardContent>
        </Card>
      </SignedIn>

      {/* If the user is signed out, show a message + sign in redirect */}
      <SignedOut>
        <div className="text-center space-y-4 bg-white/80 backdrop-blur rounded-2xl p-6 border border-amber-200 shadow">
          <p className="text-gray-700">
            You need to be signed in to view your profile.
          </p>
          {/* Using a button wrapper to keep styling consistent with the site */}
          <Button asChild className="bg-pink-700 hover:bg-pink-800 text-white">
            <RedirectToSignIn />
          </Button>
        </div>
      </SignedOut>
    </div>
  );
};

export default UserProfilePage;
