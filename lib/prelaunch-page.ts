import { launchAt, privateHeaders } from "@/lib/prelaunch";

const title = "MedPath Mentor | Coming February 1, 2027";
const description = "A study and career mentor for healthcare students. Meet Atlas and join the waitlist for launch and Founding Member updates.";

const publicStyles = `
  :root { color-scheme: light; font-family: system-ui, sans-serif; color: #152339; background: #fafafa; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: clamp(.75rem, 4vw, 2.5rem); }
  [hidden] { display: none !important; }
  .card {
    width: min(100%, 52rem); margin: auto; text-align: center;
    padding: 0 clamp(1rem, 4vw, 2.5rem) clamp(1.25rem, 4vw, 2rem);
    background: #f4f5fa; border: 1px solid #dcdde2; border-radius: clamp(1rem, 4vw, 2rem);
  }
  header {
    padding: clamp(1.4rem, 5vw, 2.4rem) 0; border-bottom: 1px solid #dcdde2;
    font-size: clamp(1.15rem, 4vw, 2rem); font-weight: 750; text-transform: uppercase;
  }
  #launch-status {
    margin: clamp(1.4rem, 5vw, 2.65rem) 0 .8rem; text-transform: uppercase;
    color: #565b63; font-size: clamp(.82rem, 2.6vw, 1.35rem);
  }
  h1 {
    margin: 0 auto; max-width: 20ch; font-size: clamp(1.85rem, 5.6vw, 3.65rem);
    line-height: 1.17; letter-spacing: -.035em; text-wrap: balance;
  }
  .intro {
    margin: 1rem auto; max-width: 48ch; color: #505a70; font-size: clamp(1rem, 3vw, 1.7rem);
    line-height: 1.42; text-wrap: balance;
  }
  .countdown { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(.4rem, 2vw, 1rem); }
  .countdown div {
    display: grid; gap: clamp(.4rem, 2.6vw, 1.6rem); padding: clamp(.8rem, 3vw, 1.65rem) .2rem;
    background: #152339; border-radius: clamp(.65rem, 2vw, 1.15rem); color: #fff;
    font-size: clamp(.7rem, 2.5vw, 1.3rem); text-transform: uppercase;
  }
  .countdown strong { font-size: clamp(1.75rem, 6vw, 3.75rem); font-weight: 650; font-variant-numeric: tabular-nums; }
  #waitlist { margin-top: clamp(1.3rem, 4vw, 2.25rem); }
  h2 { margin: 0 auto .8rem; max-width: 34ch; font-size: clamp(1.1rem, 3.4vw, 2rem); line-height: 1.4; font-weight: 600; text-wrap: balance; }
  form { display: grid; gap: .55rem; text-align: left; }
  input[type=email], button {
    width: 100%; min-width: 0; padding: clamp(.8rem, 2.8vw, 1.4rem);
    font: inherit; font-size: clamp(1rem, 3vw, 1.65rem); border-radius: clamp(.65rem, 2vw, 1.15rem);
  }
  input[type=email] { background: transparent; color: #152339; border: 1px solid #aab2c2; }
  input[type=email]::placeholder { color: #626c80; }
  button { background: #152339; color: #fff; border: 0; font-weight: 650; cursor: pointer; }
  :focus-visible { outline: 3px solid #375a8e; outline-offset: 3px; }
  .consent { display: flex; align-items: flex-start; gap: .45rem; color: #505a70; font-size: .88rem; }
  .consent input { margin: .2em 0 0; accent-color: #152339; }
  .founding { margin: .65rem 0 0; color: #565b63; font-size: clamp(.93rem, 2.6vw, 1.4rem); }
  .privacy { margin: .7rem 0 0; color: #505a70; font-size: .8rem; overflow-wrap: anywhere; }
  a { color: inherit; }
  .status { margin: 0 0 .6rem; }
  .status:empty { display: none; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
`;

const adminStyles = `
  :root { color-scheme: dark; font-family: system-ui, sans-serif; color: #f5f9ff; background: #07192d; }
  * { box-sizing: border-box; }
  body { margin: 0; background: radial-gradient(ellipse at 75% 30%, #102f4c, #07192d 63%); min-height: 100vh; }
  .login { width: min(30rem, 100% - 2.5rem); margin: auto; padding-top: 12vh; }
  h1 { font-size: 2.5rem; line-height: .99; letter-spacing: -.055em; margin: .55rem 0 1.3rem; max-width: 12ch; }
  label { display: block; font-size: .9rem; font-weight: 650; }
  input { width: 100%; background: #07192d; color: #fff; border: 1px solid #708ca7; border-radius: .55rem; padding: .8rem; font: inherit; margin: .5rem 0 1rem; }
  button { font: inherit; font-weight: 750; background: #8de9e0; color: #07192d; border: 0; border-radius: .55rem; padding: .8rem 1.25rem; cursor: pointer; }
  :focus-visible { outline: 3px solid #8de9e0; outline-offset: 3px; }
`;

const script = `
  const deadline = Date.parse(${JSON.stringify(launchAt)});
  const countdown = document.getElementById("countdown");
  const fields = [...countdown.querySelectorAll("strong")];
  const refresh = () => {
    const minutes = Math.max(0, Math.ceil((deadline - Date.now()) / 60000));
    const values = [Math.floor(minutes / 1440), Math.floor(minutes / 60) % 24, minutes % 60];
    fields.forEach((field, index) => { field.textContent = String(values[index]).padStart(2, "0"); });
    if (minutes === 0) {
      countdown.hidden = true;
      document.getElementById("launch-status").textContent = "The countdown has ended. Join the waitlist for the opening announcement.";
    }
    return minutes;
  };
  if (refresh() > 0) {
    const timer = setInterval(() => { if (refresh() === 0) clearInterval(timer); }, 1000);
  }
  const result = new URLSearchParams(location.search).get("waitlist");
  const messages = new Map([
    ["joined", "Thanks for joining the MedPath Mentor waitlist."],
    ["invalid", "Enter a valid email address and confirm your consent."],
    ["unavailable", "The waitlist is temporarily unavailable. Please try again."]
  ]);
  if (messages.has(result)) {
    document.getElementById("waitlist-status").textContent = messages.get(result);
    history.replaceState(null, "", "/#waitlist");
  }
`;

function page(body: string, options: { host?: string } = {}) {
  const nonce = crypto.randomUUID();
  const host = options.host;
  const origin = host && /^[a-z0-9.:[\]-]+$/i.test(host) ? `https://${host}` : "";
  const metadata = host ? `
    <meta name="description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${origin}/">
    <meta property="og:image" content="${origin}/prelaunch-social.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Atlas, the MedPath Mentor mascot">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="${origin}/">
    <link rel="icon" href="/medpath-favicon.png">` : '<meta name="robots" content="noindex,nofollow">';
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${host ? title : "MedPath Mentor administrator access"}</title>${metadata}
    <style nonce="${nonce}">${host ? publicStyles : adminStyles}</style></head><body>${body}
    ${host ? `<script nonce="${nonce}">${script}</script>` : ""}</body></html>`, {
    headers: {
      ...privateHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": `default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; img-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      ...(host ? {} : { "X-Robots-Tag": "noindex, nofollow" })
    }
  });
}

export function comingSoon(host: string) {
  return page(`
    <main class="card">
      <header>MedPath Mentor</header>
      <p id="launch-status">Coming <time datetime="${launchAt}" title="12:00 AM Eastern">February 1, 2027</time></p>
      <h1>Your future in healthcare starts here.</h1>
      <p class="intro">Your all-in-one healthcare education, career preparation and AI-powered learning platform.</p>
      <div class="countdown" id="countdown" aria-label="Launch countdown">
        <div><strong>–</strong>Days</div>
        <div><strong>–</strong>Hours</div>
        <div><strong>–</strong>Minutes</div>
      </div>
      <section id="waitlist">
        <h2>Be among the first to experience MedPath Mentor.</h2>
        <p class="status" id="waitlist-status" role="status"></p>
        <form action="/api/prelaunch/waitlist" method="post">
          <label class="sr-only" for="email">Email address</label>
          <input id="email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="Enter your email address">
          <div hidden><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
          <label class="consent"><input type="checkbox" name="consent" value="yes" required> I agree to receive MedPath Mentor launch and Founding Member emails.</label>
          <button type="submit">Join the waitlist</button>
        </form>
        <p class="founding">Exclusive Founding Member opportunities coming soon.</p>
        <p class="privacy">To withdraw consent or request deletion, email <a href="mailto:Medpath.space@gmail.com">Medpath.space@gmail.com</a>.</p>
      </section>
    </main>
  `, { host });
}

export function previewSignIn() {
  return page(`<main class="login"><h1>Administrator access</h1>
    <form action="/api/prelaunch/session" method="post">
      <label for="token">Administrator access token</label>
      <input id="token" type="password" name="token" autocomplete="current-password" maxlength="256" required>
      <button type="submit">Open preview</button>
    </form></main>`);
}
