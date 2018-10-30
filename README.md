Tag Editor for WIP.chat
===

Makes it easy to replace todo tags (prefixes to your todo).
---

![Gif of Editor in Action](http://public.designbymobi.us/img/wip-todo-updater.gif)

## Config ##

```
var replacement_map = {
  '[create]': "🛠️",
  "🗺️": '[plan]'
}
```

## Results ##

`[create] WIP.chat Tag Editor Repo` -> `🛠️ WIP.chat Tag Editor Repo`

`🗺️ WIP.chat Tag Editor Repo` -> `[plan] WIP.chat Tag Editor Repo`


How to Use
---

```
#1. Open editor.js
#2. Update replacement_map's content with the pairings you want to switch.
#3. Open up your WIP.chat pending page.
#4. Open up your browser's JavaScript console.
#5. Paste the code and run it
```