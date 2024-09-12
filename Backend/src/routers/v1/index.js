const router = require("express").Router();
const eventsRouter = require("./events.router");
const transactionsRouter = require("./transactions.router");
const authRouter = require("./auth.router");
const usersRouter = require("./users.router");
const routes = [
  {
    path: "/events",
    route: eventsRouter,
  },
  {
    path: "/transactions",
    route: transactionsRouter,
  },
  {
    path: "/users",
    route: usersRouter,
  },
  {
    path: "/auth",
    route: authRouter,
  },
];

routes.map((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
