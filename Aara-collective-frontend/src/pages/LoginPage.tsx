// src/pages/LoginPage.tsx
import { useState, useMemo } from "react";
import type { Theme } from "@clerk/types";
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  useUser,
} from "@clerk/clerk-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// -------- Types --------
type Props = {
  redirectTo?: string; // Where to send the user after successful auth
  defaultTab?: "sign-in" | "sign-up"; // Optional initial tab
};

const LoginPage = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useUser();

  // Decide the redirect destination after auth:
  // 1) props.redirectTo > 2) a "from" path placed by a ProtectedRoute > 3) "/profile"
  const redirectDestination = useMemo<string>(() => {
    const maybeFrom = location.state as
      | { from?: { pathname?: string } }
      | undefined;
    const fromPath = maybeFrom?.from?.pathname;
    return props.redirectTo || fromPath || "/profile";
  }, [props.redirectTo, location.state]);

  // Read ?tab= from the URL so you can link to /login?tab=sign-up
  const tabFromQuery = useMemo<"sign-in" | "sign-up">(() => {
    const params = new URLSearchParams(location.search);
    const value = params.get("tab");
    if (value === "sign-up") return "sign-up";
    return props.defaultTab || "sign-in";
  }, [location.search, props.defaultTab]);

  const [activeTab, setActiveTab] = useState<"sign-in" | "sign-up">(
    tabFromQuery,
  );

  // Handle tab change and persist in the URL (?tab=...)
  const handleTabChange = (newValue: string) => {
    const nextTab = newValue === "sign-up" ? "sign-up" : "sign-in";
    setActiveTab(nextTab);
    const params = new URLSearchParams(location.search);
    params.set("tab", nextTab);
    navigate(
      { pathname: "/login", search: params.toString() },
      { replace: true },
    );
  };

  // ---- Brand theming for Clerk (pink + gold) ----
  // We use `variables` for base theme colors and `elements` for fine-grained styling.
  const pinkGoldAppearance: Theme = {
    layout: {
      // ensures the providers render as full-width buttons with text
      socialButtonsVariant: "blockButton",
      socialButtonsPlacement: "top",
    },
    variables: {
      // Base palette for Clerk components (doc: Variables prop)
      colorPrimary: "#be185d", // deep pink
      colorPrimaryForeground: "#ffffff", // text on primary
      colorBackground: "#ffffff", // widget card bg
      colorForeground: "#1f2937", // slate-800 text
      colorNeutral: "#fce7f3", // soft pink neutrals
      colorBorder: "#f4d28b", // soft gold borders
      colorRing: "#be185d", // focus ring
      borderRadius: "14px",
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
    elements: {
      socialButtonsBlockButton:
        "bg-white text-gray-900 border border-amber-300 hover:bg-amber-50 shadow-sm",

      // text inside the provider block button
      socialButtonsBlockButtonText: "text-gray-900",

      // optional: make the Google one extra clear (provider-scoped override)
      // If you inspect and see it doesn't apply, the generic rule above is already enough.
      socialButtonsBlockButton__google:
        "bg-white text-gray-900 border border-amber-300 hover:bg-amber-50",
      // Card container of the Clerk widget
      card: "rounded-2xl border border-amber-200 shadow-xl",
      // Headings inside the widget
      headerTitle: "text-pink-700",
      headerSubtitle: "text-amber-700/80",
      // Primary action buttons
      formButtonPrimary:
        "rounded-xl bg-pink-700 hover:bg-pink-800 text-white shadow",
      // Inputs + labels
      formFieldInput:
        "rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-pink-600",
      formFieldLabel: "text-gray-700",
      // Divider styling
      dividerLine: "bg-amber-200",
      // Social buttons row (optional)
      socialButtons: "gap-2",
    },
    // You can also use `layout` to place logo/links if desired
    // layout: { helpPageUrl: "/support", termsPageUrl: "/terms", privacyPageUrl: "/privacy" },
  };

  // If user is already signed in, redirect away
  if (isSignedIn) {
    return <Navigate to={redirectDestination} replace />;
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-pink-50 via-rose-50 to-amber-50">
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-24">

        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src="/public/Logo1.png"
            alt="Aara Collective Logo"
            className="h-32 w-auto "
          />
        </div>
        {/* Heading */}
        <div className="mb-6 text-center">
     
          <p className="mt-2 text-sm text-amber-700/90">
            Sign in or create your account to continue
          </p>
        </div>

        {/* Card + Tabs */}
        <Card className="rounded-2xl border border-amber-00 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-pink-700">
              Account Access
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-pink-100">
                <TabsTrigger
                  value="sign-in"
                  className="data-[state=active]:bg-white data-[state=active]:text-pink-700"
                >
                  Sign in
                </TabsTrigger>
                <TabsTrigger
                  value="sign-up"
                  className="data-[state=active]:bg-white data-[state=active]:text-pink-700"
                >
                  Create account
                </TabsTrigger>
              </TabsList>

              <SignedOut>
                {/* Sign In panel */}
                <TabsContent value="sign-in" className="mt-6">
                  <div className="flex justify-center">
                    <SignIn
                      routing="virtual"
                      afterSignInUrl={redirectDestination}
                      redirectUrl={redirectDestination}
                      appearance={pinkGoldAppearance}
                      signUpUrl="/login?tab=sign-up"
                    />
                  </div>
                </TabsContent>

                {/* Sign Up panel */}
                <TabsContent value="sign-up" className="mt-6">
                  <div className="flex justify-center">
                    <SignUp
                      routing="virtual"
                      afterSignUpUrl={redirectDestination}
                      redirectUrl={redirectDestination}
                      appearance={pinkGoldAppearance}
                      signInUrl="/login?tab=sign-in"
                    />
                  </div>
                </TabsContent>
              </SignedOut>

              <SignedIn>
                <div className="mt-6 text-center text-sm text-gray-600">
                  You are already signed in. Redirecting…
                </div>
              </SignedIn>
            </Tabs>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-amber-700/80">
          By continuing, you agree to our Terms and acknowledge the Privacy
          Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
