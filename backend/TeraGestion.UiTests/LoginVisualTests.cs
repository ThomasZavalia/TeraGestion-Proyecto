using Microsoft.Playwright;
using Xunit;
using TeraGestion.UiTests.Pages;

namespace TeraGestion.UiTests
{
    public class LoginVisualTests
    {
        
        private static readonly bool IsHeadless =
            Environment.GetEnvironmentVariable("HEADLESS")?.ToLower() != "false";

        private readonly string _frontendUrl =
            Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173/login";

        [Fact]
        public async Task Login_ConCredencialesInvalidas_DebePermanecer_EnLoginPage()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(
                new BrowserTypeLaunchOptions { Headless = IsHeadless });
           var context = await browser.NewContextAsync(new BrowserNewContextOptions
{
    
    RecordVideoDir = "TestResults/videos/",
   
    ViewportSize = new ViewportSize { Width = 1280, Height = 720 }
});


await context.Tracing.StartAsync(new TracingStartOptions
{
    Screenshots = true, 
    Snapshots = true,   
    Sources = true      
});
            var page = await context.NewPageAsync();

            try
            {
                var loginPage = new LoginPage(page);

                await loginPage.NavegarA(_frontendUrl);
                await loginPage.IngresarCredenciales("usuario_falso", "clave_falsa");

                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                var formularioVisible = await loginPage.FormularioAunVisible();
                Assert.True(formularioVisible, "Con credenciales inválidas el formulario de login debe seguir visible");
            }
            finally
            {
                await context.Tracing.StopAsync(new TracingStopOptions
                {
                    Path = "TestResults/trace_invalidas.zip" 
                });

                await browser.CloseAsync();
            }
        }



        [Fact]
        public async Task Login_ConCredencialesValidas_DebeRedirigirAlHome()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(
                new BrowserTypeLaunchOptions { Headless = IsHeadless });
           var context = await browser.NewContextAsync(new BrowserNewContextOptions
{
    
    RecordVideoDir = "TestResults/videos/",
   
    ViewportSize = new ViewportSize { Width = 1280, Height = 720 }
});


await context.Tracing.StartAsync(new TracingStartOptions
{
    Screenshots = true, 
    Snapshots = true,   
    Sources = true      
});
            var page = await context.NewPageAsync();

            try
            {
                var loginPage = new LoginPage(page);

                await loginPage.NavegarA(_frontendUrl);
                await loginPage.IngresarCredenciales("admin", "Admin123!");

                var redirigioAlHome = await loginPage.EstaEnPaginaInicio();
                Assert.True(redirigioAlHome, "Con credenciales válidas debe redirigir al home");
            }
            finally
            {
                await context.Tracing.StopAsync(new TracingStopOptions
                {
                    Path = "TestResults/trace_validas.zip" 
                });

                await browser.CloseAsync();
            }
        }

        [Fact]
        public async Task Login_ConCamposVacios_DebePermanecer_EnLoginPage()
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(
                new BrowserTypeLaunchOptions { Headless = IsHeadless });
          var context = await browser.NewContextAsync(new BrowserNewContextOptions
{
    
    RecordVideoDir = "TestResults/videos/",
    
    ViewportSize = new ViewportSize { Width = 1280, Height = 720 }
});


await context.Tracing.StartAsync(new TracingStartOptions
{
    Screenshots = true, 
    Snapshots = true,   
    Sources = true      
});
            var page = await context.NewPageAsync();

            try
            {
                var loginPage = new LoginPage(page);

                await loginPage.NavegarA(_frontendUrl);
                await loginPage.IngresarCredenciales(string.Empty, string.Empty);

                var formularioVisible = await loginPage.FormularioAunVisible();
                Assert.True(formularioVisible, "Con campos vacíos el formulario de login debe seguir visible");
            }
            finally
            {
                await context.Tracing.StopAsync(new TracingStopOptions
                {
                    Path = "TestResults/trace_vacias.zip" 
                });

                await browser.CloseAsync();
            }
        }
    }
}