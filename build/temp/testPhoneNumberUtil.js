"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const phoneNumberUtil_1 = require("../utils/phoneNumberUtil");
try {
    const localNumber = '3178048900';
    const internationalNumber = '+573178048900';
    const otherCountryNumber = '3056196777';
    const otherConuntryNumberInternational = '+13056196777';
    const formatedLocalNumber = (0, phoneNumberUtil_1.formatPhoneNumberForWhatsApp)(localNumber, 'CO');
    const formatedInternationalNumber = (0, phoneNumberUtil_1.formatPhoneNumberForWhatsApp)(internationalNumber, undefined);
    const formatedOtherCountryNumber = (0, phoneNumberUtil_1.formatPhoneNumberForWhatsApp)(otherCountryNumber, 'US');
    const formatedOtherCountryNumberInternational = (0, phoneNumberUtil_1.formatPhoneNumberForWhatsApp)(otherConuntryNumberInternational, undefined);
    console.log({ "numero local": formatedLocalNumber, "numero internacional": formatedInternationalNumber });
    console.log({ "numero local extrangero": formatedOtherCountryNumber, "numero internacional extrangero": formatedOtherCountryNumberInternational });
}
catch (err) {
    console.error(err.message);
}
