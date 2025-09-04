// ProtectedRoute.tsx
import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: ReactNode;
  requireAdmin?: boolean; // optional prop, if true, only admins can enter
};

// Protects routes so only signed-in users (or admins) can see them
const ProtectedRoute = (props: Props) => {
  const { isSignedIn, user } = useUser();

  // If not signed in → redirect to sign-in page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // If the route requires admin, check Clerk metadata
  if (props.requireAdmin) {
    const userRole = user?.publicMetadata?.role;

    if (userRole !== "admin") {
      // If not admin → send them to home
      return <Navigate to="/" replace />;
    }
  }

  // Otherwise → render the protected page
  return <>{props.children}</>;
};

export default ProtectedRoute;
