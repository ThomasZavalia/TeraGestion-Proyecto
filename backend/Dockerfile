
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src


COPY ["TeraGestion.sln", "./"]
COPY ["Controllers/Controllers.csproj", "Controllers/"]
COPY ["Core/Core.csproj", "Core/"]
COPY ["Infraestructure/Infrastructure.csproj", "Infraestructure/"]
COPY ["Services/Services.csproj", "Services/"]
COPY ["TeraGestion.Tests/TeraGestion.Tests.csproj", "TeraGestion.Tests/"]


RUN dotnet restore


COPY . .


WORKDIR "/src/Controllers"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false


FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .


EXPOSE 8080
ENTRYPOINT ["dotnet", "Controllers.dll"]