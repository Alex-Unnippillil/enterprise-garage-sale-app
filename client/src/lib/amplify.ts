import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID || '',
      loginWith: {
        email: true,
      },
    },
  },
  // Add other AWS services configuration here if needed
  // API: {
  //   GraphQL: {
  //     endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  //     region: process.env.NEXT_PUBLIC_AWS_REGION,
  //   },
  // },
};

// Only configure Amplify on the client side and if we have the required config
if (typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID && 
    process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID) {
  Amplify.configure(amplifyConfig);
}

export default amplifyConfig; 