# ENV SAMPLE (HUB#2)

> Copy these keys to Netlify → Site → *Environment variables*.
> Values shown here are examples/placeholders only.

- `SUPABASE_URL` = https://YOUR-PROJECT-REF.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = ***service role secret from Supabase***
- `NODE_VERSION` = 18

## Notes
- `SUPABASE_SERVICE_ROLE_KEY` must be scoped to **Builds + Functions + Runtime** and set for **Production** and **Deploy Previews**.
- Keep service role key secret. Never commit real values to Git.
