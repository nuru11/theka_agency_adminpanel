import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Thiqa Agency"
        description="Sign in to Thiqa Agency"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
