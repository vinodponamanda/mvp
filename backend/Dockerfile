# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for caching restore
COPY ["src/ManaVibePrints.Domain/ManaVibePrints.Domain.csproj", "src/ManaVibePrints.Domain/"]
COPY ["src/ManaVibePrints.Application/ManaVibePrints.Application.csproj", "src/ManaVibePrints.Application/"]
COPY ["src/ManaVibePrints.Infrastructure/ManaVibePrints.Infrastructure.csproj", "src/ManaVibePrints.Infrastructure/"]
COPY ["src/ManaVibePrints.API/ManaVibePrints.API.csproj", "src/ManaVibePrints.API/"]

RUN dotnet restore "src/ManaVibePrints.API/ManaVibePrints.API.csproj"

# Copy remaining source code and publish
COPY . .
WORKDIR "/src/src/ManaVibePrints.API"
RUN dotnet publish "ManaVibePrints.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Production Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ManaVibePrints.API.dll"]
