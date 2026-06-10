using System.Net;
using Xunit;
using RestSharp;
using FluentAssertions;

namespace TeraGestion.ApiTests
{
   
    public class LoginResponse
    {
        public string Token { get; set; }
        
    }

    public class SeguridadApiTests
    {

        private readonly string _baseUrl = "http://localhost:5000";

        [Fact]

        public async Task FlujoCompleto_LoginYAccesoTurno_DebeFuncionarConToken()
        {
            

            var client = new RestClient(_baseUrl);
            
            var loginRequest = new RestRequest("api/Auth/login",Method.Post);

            loginRequest.AddJsonBody(new
        {
            username = "admin",
            password = "123456"
        });

           

            var loginResponse = await client.ExecuteAsync<LoginResponse>(loginRequest);

            loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            loginResponse.Data.Should().NotBeNull();
            loginResponse.Data.Token.Should().NotBeNullOrWhiteSpace();

            var tokenJwt = loginResponse.Data.Token;


            var turnosRequest = new RestRequest("api/Turno", Method.Get);

            turnosRequest.AddHeader("Authorization",$"Bearer {tokenJwt}");

            var turnosResponse = await client.ExecuteAsync(turnosRequest);

            turnosResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            turnosResponse.Content.Should().NotBeNullOrWhiteSpace();
            turnosResponse.Content.Should().StartWith("[");


        }


    [Fact]

    public async Task AccesoRutaProtegida_SinToken_DebeSerRechazado()
    {

        var client = new RestClient(_baseUrl);

        var turnosRequest = new RestRequest("/api/Turno", Method.Get);

        var turnosResponse = await client.ExecuteAsync(turnosRequest);

        turnosResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);



        
    }


    }







}

