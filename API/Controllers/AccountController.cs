using API.Data;
using API.Dto;
using API.Entities;
using API.RequestHelpers.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Services;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;
        private readonly StoreContext _context;
        public AccountController(UserManager<User> userManager, TokenService tokenService, StoreContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email!);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password!))
            {
                return Unauthorized();
            }

            var userBasket = await RetrieveBasket(user.UserName!);
            var anonBasket = await RetrieveBasket(Request.Cookies["buyerId"]!);

            if (anonBasket != null)
            {

                if (userBasket != null) _context.Baskets!.Remove(userBasket);
                anonBasket.UserId = user.UserName!;
                Response.Cookies.Delete("buyerId");
                await _context.SaveChangesAsync();
            }

            return new UserDto
            {
                Email = user.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = anonBasket != null ? anonBasket.MapBasketToDto() : userBasket?.MapBasketToDto(),
                Name = user.Name,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Roles = (await _userManager.GetRolesAsync(user)).ToList()
            };

        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser(RegisterDto registerDto)
        {

            var user = new User { UserName = registerDto.Username, Email = registerDto.Email };
            var result = await _userManager.CreateAsync(user, registerDto.Password!);

            if (!result.Succeeded)
            {

                foreach (var error in result.Errors)
                {

                    ModelState.AddModelError(error.Code, error.Description);

                }
                return ValidationProblem();
            }

            await _userManager.AddToRoleAsync(user, "Member");

            return StatusCode(201);
        }

        [Authorize]
        [HttpGet("currentUser")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {

            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
            var userBasket = await RetrieveBasket(User.Identity.Name!);

            return new UserDto
            {
                Email = user!.Email,
                Token = await _tokenService.GenerateToken(user),
                Basket = userBasket?.MapBasketToDto(),
                Name = user.Name,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Roles = (await _userManager.GetRolesAsync(user)).ToList()
            };
        }

        [Authorize]
        [HttpGet("savedAddress")]
        public async Task<ActionResult<UserAddress?>> GetSavedAddress()
        {

            return await _userManager.Users
                .Where(x => x.UserName == User.Identity!.Name)
                .Select(user => user.Address)
                .FirstOrDefaultAsync();
        }

        private async Task<Basket?> RetrieveBasket(string buyerId)
        {

            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");
                return null;
            }

            return await _context.Baskets!
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.UserId == buyerId);
        }

        [Authorize]
        [HttpPut("updateUser")]
        public async Task<ActionResult<UserDto>> UpdateUser([FromForm] UserDto userDto)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
            {
                return NotFound("User not found");
            }

            user.Name = userDto.Name;
            user.LastName = userDto.LastName;
            user.PhoneNumber = userDto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new UserDto
                {
                    Email = user.Email,
                    Name = user.Name,
                    LastName = user.LastName,
                    PhoneNumber = user.PhoneNumber,
                    Roles = (await _userManager.GetRolesAsync(user)).ToList()
                });
            }

            // Log the errors for debugging
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(new ProblemDetails { Title = "Problem updating user" });
        }

        [Authorize]
        [HttpPut("changePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword!, changePasswordDto.NewPassword!);

            if (result.Succeeded)
            {
                return Ok(new { message = "Password changed successfully" });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return BadRequest(new ProblemDetails { Title = "Problem changing password" });
        }

        // Address management endpoints
        [Authorize]
        [HttpGet("addresses")]
        public async Task<ActionResult<List<UserAddress>>> GetAddresses()
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound("User not found");

            var addresses = await _context.Set<UserAddress>()
                .Where(a => a.UserId == user.Id)
                .ToListAsync();

            return Ok(addresses);
        }

        [Authorize]
        [HttpPost("addresses")]
        public async Task<ActionResult<UserAddress>> AddAddress([FromBody] UserAddress address)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound("User not found");

            // Set the UserId for the new address
            address.UserId = user.Id;

            // If this is set as default, unset all other default addresses for this user
            if (address.IsDefault)
            {
                var existingAddresses = await _context.Set<UserAddress>()
                    .Where(a => a.UserId == user.Id)
                    .ToListAsync();

                foreach (var addr in existingAddresses)
                {
                    addr.IsDefault = false;
                }
            }

            _context.Set<UserAddress>().Add(address);
            await _context.SaveChangesAsync();

            return Ok(address);
        }

        [Authorize]
        [HttpPut("addresses/{id}")]
        public async Task<ActionResult> UpdateAddress(int id, [FromBody] UserAddress updatedAddress)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound("User not found");

            var address = await _context.Set<UserAddress>()
                .FirstOrDefaultAsync(a => a.UserAddressId == id && a.UserId == user.Id);

            if (address == null)
                return NotFound("Address not found");

            // Update address fields
            address.FirstName = updatedAddress.FirstName;
            address.LastName = updatedAddress.LastName;
            address.AddressLine1 = updatedAddress.AddressLine1;
            address.AddressLine2 = updatedAddress.AddressLine2;
            address.City = updatedAddress.City;
            address.State = updatedAddress.State;
            address.PostalCode = updatedAddress.PostalCode;
            address.Country = updatedAddress.Country;
            address.PhoneNumber = updatedAddress.PhoneNumber;
            address.Company = updatedAddress.Company;

            // If this is set as default, unset all other default addresses
            if (updatedAddress.IsDefault && !address.IsDefault)
            {
                var otherAddresses = await _context.Set<UserAddress>()
                    .Where(a => a.UserId == user.Id && a.UserAddressId != id)
                    .ToListAsync();

                foreach (var addr in otherAddresses)
                {
                    addr.IsDefault = false;
                }
                address.IsDefault = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Address updated successfully" });
        }

        [Authorize]
        [HttpDelete("addresses/{id}")]
        public async Task<ActionResult> DeleteAddress(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound("User not found");

            var address = await _context.Set<UserAddress>()
                .FirstOrDefaultAsync(a => a.UserAddressId == id && a.UserId == user.Id);

            if (address == null)
                return NotFound("Address not found");

            _context.Set<UserAddress>().Remove(address);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Address deleted successfully" });
        }

        [Authorize]
        [HttpPut("addresses/{id}/default")]
        public async Task<ActionResult> SetDefaultAddress(int id)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);

            if (user == null)
                return NotFound("User not found");

            var address = await _context.Set<UserAddress>()
                .FirstOrDefaultAsync(a => a.UserAddressId == id && a.UserId == user.Id);

            if (address == null)
                return NotFound("Address not found");

            // Unset all other default addresses for this user
            var allUserAddresses = await _context.Set<UserAddress>()
                .Where(a => a.UserId == user.Id)
                .ToListAsync();

            foreach (var addr in allUserAddresses)
            {
                addr.IsDefault = addr.UserAddressId == id;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Default address updated successfully" });
        }
    }
}

