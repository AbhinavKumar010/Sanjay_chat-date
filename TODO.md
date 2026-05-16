# TODO

## Video call notifications fix

- [x] Inspect existing Socket.IO + WebRTC signaling flow in `client/src/pages/ChatPage.js` and `server/server.js`.
- [x] Fix call notification persistence on receiver side: when `incoming_call` is received for the logged-in user, always create `/notifications/quick` notification (instead of depending on `selectedUserRef`).
- [x] Add server-side logging around `call_user` delivery and `onlineUsers.get(data.to)` lookup.
- [ ] Run/retest flow with 2 users:
  - [ ] User A taps **Start Video Call**
  - [ ] Verify User B receives `incoming_call` (check both browser console + server logs)
  - [ ] Verify User B gets a call notification in **Notifications** page.
