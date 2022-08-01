This is the back-end of the Fast Food Manager project.

Exposes REST APIs allowing clients to connect and make requests.

# Fast Food Manager
Simple web-application for managing and handling orders for a fast-food/restaurant.

## Features
### Administrators
Allows Administrators of the fast-food/restaurant to edit the menu and view all transactions.

### Chefs
Allows Chefs of the fast-food/restaurant to view all active orders, take one order in charge and complete it.
Chefs get notified about a new order in real-time.

Administrators and Chefs must be authenticated.

### Clients
Clients can view the menu, send an order and view the order status in real-time.
Order status can be: "Order received", "Order took in charge" and "Order ready".

Clients do not need authentication.

## Security
Authentication and Security is implemented using a Bearer token.
When administrators/chefs authenticate, they receive a token.
The token must be sent via HTTP Authorization Header and is then validated.