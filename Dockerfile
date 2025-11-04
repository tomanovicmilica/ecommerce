# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY API/API.csproj API/
RUN dotnet restore "API/API.csproj"

# Copy everything else and build
COPY API/ API/
WORKDIR /src/API
RUN dotnet publish "API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published files from build stage
COPY --from=build /app/publish .

# Expose port (Render will set PORT environment variable)
EXPOSE 8080

# Note: ASPNETCORE_URLS is set via environment variable in render.yaml
# to use Render's dynamic PORT value

ENTRYPOINT ["dotnet", "API.dll"]
