export class REGEX {
  public static readonly NUMBER_ONLY = /^-?(0|[1-9]\d*)?$/;
  public static readonly NUMBER_WITHDEC_ONLY =
    /^-?(0|[+-]?([0-9]\d*[.])?[0-9]\d+)?$/;
  public static readonly NUMBER_WITH2DEC_ONLY =
    /^-?(0|[+]?([0-9]\d*[.])?[0-9]{0,2})?$/;
  public static readonly NUMBER_WITH_SPECIAL_CHARACTERS = /^[0-9*#+]+$/;
  public static readonly NUMBER_ONLYWITHZERO = /^-?(0|[0-9]\d*)?$/;
  public static readonly ALPHABETS_ONLY = /^[A-Za-z]+$/;
  public static readonly ALPHABETS_ONLY_WITH_SPACE = /^[A-Za-z ]+$/;
  public static readonly ALPHA_NUMERIC = /^[a-zA-Z0-9]*$/;
  public static readonly ALPHA_NUMERIC_WITH_SPACE = /^[a-zA-Z0-9 ]*$/;
  public static readonly ALPHA_NUMERIC_WITH_NO_BEGINING_SPACE =
    /^[^-\s][a-zA-Z0-9_\s-]+$/;
  public static readonly CAPITAL_ONLY = /^[A-Z]*$/;
  public static readonly SMALL_ONLY = /^[a-z]*$/;
  public static readonly ALPHA_NUMERIC_WITH_SPECIAL_CHARACTERS_WITH_SPACE =
    /^[A-Z0-9 @~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i;
  public static readonly ALPHABETS_WITH_SPECIAL_CHARACTERS_WITH_SPACE =
    /^[A-Za-z @~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i;
  public static readonly THREE_NUMERIC_WITH_TWO_DECIMALS =
    /^(\d{0,3}|\d)(\.\d{1,2})?$/;
  public static readonly THREE_NUMERIC_WITH_THREE_DECIMALS =
    /^(\d{0,3}|\d)(\.\d{1,3})?$/;
  public static readonly TWO_NUMERIC_WITH_TWO_DECIMALS =
    /^(\d{0,2}|\d)(\.\d{1,2})?$/;
  public static readonly SEVEN_NUMERIC_WITH_THREE_DECIMALS =
    /^(\d{0,7}|\d)(\.\d{1,2})?$/;
  public static readonly ELEVEN_NUMERIC_WITH_THREE_DECIMALS =
    /^(\d{0,11}|\d)(\.\d{1,3})?$/;
  public static readonly ELEVEN_NUMERIC_WITH_TWO_DECIMALS =
    /^(\d{0,11}|\d)(\.\d{1,2})?$/;
  public static readonly TEXT_WITH_NO_BEGINING_SPACE = /^[^-\s][a-zA-Z_\s-']+$/;
  public static readonly LATITUDE_LONGITUDE =
    /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/;
  public static readonly ALPHABETS_WITH_NO_BEGINING_SPACE =
    /^[^-\s][a-zA-Z_\s-]+$/;
  public static readonly NUMBERS_ONLY_WITH_COMMA_SEPERATED =
    /^[0-9]+(,[0-9]+)*$/;
  public static readonly NUMBERS_ONLY_TWO_DECIMAL_TWO_DIGIT =
    /^[-+]?([1-9]\d?(\.\d{1,2})?|0\.(\d?[1-9]|[1-9]\d))$/;
  public static readonly urlRegex =
    /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
  public static readonly MULTIPLE_EMAIL_WITH_COMMA_SEPARATED =
    /^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/;
  // public static readonly MULTIPLE_EMAIL_WITH_COMMA_SEPARATED = /^([\w.]+@[\w.]+\.[A-Za-z]{2,},?)+$/
  public static readonly NUMBER_WITH_SPACE = /^[0-9\s]*$/;
  public static readonly EMAIL =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  public static readonly PASSWORD =
    /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  public static readonly PHONE_NUMBER_NOTSTARTWITH_0 = /^[1-9]\d*$/;
  public static readonly PDAEXRATE = /^\d{1,4}(?:\.\d{1,8})?$/;
  public static readonly BASEROE = /^\d{1,5}(?:\.\d{1,18})?$/;

  public static readonly ALL_REGEXP = [
    {
      REG_EXP: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/, 
      ERROR_MSG: 'Only Url are allowed',
    },
    {
      REG_EXP: /^([a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9_+.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/,
      ERROR_MSG: 'Enter Valid Email Id',
    },
    {
      REG_EXP: /^-?(0|[1-9]\d*)?$/,
      ERROR_MSG: 'Only Numbers are allowed(Zero Not Allowed)',
    },
    {
      REG_EXP: /^-?(0|[0-9]\d*)?$/,
      ERROR_MSG: 'Only Numbers are allowed',
    },
    {
      REG_EXP: /^[0-9*#+]+$/,
      ERROR_MSG: 'Only Numbers with Special Characters are allowed',
    },

    {
      REG_EXP: /^[A-Za-z]+$/,
      ERROR_MSG: 'Only Alplabets are allowed',
    },
    {
      REG_EXP: /^[a-zA-Z0-9]*$/,
      // ERROR_MSG: 'Only Alpha Numeric are allowed'
      ERROR_MSG: 'No spaces at the beginning or special characters are allowed',
    },
    {
      REG_EXP: /^[a-zA-Z0-9 ]*$/,
      ERROR_MSG: 'Only Alpha Numeric with space are allowed',
    },
    {
      REG_EXP: /^[A-Z]*$/,
      ERROR_MSG: 'Only CAPITAL letters are allowed',
    },
    {
      REG_EXP: /^[a-z]*$/,
      ERROR_MSG: 'Only small letters are allowed',
    },
    {
      REG_EXP: /^-?([0-9]\d*)?$/,
      ERROR_MSG: 'Only Numbers with no decimals are allowed',
    },
    {
      REG_EXP: /^[A-Za-z ]+$/,
      ERROR_MSG: 'only alphabets with space are allowed',
    },
    {
      REG_EXP: /^[A-Z0-9 @~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i,
      ERROR_MSG: 'Alpha numeric with special characters are allowed',
    },
    {
      REG_EXP: /^[A-Za-z @~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]*$/i,
      ERROR_MSG: 'Alplabets with special characters are allowed',
    },
    {
      REG_EXP: /^(\d{0,3}|\d)(\.\d{1,2})?$/,
      ERROR_MSG: 'Three numricals with two decimals are allowed',
    },
    {
      REG_EXP: /^(\d{0,3}|\d)(\.\d{1,3})?$/,
      ERROR_MSG: 'Three numricals with three decimals are allowed',
    },
    {
      REG_EXP: /^(\d{0,2}|\d)(\.\d{1,2})?$/,
      ERROR_MSG: 'Two numricals with two decimals are allowed',
    },
    {
      REG_EXP: /^-?(0|[+]?([0-9]\d*[.])?[0-9]{0,2})?$/,
      ERROR_MSG: 'Number with two decimals are allowed',
    },
    {
      REG_EXP: /^(\d{0,11}|\d)(\.\d{1,2})?$/,
      ERROR_MSG: 'Number with two decimals are allowed',
    },
    {
      REG_EXP: /^(\d{0,11}|\d)(\.\d{1,3})?$/,
      ERROR_MSG: 'Eleven numricals with three decimals are allowed',
    },
    {
      REG_EXP: /^(\d{0,7}|\d)(\.\d{1,2})?$/,
      ERROR_MSG: 'SEVEN numricals with TWO decimals are allowed',
    },

    {
      REG_EXP: /^[^-\s][a-zA-Z0-9_\s-]+$/,
      ERROR_MSG: 'No spaces at the beginning or special characters are allowed',
    },
    {
      REG_EXP: /^[^-\s][a-zA-Z_\s-']+$/,
      ERROR_MSG: 'Only Alphabets with no space at the beginning',
    },
    {
      REG_EXP: /^-?([0-9]{1,2}|1[0-7][0-9]|180)(\.[0-9]{1,10})?$/,
      ERROR_MSG: 'Geolocation Invalid',
    },
    {
      REG_EXP: /^[^-\s][a-zA-Z_\s-]+$/,
      ERROR_MSG: 'Only Alphabets with no space at the beginning',
    },
    {
      REG_EXP: /^[0-9]+(,[0-9]+)*$/,
      ERROR_MSG: 'Only Numbers with comma seperated',
    },
    {
      REG_EXP: /^[-+]?([1-9]\d?(\.\d{1,2})?|0\.(\d?[1-9]|[1-9]\d))$/,
      ERROR_MSG: 'Only Two Digit with Two Decimal Numbers',
    },
    {
      REG_EXP: /^-?(0|[+-]?([0-9]\d*[.])?[0-9]\d+)?$/,
      ERROR_MSG: 'Only numeric values are allowed',
    },
    {
      REG_EXP: /^([\w]+@[\w.]+\.[A-Za-z]{2,},?)+$/,
      ERROR_MSG: 'Invaild Email is entered',
    },
    {
      REG_EXP: /^[0-9\s]*$/,
      ERROR_MSG: 'Only Number and Space Are Allowed ',
    },
    {
      REG_EXP: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      ERROR_MSG: 'Please Try With Strong Password',
    },
    {
      REG_EXP: /^[1-9]\d*$/,
      ERROR_MSG: 'Invalid Number is entered',
    },
    {
      REG_EXP: /^\d{1,4}(?:\.\d{1,8})?$/,
      ERROR_MSG: 'Please enter valid ROE in format XXXX.XXXXXXXX',
    },
    {
      REG_EXP: /^\d{1,5}(?:\.\d{1,18})?$/,
      ERROR_MSG: 'Please enter valid ROE in format XXXXX.XXXXXXXXXXXXXXXXXX',
    },
  ];
}
