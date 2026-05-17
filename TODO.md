# TODO

## Admin dashboard + user blocking/removal + auth privacy/security

- [x] Update User model with `role` and `isBlocked`

- [x] Add admin middleware `server/middleware/admin.js`
- [x] Add admin controller actions in `server/controllers/userController.js`
- [x] Add admin routes `server/routes/adminRoutes.js`
- [x] Mount admin routes in `server/server.js`
- [x] Harden auth: block blocked users in `server/middleware/auth.js` and `server/controllers/authController.js`

- [x] (Optional) Include role in JWT payload in `server/utils/jwt.js`

- [ ] Update profile response to include role/isBlocked (for UI gating)
- [x] Add React page `client/src/pages/AdminDashboard.js`
- [x] Add client API calls for admin in `client/src/services/api.js`
- [x] Add `/admin` route with admin guard in `client/src/App.js`
- [ ] Smoke test: login blocking + admin block/unblock/remove
