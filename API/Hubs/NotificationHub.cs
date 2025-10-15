using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task JoinUserGroup()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
                await Clients.Caller.SendAsync("JoinedUserGroup", $"Joined notifications for user {userId}");
            }
        }

        public async Task JoinAdminGroup()
        {
            var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
            if (userRoles != null && (userRoles.Contains("Admin") || userRoles.Contains("Manager")))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                await Clients.Caller.SendAsync("JoinedAdminGroup", "Joined admin notifications");
            }
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userName = Context.User?.Identity?.Name;

            // Auto-join user to their personal group
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }

            // Auto-join admins to admin group
            var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
            if (userRoles != null && (userRoles.Contains("Admin") || userRoles.Contains("Manager")))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }

            Console.WriteLine($"SignalR: User {userName} connected (ID: {userId})");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userName = Context.User?.Identity?.Name;
            Console.WriteLine($"SignalR: User {userName} disconnected");
            await base.OnDisconnectedAsync(exception);
        }
    }
}