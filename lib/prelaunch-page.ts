import { launchAt, privateHeaders } from "@/lib/prelaunch";

const title = "MedPath Mentor | Coming February 1, 2027";
const description = "A study and career mentor for healthcare students. Meet Atlas and join the waitlist for launch and Founding Member updates.";

const styles = `
  :root{color-scheme:dark;font-family:system-ui,sans-serif;background:#07192d;color:#f5f9ff}
  [hidden]{display:none!important}
  *{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 75% 30%,#102f4c,#07192d 63%);min-height:100vh}
  main,header,footer{width:min(1120px,100% - 2.5rem);margin:auto}
  header{padding:1.65rem 0;border-bottom:1px solid #25415d;display:flex;align-items:center;gap:.7rem;font-weight:750}
  header img{width:36px;height:36px;border-radius:9px}
  .hero{display:grid;grid-template-columns:1.15fr .85fr;align-items:center;gap:2rem;padding:clamp(2rem,7vw,5.5rem) 0 2rem}
  .eyebrow{color:#8de9e0;font-weight:750;font-size:.82rem;letter-spacing:.12em;text-transform:uppercase}
  h1{font-size:clamp(2.5rem,6vw,5.3rem);line-height:.99;letter-spacing:-.055em;margin:.55rem 0 1.3rem;max-width:12ch}
  h2{margin:.4rem 0;font-size:1.5rem}p{color:#c4d5ea;line-height:1.55;margin:.6rem 0 1rem}
  .intro{max-width:52ch;font-size:1.12rem}
  figure{margin:0;text-align:center;background:#07192d;border:1px solid #274563;border-radius:1.5rem;overflow:hidden}
  figure img{width:100%;display:block;aspect-ratio:1;object-fit:cover}
  figcaption{padding:0 1rem 1.25rem;color:#c4d5ea}figcaption strong{color:#8de9e0}
  .countdown{display:grid;grid-template-columns:repeat(4,1fr);gap:.5rem;max-width:30rem;margin-top:1rem}
  .countdown div{padding:.65rem .25rem;background:#112b45;border:1px solid #284862;border-radius:.65rem;text-align:center;color:#c4d5ea;font-size:.74rem}
  .countdown strong{display:block;font-variant-numeric:tabular-nums;font-size:clamp(1.3rem,4vw,2rem);color:#fff}
  .panels{display:grid;grid-template-columns:1.15fr .85fr;gap:1rem}
  .panel{padding:clamp(1.15rem,3vw,2rem);border:1px solid #2a4764;border-radius:1rem;background:#102942}
  a{color:#8de9e0}
  label{display:block;font-size:.9rem;font-weight:650}input[type=email],input[type=password]{width:100%;min-width:0;background:#07192d;color:#fff;border:1px solid #708ca7;border-radius:.55rem;padding:.8rem;font:inherit}
  .input-row{display:grid;grid-template-columns:1fr auto;gap:.55rem;margin:.45rem 0 .85rem}
  button{font:inherit;font-weight:750;background:#8de9e0;color:#07192d;border:0;border-radius:.55rem;padding:.8rem 1.25rem;cursor:pointer}
  :focus-visible{outline:3px solid #8de9e0;outline-offset:3px}.consent{display:flex;gap:.45rem;align-items:flex-start;color:#d0dff1;font-weight:500}
  .status{margin:0;color:#baf8ef}.status:empty{display:none}
  footer{color:#9fb8d3;padding:1.8rem 0;font-size:.85rem}
  .login{max-width:30rem;padding-top:12vh}.login h1{font-size:2.5rem}.login input{margin:.5rem 0 1rem}
  @media(max-width:720px){.hero,.panels{grid-template-columns:1fr}.hero{gap:1.3rem}figure{width:min(100%,24rem);justify-self:center;grid-row:2}.hero{padding-top:2rem}}
  @media(max-width:380px){.input-row{grid-template-columns:1fr}}
`;

const script = `
  const deadline = Date.parse(${JSON.stringify(launchAt)});
  const countdown = document.getElementById("countdown");
  const fields = [...countdown.querySelectorAll("strong")];
  const refresh = () => {
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    fields.forEach((field, index) => { field.textContent = String(values[index]).padStart(2, "0"); });
    if (seconds === 0) {
      countdown.hidden = true;
      document.getElementById("launch-status").textContent = "The countdown has ended. Join the waitlist for the opening announcement.";
    }
    return seconds;
  };
  if (refresh() > 0) {
    const timer = setInterval(() => { if (refresh() === 0) clearInterval(timer); }, 250);
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
    <style nonce="${nonce}">${styles}</style></head><body>${body}
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
    <header><img src="/medpath-favicon.png" alt="" width="36" height="36">MedPath Mentor</header>
    <main>
      <section class="hero">
        <div>
          <div class="eyebrow">Coming soon</div>
          <h1>Find your path in healthcare.</h1>
          <p class="intro">Meet Atlas, your study and career mentor for certification prep, clinical confidence, and the next step in healthcare.</p>
          <p id="launch-status">Scheduled launch <time datetime="${launchAt}">February 1, 2027 at 12:00 AM Eastern</time></p>
          <div class="countdown" id="countdown" aria-label="Launch countdown">
            <div><strong>–</strong>Days</div><div><strong>–</strong>Hours</div>
            <div><strong>–</strong>Minutes</div><div><strong>–</strong>Seconds</div>
          </div>
        </div>
        <figure>
          <img src="/prelaunch-atlas.webp" width="640" height="640" alt="Atlas, a navy and white robot holding a study notebook">
          <figcaption><strong>Meet Atlas</strong> · Your MedPath guide</figcaption>
        </figure>
      </section>
      <div class="panels">
        <section class="panel" id="waitlist">
          <h2>Join the waitlist</h2>
          <p>Get the launch announcement and Founding Member details by email.</p>
          <p class="status" id="waitlist-status" role="status"></p>
          <form action="/api/prelaunch/waitlist" method="post">
            <label for="email">Email address</label>
            <div class="input-row"><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com">
            <button type="submit">Join the waitlist</button></div>
            <div hidden><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
            <label class="consent"><input type="checkbox" name="consent" value="yes" required> I agree to receive MedPath Mentor launch and Founding Member emails.</label>
          </form>
          <p><small>To withdraw consent or request deletion, email <a href="mailto:Medpath.space@gmail.com">Medpath.space@gmail.com</a>.</small></p>
        </section>
        <section class="panel">
          <div class="eyebrow">Coming at launch</div>
          <h2>Founding Member program</h2>
          <p>Be among the first to hear how to become a Founding Member and help shape MedPath Mentor as it grows.</p>
        </section>
      </div>
    </main>
    <footer>MedPath Mentor · Learn. Practice. Pass.</footer>
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
