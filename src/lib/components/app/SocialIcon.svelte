<script lang="ts">
  interface Props {
    icon: string
    width?: number | string
    height?: number | string
    class?: string
  }

  let { icon, width = 16, height = 16, class: className }: Props = $props()
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 48 48"
  {width}
  {height}
  class={className}
  style="stroke-width: 2"
  aria-hidden="true"
>
  {#if icon === 'xbrowser'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 32.19c0-.196.075.025.237.5c.874 2.577 4.289 12.631 12.096 4.593c4.111-4.232 2.208-8.463-5.275-9.741c4.28.73 9.094-.477 10.414-5.212c.38-1.362 1.028-9.752 1.028-10.885c0-5.676-4.96-3.892-8.02-1.587c-4.242 3.195-8.805 9.673-10.48 13.15c-1.675-3.477-6.238-9.954-10.48-13.15C10.46 7.553 5.5 5.77 5.5 11.445c0 1.133.647 9.523 1.028 10.885c1.32 4.735 6.133 5.943 10.414 5.212c-7.483 1.278-9.386 5.51-5.275 9.741c7.807 8.038 11.222-2.016 12.096-4.592c.162-.476.237-.697.237-.501"/>
  {:else if icon === 'bluesky'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 32.19c0-.196.075.025.237.5c.874 2.577 4.289 12.631 12.096 4.593c4.111-4.232 2.208-8.463-5.275-9.741c4.28.73 9.094-.477 10.414-5.212c.38-1.362 1.028-9.752 1.028-10.885c0-5.676-4.96-3.892-8.02-1.587c-4.242 3.195-8.805 9.673-10.48 13.15c-1.675-3.477-6.238-9.954-10.48-13.15C10.46 7.553 5.5 5.77 5.5 11.445c0 1.133.647 9.523 1.028 10.885c1.32 4.735 6.133 5.943 10.414 5.212c-7.483 1.278-9.386 5.51-5.275 9.741c7.807 8.038 11.222-2.016 12.096-4.592c.162-.476.237-.697.237-.501"/>
  {:else if icon === 'mastodon'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M41.066 20.402c0 6.257-.972 8.397-2.884 10.19C34.308 34.226 24 33.942 24 33.942a40.3 40.3 0 0 1-7.014-.528s-1.126 7.414 13.104 3.778l-.144 4.24c-2.169.29-22.807 7.92-22.957-18.656L6.934 20.4c0-6.258.05-8.482 2.884-11.611C13.383 4.853 24 5.355 24 5.355s10.617-.502 14.182 3.435c2.834 3.129 2.884 5.354 2.884 11.611"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M24 23.313v-5.978a4.654 4.654 0 0 0-4.654-4.654h0a4.654 4.654 0 0 0-4.654 4.654v9.646M24 17.335a4.654 4.654 0 0 1 4.654-4.654h0a4.654 4.654 0 0 1 4.655 4.654v9.646"/>
  {:else if icon === 'element'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M20.717 11.431C11.208 11.431 3.5 19.14 3.5 28.65m23.783 7.973c9.509 0 17.218-7.709 17.218-17.218M11.42 27.282c0 9.51 7.708 17.218 17.218 17.218m7.973-23.782c0-9.51-7.708-17.218-17.217-17.218"/>
  {:else if icon === 'xmpp'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m5.5 9.5l12 4c0 9 5.5 17.5 18 25C19 36 8 26.5 5.5 9.5"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M11.5 11.5c-1.5 5.378 5.5 24.75 24 27"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M27.892 33.148C35.753 28.288 40.889 20.45 42.5 9.5l-12 4c0 5.492-2.048 10.798-6.485 15.803m-4.007 3.89C17.861 35.01 15.364 36.78 12.5 38.5c4.172-.633 7.993-1.712 11.414-3.248"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M36.5 11.5c1.018 3.65-1.88 13.75-9.634 20.564m-3.403 2.553C20.391 36.563 16.75 37.983 12.5 38.5"/>
  {:else if icon === 'signal'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M9.156 33.457c-4.808-7.548-3.187-17.503 3.768-23.135s17.029-5.148 23.412 1.125s7.043 16.337 1.533 23.389s-15.435 8.847-23.065 4.17L7.52 40.51zm2.631 9.867l1.911-.448m-9.645-3.73l-.78 3.188c-.354 1.45.947 2.763 2.4 2.422l3.187-.746m-3.657-9.568l-.451 1.847m39.854-18.44a21.4 21.4 0 0 0-1.81-4.291M3.4 17.821a21.4 21.4 0 0 1 1.814-4.288m35.495-3.063a21.7 21.7 0 0 0-3.306-3.282M7.308 10.45a21.6 21.6 0 0 1 3.308-3.277m23.686-2.049a21.5 21.5 0 0 0-4.303-1.775M13.72 5.111a21.4 21.4 0 0 1 4.308-1.771m8.315-.713a21.8 21.8 0 0 0-4.656-.004M2.644 26.497a22 22 0 0 1 0-4.994m.75 8.648a21.4 21.4 0 0 0 1.81 4.291M44.6 30.179a21.4 21.4 0 0 1-1.814 4.288m-2.094 3.083a21.6 21.6 0 0 1-3.308 3.277m-23.686 2.049a21.5 21.5 0 0 0 4.303 1.775m16.279-1.762a21.4 21.4 0 0 1-4.308 1.771m15.384-18.163a22 22 0 0 0 0-4.994m-23.699 23.87a21.8 21.8 0 0 0 4.656.004"/>
  {:else if icon === 'peertube'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m8.83 4.5l16.89 9.75L42.6 24l-16.88 9.75L8.83 43.5V24l8.36 4.83l8.42 4.87V14.27l-8.42 4.87L8.83 24z"/>
  {:else if icon === 'misskey'}
    <circle cx="39.393" cy="14.766" r="4.106" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.295a4.635 4.635 0 0 1 4.635-4.635c2.56 0 3.226 1.272 4.002 2.249l9.092 11.677m10.579 8.12a4.635 4.635 0 1 1-9.269 0"/>
    <path fill="none" stroke="currentColor" stroke-miterlimit="5.052" d="M4.5 32.706V15.293"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m14.991 29.726l-1.222-1.573v4.553a4.635 4.635 0 0 1-9.269 0m19.04 0v-4.553l-1.222 1.572m-14.08-8.689l5.532 7.117m9.77 0l5.605-7.224"/>
    <path fill="none" stroke="currentColor" stroke-miterlimit="5.052" d="M14.991 29.726s3.38 4.834 7.326 0"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="5.052" d="M8.27 21.068c-1.548-1.93-3.46-.734-3.76 1.078m17.72 2.44c1.445 1.67 3.292 1.15 4.379-.383m2.535-3.275a2.046 2.046 0 0 1 3.653.33"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="5.052" d="M16.517 17.221c1.427 1.893 2.848 1.93 4.35.059l3.544-4.584c.688-.812 1.203-2.036 3.763-2.036a4.635 4.635 0 0 1 4.635 4.634v17.413"/>
    <path fill="none" stroke="currentColor" stroke-miterlimit="5.052" d="M39.392 20.646a4.106 4.106 0 0 0-4.106 4.106v8.483a4.107 4.107 0 0 0 8.214 0v-8.483a4.107 4.107 0 0 0-4.108-4.106Z"/>
  {:else if icon === 'diaspora'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M19 4.49h10v13.08l12.45-4L44.5 23l-12.45 4l7.67 10.57l-8 5.87L24 32.94l-7.67 10.57l-8-5.87L16 27.07L3.5 23l3.09-9.5l12.45 4Z"/>
  {:else if icon === 'funkwhale'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M42.5 23.093a18.5 18.5 0 0 1-37 0"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M35.335 23.093a11.335 11.335 0 1 1-22.67 0"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M29.463 23.093a5.463 5.463 0 0 1-10.926 0m5.173-.134c-2.689 0-.717-6.244-3.445-7.422c-2.938-1.269-9.27-1.195-9.988-9.13A27.9 27.9 0 0 1 18.1 7.911c3 1.284 4.821 1.198 6.208 4.582c0 0 .53-2.953 4.994-4.187a35.4 35.4 0 0 1 8.02-1.287a6.7 6.7 0 0 1-1.947 5.684c-2.53 2.332-7.963 2.273-8.441 4.652c-.49 2.432-.536 5.604-3.224 5.604"/>
  {:else if icon === 'briar'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M35.32 28.09V8.5a3 3 0 0 0-3-3h-1.21a3 3 0 0 0-3 3v19.59Zm-7.21 7.22v4.19a3 3 0 0 0 3 3h1.21a3 3 0 0 0 3-3v-4.19ZM12.7 28.09H8.51a3 3 0 0 0-3 3v1.22a3 3 0 0 0 3 3h4.19Zm26.81 0H19.92v7.22h19.59a3 3 0 0 0 3-3v-1.22a3 3 0 0 0-3-3m-11.4-15.4H8.51a3 3 0 0 0-3 3v1.22a3 3 0 0 0 3 3h19.6Zm11.4 0h-4.19v7.22h4.19a3 3 0 0 0 3-3v-1.22a3 3 0 0 0-3-3"/>
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M19.92 12.69V8.5a3 3 0 0 0-3-3H15.7a3 3 0 0 0-3 3v4.19Zm-7.22 7.22V39.5a3 3 0 0 0 3 3h1.22a3 3 0 0 0 3-3V19.91Z"/>
  {:else if icon === 'fairemail'}
    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M20.51 7.18c.84-.55.07-.55 3.49-.55s2.37-.13 3.49.55l12.83 10.07H7.68ZM7.68 17.25v2.5l12.39 9.71l2 1.3c2 1.13 2 1.13 3.93 0l2-1.3l12.39-9.71v-2.5l3.18 2.5v21.63H4.5V19.75Z"/>
  {/if}
</svg>
