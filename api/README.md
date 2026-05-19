# phluxjr.net

<img src="assets/icon.png" width="64" height="64" alt="site icon" style="image-rendering: pixelated;">

personal site. runs on FreeBSD in a jail, served by nginx, themed with [catppuccin](https://github.com/catppuccin/catppuccin) mocha (latte for light mode).

---

## stack

- **server:** FreeBSD jail, nginx
- **reverse proxy:** traefik (handles ssl/https)
- **blog:** hugo
- **CGI:** fcgiwrap (zsh/sh/perl scripts)
- **fonts:** JetBrains Mono + Nerd Fonts
- **theme:** catppuccin mocha/latte

---

## structure

```
/
├── index.html          — homepage
├── style.css           — global styles (catppuccin mocha + latte overrides)
├── template.html       — base template for new pages
├── partials/
│   ├── sidebar.html    — SSI-injected sidebar (nav + theme toggle)
│   └── sidebar.js      — sidebar logic (open/close, theme, active link)
├── assets/             — images, icon.png
├── cursors/            — custom pixel art cursors
├── blog/               — hugo-generated blog
├── blog-source/        — hugo source files
├── api/                — CGI endpoints (see below)
├── about/
├── achievements/
├── badtime/            — sans fight
├── blue/               — weezer meme
├── chess/
├── click-the-button/   — THE BUTTON
├── confy/              — config manager (see github.com/Phluxjr23/confy)
├── converter/          — media conversion tools (ffmpeg)
├── doom/               — doom in the browser
├── gameoflife/         — conway's game of life
├── hints/              — hints for site secrets
├── links/              — all my links
├── matrix/
├── minigame/
├── notyet/             — placeholder page
├── party-parrot/
├── peaceful/           — peaceful page
├── spamton/            — deltarune/spamton themed page
├── startpage/          — browser homepage
└── writer/             — markdown editor
```

---

## api endpoints

all endpoints live under `/api/` and are served via fcgiwrap.

### `GET/POST /api/CaaS`
cowsay as a service. written in sh.

```
POST message=hello world
→ cowsay output
```

### `GET/POST /api/8ball`
magic 8ball. written in zsh.

```
POST question=will it work
→ 🎱 heck yeah brother
```

### `GET/POST /api/dice`
dice roller. supports standard dice notation. written in zsh.

```
GET  /api/dice?dice=2d20+5
POST dice=1d6
→ 🎲 Rolling 2d20+5
  Rolls: 14 7
  Total: 26
```

### `GET /api/catppuccin`
catppuccin color palette api. written in sh. supports all four flavors.

```
GET /api/catppuccin?flavor=mocha&color=mauve
→ { "flavor": "mocha", "name": "mauve", "hex": "#cba6f7", ... }

GET /api/catppuccin?flavor=latte&file=css
→ downloads catppuccin-latte.css with all --ctp-* variables

GET /api/catppuccin?flavor=frappe&file=json
→ downloads catppuccin-frappe.json

GET /api/catppuccin?flavor=macchiato&file=txt
→ downloads catppuccin-macchiato.txt with hex + rgb values
```

flavors: `mocha` `latte` `frappe` `macchiato`
file formats: `css` `json` `txt`

### `GET /api/clicker`
global click counter for THE BUTTON. written in perl (for the meme). uses atomic file locking.

```
GET /api/clicker?action=get
→ { "count": 1234 }

GET /api/clicker?action=increment
→ { "count": 1235, "action": "increment" }
```

---

## sidebar

the sidebar is injected into every page via nginx SSI:

```html
<!--#include virtual="/partials/sidebar.html" -->
```

this was added to all html files at once with:

```bash
find . -name "*.html" -not -name "*.bak" -exec sed -i '' 's|<body>|<body>\n<!--#include virtual="/partials/sidebar.html" -->|' {} \;
```

nginx config has `ssi on;` in the `location /` block.

theme preference and sidebar open/closed state are saved to `localStorage`.

---

## adding a new page

1. copy `template.html` to your new directory
2. the SSI include is already in the template
3. add your page to the sidebar links in `partials/sidebar.html`

---

## local dev

you can't really run this locally without fcgiwrap + nginx + traefik but you can fake it:

```bash
# serve static files
python3 -m http.server 8080
```

note: SSI won't work, so the sidebar won't inject. you'll need to test on the server.

---

## git

```bash
git add .
git commit -m "describe what you changed"
```

please do this before making big changes. we lost style.css once already. don't do it again.
