import AuthWrapper from "@/app/components/AuthWrapper";
import { SignIn } from "@clerk/nextjs";

/**
 * The sign-in page component.
 *
 * This component wraps the Clerk {@link SignIn} component in an
 * {@link AuthWrapper} component, which provides a basic layout for
 * authentication pages.
 *
 * @returns A JSX element containing the wrapped {@link SignIn} component.
 */
export default function Page() {
  return (
    <AuthWrapper>
      <SignIn />
    </AuthWrapper>
  );
}
