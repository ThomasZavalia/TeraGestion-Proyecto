using Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization; 
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.Extensions.Configuration; 

namespace Services
{
    public class RecaptchaService : IRecaptchaService
    {
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public RecaptchaService(IConfiguration config)
        {
            _config = config;
            _httpClient = new HttpClient();
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var secret = _config["Recaptcha:SecretKey"];

              

                var response = await _httpClient.PostAsync($"https://www.google.com/recaptcha/api/siteverify?secret={secret}&response={token}", null);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[Recaptcha] Error HTTP: {response.StatusCode}");
                    return false;
                }

                var jsonString = await response.Content.ReadAsStringAsync();

               
                Console.WriteLine($"[Recaptcha] Respuesta de Google: {jsonString}");
                

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = JsonSerializer.Deserialize<RecaptchaResponse>(jsonString, options);

                if (result == null) return false;

                
                if (result.ErrorCodes != null && result.ErrorCodes.Count > 0)
                {
                    Console.WriteLine($"[Recaptcha] Errores devueltos: {string.Join(", ", result.ErrorCodes)}");
                    return false;
                }

             
                var minScoreString = _config["Recaptcha:MinScore"] ?? "0.1";
                if (!double.TryParse(minScoreString, NumberStyles.Any, CultureInfo.InvariantCulture, out double minScore))
                {
                    minScore = 0.1; 
                }

                Console.WriteLine($"[Recaptcha] Score recibido: {result.Score} (Mínimo requerido: {minScore})");

                return result.Success && result.Score >= minScore;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Recaptcha] Excepción: {ex.Message}");
                return false;
            }
        }

      
        public class RecaptchaResponse
        {
            [JsonPropertyName("success")]
            public bool Success { get; set; }

            [JsonPropertyName("score")]
            public double Score { get; set; }

            [JsonPropertyName("action")]
            public string Action { get; set; }

            [JsonPropertyName("challenge_ts")]
            public DateTime ChallengeTs { get; set; }

            [JsonPropertyName("hostname")]
            public string Hostname { get; set; }

            [JsonPropertyName("error-codes")]
            public List<string> ErrorCodes { get; set; }
        }
    }
}