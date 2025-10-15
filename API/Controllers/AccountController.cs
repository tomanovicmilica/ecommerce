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
    }
}

