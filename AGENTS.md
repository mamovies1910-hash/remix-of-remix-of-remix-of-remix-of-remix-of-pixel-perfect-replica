<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Country flags render through the `Flag` component (`src/components/flag.tsx`, flag-icons SVGs), never emoji flags — many phones show emoji flags as plain letters like "IN".
- Login uses Firebase Authentication (email/password, no email verification — signup logs in directly); the server exchanges the Firebase ID token for an app session so balances stay protected by database rules. Why: money data must not be writable from the browser.
- Setup and the app shell share user-scoped profile query options and the persisted completion flag; identity exchange updates existing rows without resetting defaults. Why: completed setup must survive repeat logins without redundant profile requests.
