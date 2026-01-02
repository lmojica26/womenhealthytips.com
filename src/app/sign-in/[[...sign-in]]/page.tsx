import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-wellness-soft">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
            headerTitle: "font-poppins",
            formButtonPrimary: "bg-primary hover:bg-primary/90",
          },
        }}
        redirectUrl="/admin"
      />
    </div>
  );
}
