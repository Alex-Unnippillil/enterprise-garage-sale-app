"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await signOut();
      } catch (err) {
        console.error("Sign out failed", err);
      } finally {
        sessionStorage.removeItem("idToken");
        sessionStorage.removeItem("refreshToken");
        router.push("/auth/login");
      }
    };

    logout();
  }, [router]);

  return <p>Logging out...</p>;
};

export default LogoutPage;
