using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Validation
{
   public class ValidTimeFormatAttribute : ValidationAttribute
    {

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var timeString = value as string;

          
            if (string.IsNullOrWhiteSpace(timeString))
            {
                return ValidationResult.Success;
            }

            
            if (TimeSpan.TryParseExact(timeString, @"hh\:mm", CultureInfo.InvariantCulture, out _))
            {
                return ValidationResult.Success;
            }

         
            return new ValidationResult(ErrorMessage ?? "El formato de hora debe ser HH:mm.");
        }
    }
}
