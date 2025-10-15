using API.Entities;
using Microsoft.AspNetCore.Identity;

namespace API.Data
{
    public static class DbInitializer
    {

        public static async Task Initialize(StoreContext context, UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            Console.WriteLine($"DbInitializer: Starting initialization. Existing users: {userManager.Users.Count()}");

            // Initialize roles first
            if (!roleManager.Roles.Any())
            {
                Console.WriteLine("DbInitializer: Creating roles...");

                var roles = new List<Role>
                {
                    new Role { Name = "Member" },
                    new Role { Name = "Admin" }
                };

                foreach (var role in roles)
                {
                    var result = await roleManager.CreateAsync(role);
                    Console.WriteLine($"DbInitializer: Role '{role.Name}' creation result: {result.Succeeded}");
                    if (!result.Succeeded)
                    {
                        Console.WriteLine($"DbInitializer: Role creation errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }

            if (!userManager.Users.Any())
            {
                Console.WriteLine("DbInitializer: Creating users...");
                
                var user = new User
                {
                    UserName = "milica",
                    Email = "milica@test.com"
                };
                var userResult = await userManager.CreateAsync(user, "Pa$$w0rd");
                Console.WriteLine($"DbInitializer: User creation result: {userResult.Succeeded}");
                if (!userResult.Succeeded)
                {
                    Console.WriteLine($"DbInitializer: User creation errors: {string.Join(", ", userResult.Errors.Select(e => e.Description))}");
                }
                else
                {
                    await userManager.AddToRoleAsync(user, "Member");
                }

                var admin = new User
                {
                    UserName = "admin",
                    Email = "admin@test.com"
                };

                var adminResult = await userManager.CreateAsync(admin, "Pa$$w0rd");
                Console.WriteLine($"DbInitializer: Admin creation result: {adminResult.Succeeded}");
                if (!adminResult.Succeeded)
                {
                    Console.WriteLine($"DbInitializer: Admin creation errors: {string.Join(", ", adminResult.Errors.Select(e => e.Description))}");
                }
                else
                {
                    await userManager.AddToRolesAsync(admin, new[] { "Member", "Admin" });
                }
            }
            else 
            {
                Console.WriteLine($"DbInitializer: Users already exist: {string.Join(", ", userManager.Users.Select(u => u.UserName))}");
            }


            if (!context!.Categories!.Any())
            {

            var categories = new List<Category> {

            new Category {
                CategoryId = 1,
                Name = "Torbe"
            },
            new Category {
                CategoryId = 2,
                Name = "Privesci"
            },
        };

                foreach (var category in categories)
                {
                    context.Categories.Add(category);
                }
            }

            // Add attributes and values
            if (!context.Attributes!.Any())
            {
                var colorAttribute = new Entities.Attribute
                {
                    Name = "Color",
                    Values = new List<AttributeValue>
                    {
                        new AttributeValue { Value = "Bela" },
                        new AttributeValue { Value = "Roze" }
                    }
                };

                var sizeAttribute = new Entities.Attribute
                {
                    Name = "Size",
                    Values = new List<AttributeValue>
                    {
                        new AttributeValue { Value = "S" },
                        new AttributeValue { Value = "M" }
                    }
                };

                context.Attributes.Add(colorAttribute);
                context.Attributes.Add(sizeAttribute);
                context.SaveChanges();
            }

            if (!context!.Products!.Any())
            {
                var products = new List<Product>
            {
                new Product
                {
                    Name = "Torbica 1",
                    Price = 6000,
                    Description = "Rucno radjena torbica od perlica plave boje",
                    PictureUrl = "/images/products/sneakers1.png",
                    CategoryId = 1,
                    QuantityInStock = 1
                    //ProductTypeId = 1,
                    //BrandId = 1,
                },
                new Product
                {
                    Name = "Privezak 1",
                    Price = 1000,
                    Description = "Kornjaca privezak zelene boje",
                    PictureUrl = "/images/products/hoodie1.png",
                    QuantityInStock = 1,
                    CategoryId = 2
                    //ProductTypeId = 2,
                    //BrandId = 2,
                },
                new Product
                {
                    Name = "Torbica 2",
                    Price = 6000,
                    Description = "Torbica od perlica, rucno radjena, bele boje.",
                    PictureUrl = "/images/products/sneakers1.png",
                    CategoryId = 1,
                    //ProductTypeId = 1,
                    //BrandId = 2,
                },
            };

                foreach (var product in products)
                {
                    context!.Products!.Add(product);
                }

                context.SaveChanges();
            }

            // Add variants for products that need them (only if no variants exist)
            if (!context.ProductVariants!.Any())
            {
                var belaValue = context.AttributeValues!.FirstOrDefault(av => av.Value == "Bela");
                var rozeValue = context.AttributeValues!.FirstOrDefault(av => av.Value == "Roze");
                var sizeS = context.AttributeValues!.FirstOrDefault(av => av.Value == "S");
                var sizeM = context.AttributeValues!.FirstOrDefault(av => av.Value == "M");

                if (belaValue != null && rozeValue != null && sizeS != null && sizeM != null)
                {
                    var product = context.Products!.FirstOrDefault(p => p.ProductId == 3); // Majica 1
                    if (product != null)
                    {
                        // Create proper separate variants for each combination
                        product.AddVariant(new List<int> { belaValue.AttributeValueId, sizeS.AttributeValueId }, 5);  // White S
                        product.AddVariant(new List<int> { belaValue.AttributeValueId, sizeM.AttributeValueId }, 5);  // White M
                        product.AddVariant(new List<int> { rozeValue.AttributeValueId, sizeS.AttributeValueId }, 5); // Pink S
                        product.AddVariant(new List<int> { rozeValue.AttributeValueId, sizeM.AttributeValueId }, 5); // Pink M
                        
                        context.SaveChanges();
                    }
                }
            }
        }
    }
}
