"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const TokenHandler = () => {
  const router = useRouter();
  const { user } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    const storeTokens = async () => {
      const session = await fetchAuthSession();
      const { idToken, refreshToken } = session.tokens ?? {};
      if (idToken) {
        sessionStorage.setItem("idToken", idToken.toString());
      }
      if (refreshToken) {
        sessionStorage.setItem("refreshToken", refreshToken.toString());
      }
      router.push("/");
    };

    if (user) {
      storeTokens();
    }
  }, [user, router]);

  return null;
};

const LoginPage = () => {
  return (
    <Authenticator initialState="signIn">
      <TokenHandler />
    </Authenticator>
  );
};

export default LoginPage;
