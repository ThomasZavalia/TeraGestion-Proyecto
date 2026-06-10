using Microsoft.Playwright;

namespace TeraGestion.UiTests.Pages
{
    public class LoginPage
    {
        private readonly IPage _page;

        private ILocator InputUsuario => _page.Locator("#input-username");
        private ILocator InputPassword => _page.Locator("#input-password");
        private ILocator BotonIngresar => _page.Locator("#btn-login");

        public LoginPage(IPage page)
        {
            _page = page;
        }

        public async Task NavegarA(string url)
        {
            await _page.GotoAsync(url);
            await InputUsuario.WaitForAsync(new LocatorWaitForOptions { State = WaitForSelectorState.Visible });
        }

        public async Task IngresarCredenciales(string usuario, string password)
        {
            await InputUsuario.FillAsync(usuario);
            await InputPassword.FillAsync(password);
            await BotonIngresar.ClickAsync();
        }

        public async Task<bool> EstaEnPaginaInicio()
        {
            await _page.WaitForURLAsync("**/", new PageWaitForURLOptions { Timeout = 8000 });
            return _page.Url.EndsWith("/");
        }

       

        public async Task<bool> FormularioAunVisible()
        {
           
            try
            {
                await InputUsuario.WaitForAsync(new LocatorWaitForOptions
                {
                    State = WaitForSelectorState.Visible,
                    Timeout = 5000
                });
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
