import { AuthGuard } from "@/components/auth/auth-guard";
import { LoginIllustration } from "@/components/auth/login-illustration";
import { LoginLayout } from "@/components/auth/login-layout";
import { LoginPanel } from "@/components/auth/login-panel";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthGuard guestOnly>
      <LoginLayout illustration={<LoginIllustration />}>
        <LoginPanel>
          <LoginForm />
        </LoginPanel>
      </LoginLayout>
    </AuthGuard>
  );
}
