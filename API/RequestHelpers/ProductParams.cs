namespace API.RequestHelpers
{
    public class ProductParams: PaginationParams
    {
        public string? OrderBy { get; set; }
        public string? SearchTerm { get; set; }
        public string? Categories { get; set; }
        public string? ProductTypes { get; set; }

        public string? ProductSizes { get; set; }
    }
}
