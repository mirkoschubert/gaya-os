<script lang="ts">
  import { page } from '$app/state'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'

  const errorMessages: Record<string, string> = {
    OAuthSignin: 'An error occurred during sign-in. Please try again.',
    OAuthCallback: 'An error occurred during the OAuth callback.',
    OAuthCreateAccount: 'Could not create an account with this provider.',
    EmailCreateAccount: 'Could not create an account with this email.',
    Callback: 'An error occurred during the authentication callback.',
    OAuthAccountNotLinked:
      'This email is already associated with another account.',
    EmailSignin: 'The sign-in link is invalid or has expired.',
    CredentialsSignin: 'Invalid email or password.',
    SessionRequired: 'You must be signed in to access this page.',
    default: 'An unexpected authentication error occurred.'
  }

  const errorCode = $derived(page.url.searchParams.get('error') ?? 'default')
  const errorMessage = $derived(
    errorMessages[errorCode] ?? errorMessages['default']
  )
</script>

<Card.Root>
  <Card.Header>
    <Card.Title class="text-2xl">Authentication Error</Card.Title>
    <Card.Description>Something went wrong during sign-in.</Card.Description>
  </Card.Header>
  <Card.Content>
    <p class="text-muted-foreground text-sm">{errorMessage}</p>
  </Card.Content>
  <Card.Footer class="flex flex-col gap-2">
    <Button href="/auth/login" class="w-full">Back to sign in</Button>
    <Button href="/" variant="ghost" class="w-full">Go to homepage</Button>
  </Card.Footer>
</Card.Root>
