using System.Net;
using Xunit;
using RestSharp;
using FluentAssertions;



public class LoginTests
{

    private readonly string _baseUrl = "http://localhost:5000";
    

    [Fact]

    public async Task LoginConCredencialesValidas_DebeRetornarOkYToken()
    {

        // ARRANGE

        var client = new RestClient(_baseUrl);
        var request = new RestRequest("api/Auth/login", Method.Post);
        

        request.AddJsonBody(new
        {
            username = "admin",
            password = "Admin123!"
        });


        // ACT

        var response = await client.ExecuteAsync(request);

        // ASSERT 

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Should().Contain("token");

        
    }


    [Fact]

    public async Task Login_ConPayloadVacio_DebeRetornarBadRequest()
    {

        // ARRANGE

        var client = new RestClient(_baseUrl);
        var request = new RestRequest("api/Auth/login", Method.Post);
        request.AddJsonBody(new{});

        // ACT 

        var response = await client.ExecuteAsync(request);

        // ASSERT
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);





    }

    [Fact]

    public async Task Login_ConContrasenaInvalida_DebeRetornarUnauthorized()
    {
        

        // ARRANGE

        var client = new RestClient(_baseUrl);
        var request = new RestRequest("api/Auth/login", Method.Post);
        request.AddJsonBody(new
        {
            username = "admin",
            password = "contrasenaIncorrecta"
        });

        // ACT
        var response = await client.ExecuteAsync(request);

        // ASSERT
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

    }


}

