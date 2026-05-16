# TODO

## Notifications feature (Dashboard + persistent alerts)

- [ ] Implement backend Notification model + controller + routes.
- [ ] Persist notifications from socket events when receiver is offline.
- [ ] Persist notifications from ChatPage when message/call arrives while receiver is not actively chatting with that user.
- [ ] Add Notifications button to Dashboard UI.
- [ ] Add NotificationsPage UI with navigation to /chat/:userId via react-router state.
- [ ] Add client API methods for notifications (list + mark read + (optional) create quick).
- [ ] Update server/server.js to wire notification routes and save notifications on offline events.
- [ ] Run server/client and manually verify offline + non-active-chat notification persistence.
