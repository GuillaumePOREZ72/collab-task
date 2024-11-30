import { SignUp } from '@clerk/nextjs'
import AuthWrapper from '@/app/components/AuthWrapper'

/**
 * The sign-up page component.
 *
 * This component wraps the Clerk {@link SignUp} component in an
 * {@link AuthWrapper} component, which provides a basic layout for
 * authentication pages.
 *
 * @returns A JSX element containing the wrapped {@link SignUp} component.
 */
export default function Page() {
  return (
    <AuthWrapper>
      <SignUp />
    </AuthWrapper>
  )
}