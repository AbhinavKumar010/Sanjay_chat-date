# TODO (notifications + video call fixes)

- [x] Fix notifications reliability (mark-read consistency)
- [x] Improve notification mark-read to return updated doc / handle missing id safely
- [x] Fix WebRTC call routing id mismatch between ChatPage and VideoCallPage
- [ ] Add defensive fallbacks for incoming_call offer payload key
- [ ] Add server-side console logs to confirm join/routing for call events
- [ ] Run servers and verify:
  - [ ] Notifications: new message/call appears and marks read correctly
  - [ ] Video call: caller sees call active, receiver can answer, remote stream renders
