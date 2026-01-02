import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-wellness-soft">
      <SignUp
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
