# TODO

## Typing indicator (WhatsApp-like) in Chat

- [ ] Add Socket.IO server handlers for `typing` (and `stop_typing` via timeout behavior).
- [ ] Update `client/src/pages/ChatPage.js` to emit `typing` while user is typing (debounced).
- [ ] Update `client/src/pages/ChatPage.js` to listen for receiver `typing` and render “{name} is typing…” in UI.
- [ ] Quick sanity test: two tabs, verify typing indicator appears and disappears; verify messages still arrive instantly.
