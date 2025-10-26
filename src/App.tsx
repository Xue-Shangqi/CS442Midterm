import { useState, useEffect } from 'react';
import {
  Button,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from '@aws-amplify/ui-react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data"
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

const client: any = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  useEffect(() => {
    // fetchUserProfiles: tries to call a backend client if available, otherwise
    // falls back to showing the currently-authenticated user's minimal profile.
    async function fetchUserProfiles() {
      try {
        // If the generated client exposes convenient helpers, try them.
        if (client && typeof client.list === 'function') {
          const res = await client.list();
          setUserProfiles(res?.items ?? []);
          return;
        }

        // If client has a query function, we can't assume schema here — skip.
        // Fallback: build a profile from the signed-in user attributes.
        const userAny = user as any;
        const profile = {
          username: user?.username ?? userAny?.attributes?.email ?? 'unknown',
          attributes: userAny?.attributes ?? {},
        };
        setUserProfiles([profile]);
      } catch (err) {
        // On any failure, fallback to user-derived profile.
        console.error('fetchUserProfiles error', err);
        const userAny = user as any;
        const profile = {
          username: user?.username ?? userAny?.attributes?.email ?? 'unknown',
          attributes: userAny?.attributes ?? {},
        };
        setUserProfiles([profile]);
      }
    }

    fetchUserProfiles();
  }, [user]);

  return (
    <View padding="1rem">
      <Flex direction="column" gap="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={3}>Simple Auth App</Heading>
          <Button variation="primary" onClick={() => signOut()}>
            Sign out
          </Button>
        </Flex>

        <Divider />

        <Heading level={4}>Signed in as</Heading>
  <div>{user?.username ?? (user as any)?.attributes?.email ?? 'Not available'}</div>

        <Divider />

        <Heading level={4}>User profiles</Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="size-20">
          {userProfiles.length === 0 ? (
            <View padding="1rem">No profiles found</View>
          ) : (
            userProfiles.map((p, i) => (
              <View
                key={i}
                padding="1rem"
                style={{ border: '1px solid var(--amplify-colors-border)', borderRadius: 6 }}
              >
                <Heading level={5}>{p.username ?? `Profile ${i + 1}`}</Heading>
                <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
                  {JSON.stringify(p.attributes ?? p, null, 2)}
                </pre>
              </View>
            ))
          )}
        </Grid>
      </Flex>
    </View>
  );
}
