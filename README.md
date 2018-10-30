Tag Editor for WIP.chat
===

Makes it easy to replace todo tags (prefixes to your todo).
---

```
var replacement_map = {
  '[create]': "🛠️",
  "🗺️": '[plan]'
}
```

creates

`[create] WIP.chat Tag Editor Repo -> 🛠️ WIP.chat Tag Editor Repo`
`🗺️ WIP.chat Tag Editor Repo -> [plan] WIP.chat Tag Editor Repo`


How to Use
---

```
#1. Open editor.js
#2. Update replacement_map's content with the pairings you want to switch.
#3. Open up your WIP.chat pending page.
#4. Open up your browser's JavaScript console.
#5. Paste the code and run it
```