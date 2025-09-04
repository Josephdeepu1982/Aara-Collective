import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
};

export default SignUpPage;
