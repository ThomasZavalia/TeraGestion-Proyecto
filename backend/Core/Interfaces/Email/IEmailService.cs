using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Email
{
    public interface IEmailService
    {

        Task<bool> SendEmailAsync(string toEmail, string subject, string body);
    }
}
