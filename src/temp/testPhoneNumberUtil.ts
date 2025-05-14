import { formatPhoneNumberForWhatsApp } from "../utils/phoneNumberUtil";

try{
    const localNumber = '3178048900'
    const internationalNumber = '+573178048900'

    const otherCountryNumber = '3056196777'
    const otherConuntryNumberInternational = '+13056196777'

    const formatedLocalNumber = formatPhoneNumberForWhatsApp(localNumber, 'CO');
    const formatedInternationalNumber = formatPhoneNumberForWhatsApp(internationalNumber, undefined);

    const formatedOtherCountryNumber = formatPhoneNumberForWhatsApp(otherCountryNumber, 'US');
    const formatedOtherCountryNumberInternational = formatPhoneNumberForWhatsApp(otherConuntryNumberInternational, undefined);

    console.log({"numero local": formatedLocalNumber, "numero internacional": formatedInternationalNumber});
    console.log({"numero local extrangero": formatedOtherCountryNumber, "numero internacional extrangero": formatedOtherCountryNumberInternational});
}catch(err:any){
    console.error(err.message);
}