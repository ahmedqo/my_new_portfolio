const Dust = (() => {
    const $NAME = "Dust";
    const $DATE = {
        _date: function(date, formatStr) {
            formatStr = formatStr || "yyyy-MM-dd";
            var tokens = formatStr.match(/(\w)\1*|''|'(''|[^'])+('|$)|./g);
            if (!tokens) return date;
            date = new Date(date);
            var result = tokens
                .map((substring) => {
                    if (substring === "''") {
                        return "'";
                    }
                    var firstCharacter = substring[0];
                    if (firstCharacter === "'") {
                        return this._clean(substring);
                    }
                    var formatter = this._action(firstCharacter);
                    if (formatter) {
                        return formatter(date, substring);
                    }
                    return substring;
                })
                .join("");
            return result;
        },
        _action: function(format) {
            const self = this;
            var formatters = {
                // Year
                y: function y(date, token) {
                    var signedYear = date.getFullYear();
                    var year = signedYear > 0 ? signedYear : 1 - signedYear;
                    return self._zeros(token === "yy" ? year % 100 : year, token.length);
                },
                // Month
                M: function M(date, token) {
                    var months = [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                    ];
                    var month = date.getMonth();
                    switch (token) {
                        case "MMM":
                            return months[month].slice(0, 3);
                        case "MMMM":
                            return months[month];
                        default:
                            return self._zeros(month + 1, token.length);
                    }
                },
                // Day of the month
                d: function d(date, token) {
                    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    switch (token) {
                        case "ddd":
                            return days[date.getDay()].slice(0, 3);
                        case "dddd":
                            return days[date.getDay()];
                        default:
                            return self._zeros(date.getDate(), token.length);
                    }
                },
                // AM or PM
                a: function a(date, token) {
                    var dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";

                    switch (token) {
                        case "a":
                        case "aa":
                            return dayPeriodEnumValue.toUpperCase();
                        case "aaa":
                            return dayPeriodEnumValue;
                        case "aaaaa":
                            return dayPeriodEnumValue[0];
                        case "aaaa":
                        default:
                            return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
                    }
                },
                // Hour [1-12]
                h: function h(date, token) {
                    return self._zeros(date.getHours() % 12 || 12, token.length);
                },
                // Hour [0-23]
                H: function H(date, token) {
                    return self._zeros(date.getHours(), token.length);
                },
                // Minute
                m: function m(date, token) {
                    return self._zeros(date.getMinutes(), token.length);
                },
                // Second
                s: function s(date, token) {
                    return self._zeros(date.getSeconds(), token.length);
                },
                // Fraction of second
                S: function S(date, token) {
                    var numberOfDigits = token.length;
                    var milliseconds = date.getMilliseconds();
                    var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
                    return self._zeros(fractionalSeconds, token.length);
                },
            };
            return formatters[format];
        },
        _zeros: function(nbr, len) {
            var sign = nbr < 0 ? "-" : "";
            var output = Math.abs(nbr).toString();
            while (output.length < len) {
                output = "0" + output;
            }
            return sign + output;
        },
        _clean: function(input) {
            var matches = input.match(/^'([^]*?)'?$/);
            if (!matches) {
                return input;
            }
            return matches[1].replace(/''/g, "'");
        },
    };
    return class Class {
        static CONT = false;
        static MEMO = [];
        static REFS = {};
        static HELP = {
            capitalize: function(str) {
                return (
                    (typeof str === "string" &&
                        str
                        .split(/[\s]/g)
                        .map(function(w) {
                            return w[0].toUpperCase() + w.slice(1).toLowerCase();
                        })
                        .join(" ")) ||
                    null
                );
            },
            string: function(str) {
                return (typeof str !== "object" && String(str)) || null;
            },
            number: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Number(num)) || null;
            },
            integer: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && parseInt(num)) || null;
            },
            reel: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && parseFloat(num)) || null;
            },
            boolean: function(bol) {
                return bol === true || bol === "true" || bol === false || bol === "false" ? JSON.parse(bol) : null;
            },
            floor: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.floor(Number(num))) || null;
            },
            round: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.round(Number(num))) || null;
            },
            ceil: function(num) {
                return (num && /^[0-9.]+$/g.test(num) && Math.ceil(Number(num))) || null;
            },
            last: function(str) {
                return ((typeof str === "string" || Array.isArray(str)) && str[str.length - 1]) || null;
            },
            trim: function(str) {
                return (typeof str === "string" && str.trim()) || null;
            },
            sort: function(str) {
                return typeof str === "string" ? str.split("").sort().join("") : Array.isArray(str) ? str.sort() : null;
            },
            join: function(arr, glu) {
                return (Array.isArray(arr) && arr.join(glu ? glu : ", ")) || null;
            },
            unique: function(arr) {
                return (Array.isArray(arr) && [...new Set(arr)]) || null;
            },
            sum: function(arr) {
                return (
                    (Array.isArray(arr) &&
                        arr.reduce(function(a, n) {
                            return a + n;
                        })) ||
                    null
                );
            },
            max: function(arr) {
                return (Array.isArray(arr) && Math.max.apply(Math, arr)) || null;
            },
            min: function(arr) {
                return (Array.isArray(arr) && Math.min.apply(Math, arr)) || null;
            },
            isString: function(str) {
                return typeof str === "string";
            },
            isNumber: function(num, rel) {
                return rel ? num % 1 !== 0 : typeof num === "number";
            },
            isBoolean: function(bol) {
                return typeof bol === "boolean";
            },
            upperCase: function(str) {
                return (typeof str === "string" && str.toUpperCase()) || null;
            },
            lowerCase: function(str) {
                return (typeof str === "string" && str.toLowerCase()) || null;
            },
            latinCase: function(str) {
                var _latin = {
                    Á: "A",
                    Ă: "A",
                    Ắ: "A",
                    Ặ: "A",
                    Ằ: "A",
                    Ẳ: "A",
                    Ẵ: "A",
                    Ǎ: "A",
                    Â: "A",
                    Ấ: "A",
                    Ậ: "A",
                    Ầ: "A",
                    Ẩ: "A",
                    Ẫ: "A",
                    Ä: "A",
                    Ǟ: "A",
                    Ȧ: "A",
                    Ǡ: "A",
                    Ạ: "A",
                    Ȁ: "A",
                    À: "A",
                    Ả: "A",
                    Ȃ: "A",
                    Ā: "A",
                    Ą: "A",
                    Å: "A",
                    Ǻ: "A",
                    Ḁ: "A",
                    Ⱥ: "A",
                    Ã: "A",
                    Ꜳ: "AA",
                    Æ: "AE",
                    Ǽ: "AE",
                    Ǣ: "AE",
                    Ꜵ: "AO",
                    Ꜷ: "AU",
                    Ꜹ: "AV",
                    Ꜻ: "AV",
                    Ꜽ: "AY",
                    Ḃ: "B",
                    Ḅ: "B",
                    Ɓ: "B",
                    Ḇ: "B",
                    Ƀ: "B",
                    Ƃ: "B",
                    Ć: "C",
                    Č: "C",
                    Ç: "C",
                    Ḉ: "C",
                    Ĉ: "C",
                    Ċ: "C",
                    Ƈ: "C",
                    Ȼ: "C",
                    Ď: "D",
                    Ḑ: "D",
                    Ḓ: "D",
                    Ḋ: "D",
                    Ḍ: "D",
                    Ɗ: "D",
                    Ḏ: "D",
                    ǲ: "D",
                    ǅ: "D",
                    Đ: "D",
                    Ð: "D",
                    Ƌ: "D",
                    Ǳ: "DZ",
                    Ǆ: "DZ",
                    É: "E",
                    Ĕ: "E",
                    Ě: "E",
                    Ȩ: "E",
                    Ḝ: "E",
                    Ê: "E",
                    Ế: "E",
                    Ệ: "E",
                    Ề: "E",
                    Ể: "E",
                    Ễ: "E",
                    Ḙ: "E",
                    Ë: "E",
                    Ė: "E",
                    Ẹ: "E",
                    Ȅ: "E",
                    È: "E",
                    Ẻ: "E",
                    Ȇ: "E",
                    Ē: "E",
                    Ḗ: "E",
                    Ḕ: "E",
                    Ę: "E",
                    Ɇ: "E",
                    Ẽ: "E",
                    Ḛ: "E",
                    Ꝫ: "ET",
                    Ḟ: "F",
                    Ƒ: "F",
                    Ǵ: "G",
                    Ğ: "G",
                    Ǧ: "G",
                    Ģ: "G",
                    Ĝ: "G",
                    Ġ: "G",
                    Ɠ: "G",
                    Ḡ: "G",
                    Ǥ: "G",
                    Ḫ: "H",
                    Ȟ: "H",
                    Ḩ: "H",
                    Ĥ: "H",
                    Ⱨ: "H",
                    Ḧ: "H",
                    Ḣ: "H",
                    Ḥ: "H",
                    Ħ: "H",
                    Í: "I",
                    Ĭ: "I",
                    Ǐ: "I",
                    Î: "I",
                    Ï: "I",
                    Ḯ: "I",
                    İ: "I",
                    Ị: "I",
                    Ȉ: "I",
                    Ì: "I",
                    Ỉ: "I",
                    Ȋ: "I",
                    Ī: "I",
                    Į: "I",
                    Ɨ: "I",
                    Ĩ: "I",
                    Ḭ: "I",
                    І: "I",
                    Ꝺ: "D",
                    Ꝼ: "F",
                    Ᵹ: "G",
                    Ꞃ: "R",
                    Ꞅ: "S",
                    Ꞇ: "T",
                    Ꝭ: "IS",
                    Ĵ: "J",
                    Ɉ: "J",
                    Ḱ: "K",
                    Ǩ: "K",
                    Ķ: "K",
                    Ⱪ: "K",
                    Ꝃ: "K",
                    Ḳ: "K",
                    Ƙ: "K",
                    Ḵ: "K",
                    Ꝁ: "K",
                    Ꝅ: "K",
                    Ĺ: "L",
                    Ƚ: "L",
                    Ľ: "L",
                    Ļ: "L",
                    Ḽ: "L",
                    Ḷ: "L",
                    Ḹ: "L",
                    Ⱡ: "L",
                    Ꝉ: "L",
                    Ḻ: "L",
                    Ŀ: "L",
                    Ɫ: "L",
                    ǈ: "L",
                    Ł: "L",
                    Ǉ: "LJ",
                    Ḿ: "M",
                    Ṁ: "M",
                    Ṃ: "M",
                    Ɱ: "M",
                    Ń: "N",
                    Ň: "N",
                    Ņ: "N",
                    Ṋ: "N",
                    Ṅ: "N",
                    Ṇ: "N",
                    Ǹ: "N",
                    Ɲ: "N",
                    Ṉ: "N",
                    Ƞ: "N",
                    ǋ: "N",
                    Ñ: "N",
                    Ǌ: "NJ",
                    Ó: "O",
                    Ŏ: "O",
                    Ǒ: "O",
                    Ô: "O",
                    Ố: "O",
                    Ộ: "O",
                    Ồ: "O",
                    Ổ: "O",
                    Ỗ: "O",
                    Ö: "O",
                    Ȫ: "O",
                    Ȯ: "O",
                    Ȱ: "O",
                    Ọ: "O",
                    Ő: "O",
                    Ȍ: "O",
                    Ò: "O",
                    Ỏ: "O",
                    Ơ: "O",
                    Ớ: "O",
                    Ợ: "O",
                    Ờ: "O",
                    Ở: "O",
                    Ỡ: "O",
                    Ȏ: "O",
                    Ꝋ: "O",
                    Ꝍ: "O",
                    Ō: "O",
                    Ṓ: "O",
                    Ṑ: "O",
                    Ɵ: "O",
                    Ǫ: "O",
                    Ǭ: "O",
                    Ø: "O",
                    Ǿ: "O",
                    Õ: "O",
                    Ṍ: "O",
                    Ṏ: "O",
                    Ȭ: "O",
                    Ƣ: "OI",
                    Ꝏ: "OO",
                    Ɛ: "E",
                    Ɔ: "O",
                    Ȣ: "OU",
                    Ṕ: "P",
                    Ṗ: "P",
                    Ꝓ: "P",
                    Ƥ: "P",
                    Ꝕ: "P",
                    Ᵽ: "P",
                    Ꝑ: "P",
                    Ꝙ: "Q",
                    Ꝗ: "Q",
                    Ŕ: "R",
                    Ř: "R",
                    Ŗ: "R",
                    Ṙ: "R",
                    Ṛ: "R",
                    Ṝ: "R",
                    Ȑ: "R",
                    Ȓ: "R",
                    Ṟ: "R",
                    Ɍ: "R",
                    Ɽ: "R",
                    Ꜿ: "C",
                    Ǝ: "E",
                    Ś: "S",
                    Ṥ: "S",
                    Š: "S",
                    Ṧ: "S",
                    Ş: "S",
                    Ŝ: "S",
                    Ș: "S",
                    Ṡ: "S",
                    Ṣ: "S",
                    Ṩ: "S",
                    ß: "ss",
                    Ť: "T",
                    Ţ: "T",
                    Ṱ: "T",
                    Ț: "T",
                    Ⱦ: "T",
                    Ṫ: "T",
                    Ṭ: "T",
                    Ƭ: "T",
                    Ṯ: "T",
                    Ʈ: "T",
                    Ŧ: "T",
                    Ɐ: "A",
                    Ꞁ: "L",
                    Ɯ: "M",
                    Ʌ: "V",
                    Ꜩ: "TZ",
                    Ú: "U",
                    Ŭ: "U",
                    Ǔ: "U",
                    Û: "U",
                    Ṷ: "U",
                    Ü: "U",
                    Ǘ: "U",
                    Ǚ: "U",
                    Ǜ: "U",
                    Ǖ: "U",
                    Ṳ: "U",
                    Ụ: "U",
                    Ű: "U",
                    Ȕ: "U",
                    Ù: "U",
                    Ủ: "U",
                    Ư: "U",
                    Ứ: "U",
                    Ự: "U",
                    Ừ: "U",
                    Ử: "U",
                    Ữ: "U",
                    Ȗ: "U",
                    Ū: "U",
                    Ṻ: "U",
                    Ų: "U",
                    Ů: "U",
                    Ũ: "U",
                    Ṹ: "U",
                    Ṵ: "U",
                    Ꝟ: "V",
                    Ṿ: "V",
                    Ʋ: "V",
                    Ṽ: "V",
                    Ꝡ: "VY",
                    Ẃ: "W",
                    Ŵ: "W",
                    Ẅ: "W",
                    Ẇ: "W",
                    Ẉ: "W",
                    Ẁ: "W",
                    Ⱳ: "W",
                    Ẍ: "X",
                    Ẋ: "X",
                    Ý: "Y",
                    Ŷ: "Y",
                    Ÿ: "Y",
                    Ẏ: "Y",
                    Ỵ: "Y",
                    Ỳ: "Y",
                    Ƴ: "Y",
                    Ỷ: "Y",
                    Ỿ: "Y",
                    Ȳ: "Y",
                    Ɏ: "Y",
                    Ỹ: "Y",
                    Ї: "YI",
                    Ź: "Z",
                    Ž: "Z",
                    Ẑ: "Z",
                    Ⱬ: "Z",
                    Ż: "Z",
                    Ẓ: "Z",
                    Ȥ: "Z",
                    Ẕ: "Z",
                    Ƶ: "Z",
                    Þ: "TH",
                    Ĳ: "IJ",
                    Œ: "OE",
                    ᴀ: "A",
                    ᴁ: "AE",
                    ʙ: "B",
                    ᴃ: "B",
                    ᴄ: "C",
                    ᴅ: "D",
                    ᴇ: "E",
                    ꜰ: "F",
                    ɢ: "G",
                    ʛ: "G",
                    ʜ: "H",
                    ɪ: "I",
                    ʁ: "R",
                    ᴊ: "J",
                    ᴋ: "K",
                    ʟ: "L",
                    ᴌ: "L",
                    ᴍ: "M",
                    ɴ: "N",
                    ᴏ: "O",
                    ɶ: "OE",
                    ᴐ: "O",
                    ᴕ: "OU",
                    ᴘ: "P",
                    ʀ: "R",
                    ᴎ: "N",
                    ᴙ: "R",
                    ꜱ: "S",
                    ᴛ: "T",
                    ⱻ: "E",
                    ᴚ: "R",
                    ᴜ: "U",
                    ᴠ: "V",
                    ᴡ: "W",
                    ʏ: "Y",
                    ᴢ: "Z",
                    á: "a",
                    ă: "a",
                    ắ: "a",
                    ặ: "a",
                    ằ: "a",
                    ẳ: "a",
                    ẵ: "a",
                    ǎ: "a",
                    â: "a",
                    ấ: "a",
                    ậ: "a",
                    ầ: "a",
                    ẩ: "a",
                    ẫ: "a",
                    ä: "a",
                    ǟ: "a",
                    ȧ: "a",
                    ǡ: "a",
                    ạ: "a",
                    ȁ: "a",
                    à: "a",
                    ả: "a",
                    ȃ: "a",
                    ā: "a",
                    ą: "a",
                    ᶏ: "a",
                    ẚ: "a",
                    å: "a",
                    ǻ: "a",
                    ḁ: "a",
                    ⱥ: "a",
                    ã: "a",
                    ꜳ: "aa",
                    æ: "ae",
                    ǽ: "ae",
                    ǣ: "ae",
                    ꜵ: "ao",
                    ꜷ: "au",
                    ꜹ: "av",
                    ꜻ: "av",
                    ꜽ: "ay",
                    ḃ: "b",
                    ḅ: "b",
                    ɓ: "b",
                    ḇ: "b",
                    ᵬ: "b",
                    ᶀ: "b",
                    ƀ: "b",
                    ƃ: "b",
                    ɵ: "o",
                    ć: "c",
                    č: "c",
                    ç: "c",
                    ḉ: "c",
                    ĉ: "c",
                    ɕ: "c",
                    ċ: "c",
                    ƈ: "c",
                    ȼ: "c",
                    ď: "d",
                    ḑ: "d",
                    ḓ: "d",
                    ȡ: "d",
                    ḋ: "d",
                    ḍ: "d",
                    ɗ: "d",
                    ᶑ: "d",
                    ḏ: "d",
                    ᵭ: "d",
                    ᶁ: "d",
                    đ: "d",
                    ɖ: "d",
                    ƌ: "d",
                    ð: "d",
                    ı: "i",
                    ȷ: "j",
                    ɟ: "j",
                    ʄ: "j",
                    ǳ: "dz",
                    ǆ: "dz",
                    é: "e",
                    ĕ: "e",
                    ě: "e",
                    ȩ: "e",
                    ḝ: "e",
                    ê: "e",
                    ế: "e",
                    ệ: "e",
                    ề: "e",
                    ể: "e",
                    ễ: "e",
                    ḙ: "e",
                    ë: "e",
                    ė: "e",
                    ẹ: "e",
                    ȅ: "e",
                    è: "e",
                    ẻ: "e",
                    ȇ: "e",
                    ē: "e",
                    ḗ: "e",
                    ḕ: "e",
                    ⱸ: "e",
                    ę: "e",
                    ᶒ: "e",
                    ɇ: "e",
                    ẽ: "e",
                    ḛ: "e",
                    ꝫ: "et",
                    ḟ: "f",
                    ƒ: "f",
                    ᵮ: "f",
                    ᶂ: "f",
                    ǵ: "g",
                    ğ: "g",
                    ǧ: "g",
                    ģ: "g",
                    ĝ: "g",
                    ġ: "g",
                    ɠ: "g",
                    ḡ: "g",
                    ᶃ: "g",
                    ǥ: "g",
                    ḫ: "h",
                    ȟ: "h",
                    ḩ: "h",
                    ĥ: "h",
                    ⱨ: "h",
                    ḧ: "h",
                    ḣ: "h",
                    ḥ: "h",
                    ɦ: "h",
                    ẖ: "h",
                    ħ: "h",
                    ƕ: "hv",
                    í: "i",
                    ĭ: "i",
                    ǐ: "i",
                    î: "i",
                    ï: "i",
                    ḯ: "i",
                    ị: "i",
                    ȉ: "i",
                    ì: "i",
                    ỉ: "i",
                    ȋ: "i",
                    ī: "i",
                    į: "i",
                    ᶖ: "i",
                    ɨ: "i",
                    ĩ: "i",
                    ḭ: "i",
                    і: "i",
                    ꝺ: "d",
                    ꝼ: "f",
                    ᵹ: "g",
                    ꞃ: "r",
                    ꞅ: "s",
                    ꞇ: "t",
                    ꝭ: "is",
                    ǰ: "j",
                    ĵ: "j",
                    ʝ: "j",
                    ɉ: "j",
                    ḱ: "k",
                    ǩ: "k",
                    ķ: "k",
                    ⱪ: "k",
                    ꝃ: "k",
                    ḳ: "k",
                    ƙ: "k",
                    ḵ: "k",
                    ᶄ: "k",
                    ꝁ: "k",
                    ꝅ: "k",
                    ĺ: "l",
                    ƚ: "l",
                    ɬ: "l",
                    ľ: "l",
                    ļ: "l",
                    ḽ: "l",
                    ȴ: "l",
                    ḷ: "l",
                    ḹ: "l",
                    ⱡ: "l",
                    ꝉ: "l",
                    ḻ: "l",
                    ŀ: "l",
                    ɫ: "l",
                    ᶅ: "l",
                    ɭ: "l",
                    ł: "l",
                    ǉ: "lj",
                    ſ: "s",
                    ẜ: "s",
                    ẛ: "s",
                    ẝ: "s",
                    ḿ: "m",
                    ṁ: "m",
                    ṃ: "m",
                    ɱ: "m",
                    ᵯ: "m",
                    ᶆ: "m",
                    ń: "n",
                    ň: "n",
                    ņ: "n",
                    ṋ: "n",
                    ȵ: "n",
                    ṅ: "n",
                    ṇ: "n",
                    ǹ: "n",
                    ɲ: "n",
                    ṉ: "n",
                    ƞ: "n",
                    ᵰ: "n",
                    ᶇ: "n",
                    ɳ: "n",
                    ñ: "n",
                    ǌ: "nj",
                    ó: "o",
                    ŏ: "o",
                    ǒ: "o",
                    ô: "o",
                    ố: "o",
                    ộ: "o",
                    ồ: "o",
                    ổ: "o",
                    ỗ: "o",
                    ö: "o",
                    ȫ: "o",
                    ȯ: "o",
                    ȱ: "o",
                    ọ: "o",
                    ő: "o",
                    ȍ: "o",
                    ò: "o",
                    ỏ: "o",
                    ơ: "o",
                    ớ: "o",
                    ợ: "o",
                    ờ: "o",
                    ở: "o",
                    ỡ: "o",
                    ȏ: "o",
                    ꝋ: "o",
                    ꝍ: "o",
                    ⱺ: "o",
                    ō: "o",
                    ṓ: "o",
                    ṑ: "o",
                    ǫ: "o",
                    ǭ: "o",
                    ø: "o",
                    ǿ: "o",
                    õ: "o",
                    ṍ: "o",
                    ṏ: "o",
                    ȭ: "o",
                    ƣ: "oi",
                    ꝏ: "oo",
                    ɛ: "e",
                    ᶓ: "e",
                    ɔ: "o",
                    ᶗ: "o",
                    ȣ: "ou",
                    ṕ: "p",
                    ṗ: "p",
                    ꝓ: "p",
                    ƥ: "p",
                    ᵱ: "p",
                    ᶈ: "p",
                    ꝕ: "p",
                    ᵽ: "p",
                    ꝑ: "p",
                    ꝙ: "q",
                    ʠ: "q",
                    ɋ: "q",
                    ꝗ: "q",
                    ŕ: "r",
                    ř: "r",
                    ŗ: "r",
                    ṙ: "r",
                    ṛ: "r",
                    ṝ: "r",
                    ȑ: "r",
                    ɾ: "r",
                    ᵳ: "r",
                    ȓ: "r",
                    ṟ: "r",
                    ɼ: "r",
                    ᵲ: "r",
                    ᶉ: "r",
                    ɍ: "r",
                    ɽ: "r",
                    ↄ: "c",
                    ꜿ: "c",
                    ɘ: "e",
                    ɿ: "r",
                    ś: "s",
                    ṥ: "s",
                    š: "s",
                    ṧ: "s",
                    ş: "s",
                    ŝ: "s",
                    ș: "s",
                    ṡ: "s",
                    ṣ: "s",
                    ṩ: "s",
                    ʂ: "s",
                    ᵴ: "s",
                    ᶊ: "s",
                    ȿ: "s",
                    ɡ: "g",
                    ᴑ: "o",
                    ᴓ: "o",
                    ᴝ: "u",
                    ť: "t",
                    ţ: "t",
                    ṱ: "t",
                    ț: "t",
                    ȶ: "t",
                    ẗ: "t",
                    ⱦ: "t",
                    ṫ: "t",
                    ṭ: "t",
                    ƭ: "t",
                    ṯ: "t",
                    ᵵ: "t",
                    ƫ: "t",
                    ʈ: "t",
                    ŧ: "t",
                    ᵺ: "th",
                    ɐ: "a",
                    ᴂ: "ae",
                    ǝ: "e",
                    ᵷ: "g",
                    ɥ: "h",
                    ʮ: "h",
                    ʯ: "h",
                    ᴉ: "i",
                    ʞ: "k",
                    ꞁ: "l",
                    ɯ: "m",
                    ɰ: "m",
                    ᴔ: "oe",
                    ɹ: "r",
                    ɻ: "r",
                    ɺ: "r",
                    ⱹ: "r",
                    ʇ: "t",
                    ʌ: "v",
                    ʍ: "w",
                    ʎ: "y",
                    ꜩ: "tz",
                    ú: "u",
                    ŭ: "u",
                    ǔ: "u",
                    û: "u",
                    ṷ: "u",
                    ü: "u",
                    ǘ: "u",
                    ǚ: "u",
                    ǜ: "u",
                    ǖ: "u",
                    ṳ: "u",
                    ụ: "u",
                    ű: "u",
                    ȕ: "u",
                    ù: "u",
                    ủ: "u",
                    ư: "u",
                    ứ: "u",
                    ự: "u",
                    ừ: "u",
                    ử: "u",
                    ữ: "u",
                    ȗ: "u",
                    ū: "u",
                    ṻ: "u",
                    ų: "u",
                    ᶙ: "u",
                    ů: "u",
                    ũ: "u",
                    ṹ: "u",
                    ṵ: "u",
                    ᵫ: "ue",
                    ꝸ: "um",
                    ⱴ: "v",
                    ꝟ: "v",
                    ṿ: "v",
                    ʋ: "v",
                    ᶌ: "v",
                    ⱱ: "v",
                    ṽ: "v",
                    ꝡ: "vy",
                    ẃ: "w",
                    ŵ: "w",
                    ẅ: "w",
                    ẇ: "w",
                    ẉ: "w",
                    ẁ: "w",
                    ⱳ: "w",
                    ẘ: "w",
                    ẍ: "x",
                    ẋ: "x",
                    ᶍ: "x",
                    ý: "y",
                    ŷ: "y",
                    ÿ: "y",
                    ẏ: "y",
                    ỵ: "y",
                    ỳ: "y",
                    ƴ: "y",
                    ỷ: "y",
                    ỿ: "y",
                    ȳ: "y",
                    ẙ: "y",
                    ɏ: "y",
                    ỹ: "y",
                    ї: "yi",
                    ź: "z",
                    ž: "z",
                    ẑ: "z",
                    ʑ: "z",
                    ⱬ: "z",
                    ż: "z",
                    ẓ: "z",
                    ȥ: "z",
                    ẕ: "z",
                    ᵶ: "z",
                    ᶎ: "z",
                    ʐ: "z",
                    ƶ: "z",
                    ɀ: "z",
                    þ: "th",
                    ﬀ: "ff",
                    ﬃ: "ffi",
                    ﬄ: "ffl",
                    ﬁ: "fi",
                    ﬂ: "fl",
                    ĳ: "ij",
                    œ: "oe",
                    ﬆ: "st",
                    ₐ: "a",
                    ₑ: "e",
                    ᵢ: "i",
                    ⱼ: "j",
                    ₒ: "o",
                    ᵣ: "r",
                    ᵤ: "u",
                    ᵥ: "v",
                    ₓ: "x",
                    Ё: "YO",
                    Й: "I",
                    Ц: "TS",
                    У: "U",
                    К: "K",
                    Е: "E",
                    Н: "N",
                    Г: "G",
                    Ґ: "G",
                    Ш: "SH",
                    Щ: "SCH",
                    З: "Z",
                    Х: "H",
                    Ъ: "'",
                    ё: "yo",
                    й: "i",
                    ц: "ts",
                    у: "u",
                    к: "k",
                    е: "e",
                    н: "n",
                    г: "g",
                    ґ: "g",
                    ш: "sh",
                    щ: "sch",
                    з: "z",
                    х: "h",
                    ъ: "'",
                    Ф: "F",
                    Ы: "I",
                    В: "V",
                    А: "a",
                    П: "P",
                    Р: "R",
                    О: "O",
                    Л: "L",
                    Д: "D",
                    Ж: "ZH",
                    Э: "E",
                    ф: "f",
                    ы: "i",
                    в: "v",
                    а: "a",
                    п: "p",
                    р: "r",
                    о: "o",
                    л: "l",
                    д: "d",
                    ж: "zh",
                    э: "e",
                    Я: "Ya",
                    Ч: "CH",
                    С: "S",
                    М: "M",
                    И: "I",
                    Т: "T",
                    Ь: "'",
                    Б: "B",
                    Ю: "YU",
                    я: "ya",
                    ч: "ch",
                    с: "s",
                    м: "m",
                    и: "i",
                    т: "t",
                    ь: "'",
                    б: "b",
                    ю: "yu",
                };
                return (
                    (typeof str === "string" &&
                        str.replace(/[^A-Za-z0-9]/g, function(c) {
                            return _latin[c] || c;
                        })) ||
                    null
                );
            },
            startCase: function(str) {
                return (
                    (typeof str === "string" &&
                        str
                        .split(/[-_.\\\/\s]/g)
                        .map(function(w, i) {
                            return w[0].toUpperCase() + w.slice(1).toLowerCase();
                        })
                        .join(" ")) ||
                    null
                );
            },
            camelCase: function(str) {
                return (
                    (typeof str === "string" &&
                        str
                        .split(/[-_.\\\/\s]/g)
                        .map(function(w, i) {
                            return i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase();
                        })
                        .join("")) ||
                    null
                );
            },
            kebabCase: function(str) {
                return (
                    (typeof str === "string" &&
                        str
                        .split(/[-_.\\\/\s]/g)
                        .map(function(w, i) {
                            return w.toLowerCase();
                        })
                        .join("-")) ||
                    null
                );
            },
            snakeCase: function(str) {
                return (
                    (typeof str === "string" &&
                        str
                        .split(/[-_.\\\/\s]/g)
                        .map(function(w, i) {
                            return w.toLowerCase();
                        })
                        .join("_")) ||
                    null
                );
            },
            first: function(str) {
                return ((typeof str === "string" || Array.isArray(str)) && str[0]) || null;
            },
            clean: function(str, tar) {
                return (typeof str === "string" && str.replace(tar, "")) || null;
            },
            slice: function(str, is, ie) {
                return ((typeof str === "string" || Array.isArray(str)) && str.slice(is, ie)) || null;
            },
            shrink: function(str, lim, end) {
                return (typeof str === "string" && str.slice(0, lim) + (end || "...")) || null;
            },
            size: function(str) {
                return ((typeof str === "string" || Array.isArray(str)) && str.length) || null;
            },
            date: function(str, fom) {
                return (typeof str === "string" && $DATE._date(new Date(str), fom)) || null;
            },
            split: function(str, spr, lim) {
                return (typeof str === "string" && str.split(spr, lim ? lim : 9999999999999999999999999)) || null;
            },
            replace: function(str, tar, rep) {
                return (typeof str === "string" && str.replace(tar, rep)) || null;
            },
            decamel: function(str, sep) {
                return (
                    (typeof str === "string" &&
                        str.replace(/[A-Z0-9]/g, function(c, i) {
                            return (i ? sep || " " : "") + c.toLowerCase();
                        })) ||
                    null
                );
            },
            reverse: function(str) {
                return (typeof str === "string" && [...str].reverse().join("")) || (Array.isArray(str) && [...str].reverse()) || null;
            },
            escape: function(str) {
                return (
                    (typeof str === "string" &&
                        str.replace(/[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00FF]/g, function(c) {
                            return "&#" + ("000" + c.charCodeAt(0)).slice(-4) + ";";
                        })) ||
                    null
                );
            },
            padEnd: function(str, len, fil) {
                return (typeof str === "string" && str.padEnd(len, fil ? fil : " ")) || null;
            },
            trimEnd: function(str) {
                return (typeof str === "string" && str.trimEnd()) || null;
            },
            endWith: function(str, ser) {
                return (typeof str === "string" && str.endsWith(ser)) || null;
            },
            upperEnd: function(str) {
                return (typeof str === "string" && str.slice(0, -1) + str.slice(-1).toUpperCase()) || null;
            },
            lowerEnd: function(str) {
                return (typeof str === "string" && str.slice(0, -1) + str.slice(-1).toLowerCase()) || null;
            },
            padStart: function(str, len, fil) {
                return (typeof str === "string" && str.padStart(len, fil ? fil : " ")) || null;
            },
            trimStart: function(str) {
                return (typeof str === "string" && str.trimStart()) || null;
            },
            startWith: function(str, ser) {
                return (typeof str === "string" && str.startsWith(ser)) || null;
            },
            upperStart: function(str) {
                return (typeof str === "string" && str[0].toUpperCase() + str.slice(1)) || null;
            },
            lowerStart: function(str) {
                return (typeof str === "string" && str[0].toLowerCase() + str.slice(1)) || null;
            },
        };

        get refs() {
            return this.__get("REFS");
        }

        constructor(container, style, state) {
            window[$NAME] = Class;
            const self = this;
            Object.defineProperty(container, "src", {
                get() {
                    return this.__src;
                },
                set(value) {
                    this.innerHTML = "";
                    if (!value) return undefined;
                    this.__src = value;
                    (async() => {
                        var code = await fetch(this.__src);
                        self.template = await code.text();
                        self.maker = undefined;
                        self.__run();
                    })();
                },
            });
            Object.defineProperty(this, "src", {
                get() {
                    return this.container.src;
                },
                set(value) {
                    this.container.src = value;
                },
            });
            this.state = state;
            this.style = style;
            this.container = container;
            this.template = this.container.querySelector("template").innerHTML;
            if (this.container.hasAttribute("src")) {
                this.src = this.container.getAttribute("src");
            } else {
                this.style && (this.sass = this.style.textContent);
                this.container.innerHTML = "";
                this.exec();
            }
        }

        __change(object, callback) {
            const handler = {
                get(target, property, receiver) {
                    const desc = Object.getOwnPropertyDescriptor(target, property);

                    if (desc && !desc.writable && !desc.configurable) {
                        return Reflect.get(target, property, receiver);
                    }

                    try {
                        return new Proxy(target[property], handler);
                    } catch (err) {
                        return Reflect.get(target, property, receiver);
                    }
                },

                defineProperty(target, property, descriptor) {
                    callback(property, descriptor.value);
                    return Reflect.defineProperty(target, property, descriptor);
                },

                deleteProperty(target, property) {
                    callback();
                    return Reflect.deleteProperty(target, property);
                },
            };
            return new Proxy(object, handler);
        }

        __run() {
            const html = new(this.__get("Preset"))(this.template, this.state, true);
            if (this.style) {
                const sass = new(this.__get("Preset"))(this.sass, this.state, true);
                this.style.textContent = new(this.__get("Sass"))(sass.exec("html")).exec();
            }
            const tree = html.exec();
            if (tree.children.length) {
                if (!this.props) this.props = new(this.__get("Maker"))(this.container, tree);
                this.props.exec(tree);
                this.constructor.CONT = true;
                this.update();
            }
        }

        exec() {
            Object.keys(this.state).forEach((key) => {
                if (Class.Verify.fn(this.state[key])) this.state[key] = this.state[key].bind(this);
            });

            this.state = this.__change(this.state, () => {
                setTimeout(() => {
                    this.__run();
                }, 0);
            });
            this.__run();
        }

        update() {}

        __get(object) {
            return this.constructor[object];
        }

        static Helper(name, fn) {
            if (["loop", "self", ...Object.keys(Class.HELP)].includes(name)) throw new Error("reserved helper name (" + name + ")");
            this.HELP[name] = fn;
        }

        static start(fn) {
            function repeatOften() {
                if (this.CONT == true) fn();
                else requestAnimationFrame(repeatOften);
            }
            requestAnimationFrame(repeatOften);
        }

        static init(fn) {
            document.addEventListener("DOMContentLoaded", fn);
        }

        static Sass = class {
            constructor(template) {
                this.template = template;
            }

            __parser(str, selector, parent, context) {
                var result = {};
                result.isTree = true;
                result.properties = []; // .hello { font-size: 12px; }
                result._context = parent !== undefined ? parent._context : {}; // Variables
                result._medias = []; // Medias
                result._mixins = parent !== undefined ? parent._mixins : {}; // Variables
                result.parent = parent;
                result.selector = selector;

                result.getString = () => {
                    return this.__stringifier(result);
                };

                var inInlineComment = false;
                var inComment = false;
                var object_open = false;
                var object_bracket_count = 0;
                var curr_block = "";
                var curr_property = "";

                for (var i = 0; i < str.length; i += 1) {
                    var prevCh = str[i - 1] || "";
                    var nextCh = str[i + 1] || "";
                    var ch = str[i];
                    if (inInlineComment && prevCh === "\n") {
                        inInlineComment = false;
                    } else if (!inInlineComment && ch === "/" && nextCh === "/") {
                        inInlineComment = true;
                    }
                    if (!inInlineComment) {
                        if (!inComment && ch === "/" && nextCh === "*") {
                            inComment = true;
                            curr_property = "";
                        } else if (inComment && prevCh === "*" && ch === "/") {
                            inComment = false;
                            result.properties.push(new(this.__get("Comment"))(curr_property));
                            curr_property = "";
                        } else if (inComment) {
                            curr_property += ch;
                        } else if (ch === ";" && !object_open) {
                            if (this.__get("Include").is(curr_property)) {
                                var propertyName = this.__get("Include").get(curr_property);
                                if (result._mixins[propertyName] !== undefined) {
                                    var mixin = result._mixins[propertyName];
                                    result.properties.push(this.__parser(mixin, " ", result));
                                }
                            } else if (this.__get("Variable").is(curr_property)) {
                                var variable = new(this.__get("Variable"))(curr_property);
                                if (variable.isGlobal()) {
                                    this.__get("Global").add(variable, result);
                                } else {
                                    result._context[variable.key] = variable;
                                }
                            } else {
                                result.properties.push(new(this.__get("Property"))(curr_property));
                            }
                            curr_property = "";
                        } else if (ch === "{") {
                            object_bracket_count += 1;
                            object_open = true;
                            if (object_bracket_count === 0) {
                                curr_block = "";
                            } else if (object_bracket_count !== 1) {
                                curr_block += ch;
                            }
                        } else if (ch === "}") {
                            object_bracket_count -= 1;
                            if (object_bracket_count === 0) {
                                if (curr_block.trim() !== "") {
                                    var property_name = curr_property.trim();
                                    if (this.__get("Mixin").is(property_name)) {
                                        this.__get("Mixin").add(property_name, curr_block, result);
                                    } else if (this.__get("Media").is(property_name)) {
                                        this.__get("Media").add(property_name, curr_block, result);
                                    } else {
                                        result.properties.push(this.__parser(curr_block, property_name, result));
                                    }
                                }
                                curr_block = "";
                                curr_property = "";
                                object_open = false;
                            } else {
                                curr_block += ch;
                            }
                        } else {
                            if (object_open) {
                                curr_block += ch;
                            } else {
                                curr_property += ch;
                            }
                        }
                    }
                }
                return result;
            }

            __stringifier(scssTree) {
                var str = "";
                if (scssTree.properties.length > 0) {
                    if (scssTree.selector !== null && scssTree.selector !== undefined && scssTree.selector !== "") {
                        var data = this.__get("Global").loop(false)(scssTree);
                        if (data.length) {
                            var sel = this.__selector(scssTree).replaceAll("@host", "");
                            str += sel + "{";
                            str += data;
                            str += "}";
                        }
                    }
                }
                str += this.__get("Global").loop(true)(scssTree);
                if (scssTree._medias.length > 0) {
                    for (const m of scssTree._medias) {
                        str += "@media(" + m.condition + "){" + this.__parser(m.block, undefined, scssTree).getString() + "}";
                    }
                }
                return str;
            }

            __selector(scssTree) {
                var _selector = "";
                if (scssTree.selector !== null && scssTree.selector !== undefined) {
                    if (scssTree.parent.selector !== null && scssTree.parent.selector !== undefined) {
                        if (scssTree.selector.includes("&")) {
                            _selector = scssTree.selector
                                .split("&")
                                .map((e) => {
                                    if (e.length) {
                                        return this.__selector(scssTree.parent) + e;
                                    }
                                })
                                .filter((e) => e !== undefined)
                                .join("");
                        } else {
                            _selector = scssTree.selector
                                .split(",")
                                .map((e) => this.__selector(scssTree.parent) + " " + e)
                                .join(",");
                        }
                    } else {
                        _selector = scssTree.selector;
                    }
                }
                return _selector.trim();
            }

            exec() {
                const code = this.template.replaceAll(/@media.([a-zA-Z]+)/g, (_, s) => {
                    return this.__get("Const").MEDIA_ARRAY[s];
                });
                return this.__parser("* {box-sizing:border-box;}" + code).getString();
            }

            from(object) {
                var all = "";
                var _loop = (name) => {
                    var vals = object[name],
                        t = "",
                        s = "";
                    if (typeof vals === "string") {
                        all += Class.__kebab(name) + ":" + vals + ";";
                    } else {
                        var _loop2 = (sub) => {
                            var subVals = vals[sub],
                                NAME = Class.__kebab(sub);
                            if ((typeof subVals === "undefined" ? "undefined" : typeof subVals) !== "object") {
                                t += NAME + ":" + (typeof subVals == "number" ? subVals + "px" : subVals) + ";";
                            } else {
                                NAME.split(",").forEach(function($NAME) {
                                    var N = $NAME.trim().startsWith("&") ? $NAME.trim().slice(1) : " " + $NAME,
                                        Sn = name + N,
                                        o = {};
                                    o[Sn] = subVals;
                                    s += this.from(o);
                                });
                            }
                        };
                        for (var sub in vals) {
                            _loop2(sub);
                        }
                        if (t.length > 0) all += name + "{" + t + "}";
                        if (s.length > 0) all += s;
                    }
                };
                for (var name in object) {
                    _loop(name);
                }
                return all;
            }

            custom(object) {
                var Classes = {},
                    Styles = {};
                Object.keys(object).forEach((key) => {
                    Classes[key] = Class.__uid(10);
                    Styles["." + Classes[key]] = object[key];
                });
                return {
                    Classes: Classes,
                    toString: () => this.from(Styles),
                };
            }

            __get(object) {
                return this.constructor[object];
            }

            static Variable = class {
                constructor(str) {
                    this.isCssProperty = true;
                    this.isTree = false;
                    this._property = this.parse(str);
                    this.key = this._property.key;
                    this.value = this._property.value;
                    this.global = this.checkIfGlobal();
                }

                parse(str) {
                    var _property = str.split(":");
                    var key = _property[0].trim().slice(1); // Remove $ Sign
                    var value = _property.slice(1).join(":").trim();
                    return {
                        key: key,
                        value: value,
                    };
                }

                checkIfGlobal() {
                    if (this.value.substring(this.value.length - 7) === "!global") {
                        this.value = this.value.substring(0, this.value.length - 7).trim();
                        return true;
                    }
                    return false;
                }

                getValue() {
                    return this.value;
                }

                isGlobal() {
                    return this.global;
                }

                static is(str) {
                    return str.trim()[0] === "$";
                }
            };

            static Property = class {
                constructor(str) {
                    this.isCssProperty = true;
                    this.isTree = false;
                    this._property = this.parse(str);
                    this.key = this._property.key;
                    this.value = this._property.value;
                }

                parse(str) {
                    var _property = str.split(":");
                    var key = _property[0].trim();
                    var value = _property[1].trim();
                    return {
                        key: key,
                        value: value,
                    };
                }

                getString(indentationLevel, scssTree) {
                    const val = this.getValue(this.value, scssTree);
                    if (val.length && val !== "null" && val !== "undefined") return this.key + ":" + val + ";";
                    return "";
                }

                getValue(val, scssTree) {
                    if (Class.Sass.Variable.is(val)) {
                        var varName = Class.Sass.Global.getName(val);
                        return Class.Sass.Global.getValue(varName, scssTree);
                    }
                    return val;
                }
            };

            static Comment = class {
                constructor(str) {
                    this.isComment = true;
                    this.isTree = false;
                    var foundEndingStar = false;
                    if (str[0] === "*") {
                        str = str.substring(1, str.length);
                    }
                    if (!foundEndingStar && str[str.length - 1] === "*") {
                        foundEndingStar = true;
                        str = str.substring(0, str.length - 1);
                    }
                    this.str = str;
                }

                getString() {
                    return "/*" + this.str + "*/";
                }
            };

            static Mixin = class {
                static is(str) {
                    return str.trim().slice(0, 6) === "@mixin";
                }

                static add(propertyName, block, tree) {
                    var parsedPropertyName = this.__get(propertyName);
                    tree._mixins[parsedPropertyName] = block;
                    return true;
                }

                static get(str) {
                    return str
                        .replace("@mixin", "")
                        .replace(/\({1}[^/)]*\){1}/g, "")
                        .trim();
                }
            };

            static Media = class {
                static is(str) {
                    return str.trim().slice(0, 6) === "@media";
                }

                static add(propertyName, block, tree) {
                    var parsedPropertyName = this.get(propertyName).replace(/\s/g, "");
                    tree._medias.push({
                        condition: parsedPropertyName,
                        block: block,
                    });
                    return true;
                }

                static get(str) {
                    return str.replace("@media", "").trim().slice(1, -1).trim();
                }
            };

            static Include = class {
                static is(str) {
                    return str.trim().slice(0, 8) === "@include";
                }

                static get(str) {
                    return str
                        .replace("@include", "")
                        .replace(/\({1}[^/)]*\){1}/g, "")
                        .trim();
                }
            };

            static Global = class {
                static frames = {};

                static add(scssVar, tree) {
                    if (tree.parent === null || tree.parent === undefined) {
                        tree._context[scssVar.key] = scssVar;
                        return true;
                    }
                    return this.add(scssVar, tree.parent);
                }

                static getName(str) {
                    var varName = str.trim();
                    if (Class.Sass.Variable.is(varName)) return varName.slice(1);
                    return varName;
                }

                static getValue(varName, tree) {
                    if (tree._context[varName] !== undefined) {
                        return tree._context[varName].getValue();
                    }
                    if (tree.parent !== null && tree.parent !== undefined) {
                        return this.getValue(varName, tree.parent);
                    }
                    throw new Error("Variable $" + varName + " not defined");
                }

                static loop(isTree) {
                    return (scssTree) => {
                        var str = "";
                        for (var ii = 0; ii < scssTree.properties.length; ii += 1) {
                            var _t = scssTree.properties[ii];
                            if (_t.isTree === isTree) {
                                str += _t.getString(0, scssTree).replace(/\$([a-zA-Z0-9_\-.]+)/g, (_, s) => {
                                    return this.getValue(s, scssTree);
                                });;
                            }
                        }
                        return str;
                    };
                }
            };

            static Const = class {
                static MEDIA_ARRAY = {
                    sm: "@media(min-width:640px)",
                    md: "@media(min-width:768px)",
                    lg: "@media(min-width:1024px)",
                    xl: "@media(min-width:1280px)",
                };
            };
        };

        static Preset = class {
            constructor(str, data = {}, fetch = false) {
                this.template = str;
                this.data = data;
                this.fetch = fetch;
                if (fetch)
                    (async() => {
                        this.template = await this.__include(str);
                    })();
            }

            __clean(str) {
                str = str.replace(/&lt;/g, "<");
                str = str.replace(/&gt;/g, ">");
                str = str.replace(/&quot;/g, '"');
                str = str.replace(/&#39;/g, "'");
                str = str.replace(/&amp;/g, "&");
                str = str.replace(/\n/g, "");
                str = str.replace(/\s\s+/g, "");
                return str.trim();
            }

            __shape(arr) {
                return arr
                    .map((str) => {
                        str = this.__place(str);
                        if (str.startsWith("<js:code>")) return str.slice(9);
                        if (str[0] !== "#") return "$TXT+='{(@>_<@)}';$JSX.push(" + str + ");";
                        const args = str
                            .slice(1)
                            .split(" ")
                            .map((e) => e.trim().length && e.trim());
                        const act = args.shift();
                        switch (act) {
                            case "if":
                                return "if(" + args.join(" ") + "){";
                            case "elif":
                                return "} else if(" + args.join(" ") + "){";
                            case "switch":
                                return "switch(" + args.join(" ") + "){";
                            case "case":
                                return "break;case " + args.join(" ") + ":";
                            case "default":
                                return "break;default:";
                            case "range":
                                return "$RANGE(" + args.join(" ") + ",function($LOOP){";
                            case "each":
                                return "$EACH(" + args[0] + ",function(" + args[2] + ", $LOOP){";
                            case "log":
                            case "info":
                            case "warn":
                            case "error":
                            case "debug":
                                return "console." + act + "(" + args.join(" ") + ");";
                            case "else":
                                return "}else{";
                            case "/each":
                            case "/range":
                                return "});";
                            case "js":
                            case "/js":
                                return "";
                            case "/switch":
                                return "break;}";
                            case "/if":
                                return "}";
                        }
                    })
                    .filter((str) => str.length > 0);
            }

            __place(str) {
                str = str.replaceAll("@loop", "$LOOP");
                str = str.replaceAll("@self", "$SELF");
                str = str.replaceAll("@refs", $NAME + ".REFS");
                str = str.replaceAll(/\@(.*)\((.*)\)/g, (_, s, v) => $NAME + ".HELP[\"" + s + "\"](" + v + ")");
                str = str.replaceAll(/[.]+\w+/g, (e) => "['" + e.slice(1) + "']");
                return str;
            }

            __parse(str) {
                const data = {
                    txt: [],
                    jsx: [],
                };
                var state = this.__get("Const").OPEN_TAG;
                str = this.__clean(str).replaceAll(this.__get("Const").COMMENT_REG, "");
                while (str.length) {
                    switch (state) {
                        case this.__get("Const").OPEN_TAG:
                            var index = str.indexOf(this.__get("Const").OPEN_TAG);
                            if (index > -1) {
                                var code = str.slice(0, index);
                                if (["#js"].includes(data.jsx[data.jsx.length - 1])) data.jsx.push("<js:code>" + code);
                                else data.txt.push(code);
                                str = str.slice(index + state.length);
                                state = this.__get("Const").CLSE_TAG;
                            } else {
                                str.length && data.txt.push(str);
                                str = "";
                            }
                        case this.__get("Const").CLSE_TAG:
                            var index = str.indexOf(this.__get("Const").CLSE_TAG);
                            if (index > -1) {
                                if (str[index + 2] === this.__get("Const").CLSE_TAG[0]) index = index + 1;
                                var code = str.slice(0, index).trim();
                                data.jsx.push(code);
                                str = str.slice(index + state.length);
                                state = this.__get("Const").OPEN_TAG;
                            } else {
                                str.length && data.jsx.push(str);
                                str = "";
                            }
                    }
                }
                return data;
            }

            __token(str) {
                var code = "";
                const data = this.__parse(str);
                data.jsx = this.__shape(data.jsx);
                data.txt.forEach((e, i) => {
                    code += "$TXT+=`" + e + "`;";
                    code += data.jsx[i];
                });
                return code;
            }

            exec(type) {
                const str = this.__token(this.template);
                const res = new Function(
                    "",
                    "return function($SELF) { for(const fn in " +
                    $NAME +
                    ".HELP){" +
                    $NAME +
                    ".HELP[fn]=" +
                    $NAME +
                    ".HELP[fn].bind($SELF)};" +
                    "var $TXT = '', $JSX = [], $EACH = (obj, func) => {if (obj == null) {return obj;}var index = -1;if (Array.isArray(obj)) {const length = obj.length;var count = 1;while (++index < length) {if (func(obj[index], {key: index,round: count,index: count - 1,}) === false) {break;}count++;}}var key = Object.keys(obj);const length = key.length;var count = 1;while (++index < length) {if (func(obj[key[index]], {key: key[index],round: count,index: count - 1,}) === false) {break;}count++;}}, $RANGE = (times, func) => {for (var i = 0; i < times; i++) {func({round: i + 1,index: i,});}};" +
                    " with($SELF || {}) { try {" +
                    str +
                    " } catch(e) { console.error(e); }}return [$TXT.split('{(@>_<@)}'), ...$JSX];}"
                )()(this.data);
                if (type === "html") {
                    const parts = res.shift();
                    return parts.reduce((acc, part, i) => {
                        return acc + part + (res[i] || "");
                    }, "");
                }
                return new Class.Jsx(...res).exec();;
            }

            ts() {
                const str = this.__token(this.template);
                const res = new Function(
                    "",
                    "return function($SELF) { for(const fn in " +
                    $NAME +
                    ".HELP){" +
                    $NAME +
                    ".HELP[fn]=" +
                    $NAME +
                    ".HELP[fn].bind($SELF)};" +
                    "var $TXT = '', $JSX = [], $EACH = (obj, func) => {if (obj == null) {return obj;}var index = -1;if (Array.isArray(obj)) {const length = obj.length;var count = 1;while (++index < length) {if (func(obj[index], {key: index,round: count,index: count - 1,}) === false) {break;}count++;}}var key = Object.keys(obj);const length = key.length;var count = 1;while (++index < length) {if (func(obj[key[index]], {key: key[index],round: count,index: count - 1,}) === false) {break;}count++;}}, $RANGE = (times, func) => {for (var i = 0; i < times; i++) {func({round: i + 1,index: i,});}};" +
                    " with($SELF || {}) { try {" +
                    str +
                    " } catch(e) { console.error(e); }}return [$TXT.split('{(@>_<@)}'), ...$JSX];}"
                )()(this.data);
                return res;
            }

            __get(object) {
                return this.constructor[object];
            }

            async __fetch(path) {
                path = path.startsWith("/") ? path.slice(1) : path;
                path = "/views/" + path.replaceAll(".", "/") + ".axe.html";
                if (!Class.MEMO[path]) {
                    const r = await fetch(path);
                    Class.MEMO[path] = r.status === 200 ? await r.text() : "";
                }
                return Class.MEMO[path];
            }

            async __include(code) {
                var found,
                    cursor,
                    _code = code,
                    matchs = [];
                while ((found = this.__get("Const").INCLUDE_REG.exec(_code))) {
                    matchs.push({
                        hold: found[0],
                        path: found[1],
                    });
                    cursor = found.index + found[0].length;
                    _code = _code.slice(cursor);
                }
                for (var match of matchs) {
                    var _code = await this.__fetch(match.path);
                    code = code.replace(match.hold, this.__clean(_code));
                    code = await this.__include(code);
                }
                return code;
            }

            static Const = class {
                static INCLUDE_REG = /{{\s*@include\s+['|"|`](.*?)['|"|`]\s*}}/g;
                static COMMENT_REG = /{{!--(.*?)--}}/g;
                static HTMLVAR_REG = /@html\((.+)\)/g;
                static OPEN_TAG = "{{";
                static CLSE_TAG = "}}";
            };
        };

        static Jsx = class {
            constructor(parts, ...args) {
                this.parts = parts;
                this.args = args;
            }

            __parse(el, stack, opt) {
                const children = [];
                const props = {};
                if (el.attributes) {
                    for (var i = 0; i < el.attributes.length; i++) {
                        var attr = el.attributes[i];
                        if (attr.value === "__code__joiner__") {
                            props[attr.name] = (typeof opt.args[opt.current] == "string") ? opt.args[opt.current].trim() : opt.args[opt.current];
                            opt.current++;
                        } else {
                            props[attr.name] = attr.value.replace(/__code__joiner__/g, (_, s) => {
                                const r = opt.args[opt.current];
                                opt.current++;
                                return r;
                            }).trim();
                        }
                    }
                } else {
                    props["nodeValue"] = el.textContent.replace(/__code__joiner__/g, (_, s) => {
                        const r = opt.args[opt.current];
                        opt.current++;
                        return r;
                    });
                }
                [...el.childNodes].forEach(_ => {
                    this.__parse(_, children, opt);
                });
                stack.push(new(this.__get("TreeNode"))({
                    tag: el.tagName,
                    props: props,
                    children: children,
                }));
            }

            exec() {
                const stack = [],
                    code = this.parts.join("__code__joiner__"),
                    dom = new DOMParser().parseFromString(code, 'text/html');

                this.__parse(dom.body, stack, {
                    args: this.args,
                    current: 0,
                });

                return (stack[0].tag = "template") && stack[0];
            }

            __get(object) {
                return this.constructor[object];
            }

            static TreeNode = class {
                constructor(opt) {
                    this.tag = opt.tag && opt.tag.toLowerCase() || "text";
                    this.props = opt.props;
                    this.children = opt.children;
                }

                isText() {
                    return this.tag === "text";
                }

                isSvg() {
                    return this.tag in Dust.Maker.Const.SVG_TAGS;
                }
            }
        };

        static Maker = class {
            constructor(container, tree) {
                this.container = container;
                this.instance = undefined;
                this.tree = tree;
            }

            __instance(fiber) {
                const dom =
                    fiber.tag === this.__get("Const").TEXT_ELEMENT ?
                    document.createTextNode("") :
                    fiber.tag in this.__get("Const").SVG_TAGS ?
                    document.createElementNS("http://www.w3.org/2000/svg", fiber.tag) :
                    document.createElement(fiber.tag);
                dom.pocket = {};
                this.__props(dom, {}, fiber.props);
                const children = [];
                for (const child of fiber.children) {
                    children.push(this.__instance(child));
                }
                for (const child of children) {
                    dom.appendChild(child.dom);
                }
                return new(this.__get("Instance"))({
                    dom,
                    fiber,
                    children,
                });
            }

            __children(instance, fiber) {
                const newChildInstances = [];
                const count = Math.max(instance.children.length, fiber.children.length);
                for (let i = 0; i < count; i++) {
                    if (instance.children[i] || fiber.children[i]) {
                        newChildInstances.push(this.__run(instance.dom, instance.children[i], fiber.children[i]));
                    }
                }
                return newChildInstances;
            }

            __props(dom, _old, _new) {
                for (let prop in _old) {
                    if (!(prop in _new)) {
                        dom.removeAttribute(prop);
                    }
                }
                for (let prop in _new) {
                    if (prop === "style") {
                        if (Class.Verify.obj(_new[prop])) this.__style(dom, _new[prop]);
                        else dom.style = _new[prop];
                        continue;
                    }
                    const _ = dom && dom.tagName && dom.tagName.toLowerCase();
                    const is_s = _ in this.__get("Const").SVG_TAGS;
                    const is_o = prop.split(".").length > 1;
                    const is_r = prop === "ref";
                    const is_p = prop in dom;
                    const is_e = prop.startsWith("@");
                    if (is_e) {
                        this.__event(dom, prop, _new[prop]);
                        continue;
                    }
                    if (is_p && !is_s) {
                        dom[prop] = _new[prop];
                        continue;
                    }
                    if (is_o) {
                        eval(`dom.${prop} = _new[prop]`);
                        continue;
                    }
                    if (is_r) {
                        if (Class.REFS[_new[prop]])
                            Array.isArray(Class.REFS[_new[prop]]) ?
                            Class.REFS[_new[prop]].push(dom) :
                            (Class.REFS[_new[prop]] = [Class.REFS[_new[prop]], dom]);
                        else Class.REFS[_new[prop]] = dom;
                        continue;
                    }
                    dom.setAttribute(prop, _new[prop]);
                }
            }

            __event(root, name, callback) {
                const ev = name.split(":");
                const eventName = ev[0].slice(1);
                root.__handlers__ = root.__handlers__ || {};
                var isSameFunction = false;
                if (root.__handlers__[eventName]) {
                    for (const _ev of root.__handlers__[eventName]) {
                        if (_ev.toString() === callback.toString()) {
                            isSameFunction = true;
                            return;
                        }
                    }
                }
                if (!isSameFunction) {
                    root.__handlers__[eventName] = [callback];
                    root.addEventListener(eventName, (e) => {
                        this.__break(ev, e);
                        callback(e);
                    });
                }
            }

            __style(dom, val) {
                for (var key in val) {
                    const prop = Class.__kebab(key);
                    var cur = val[key];
                    if (Class.Verify.present(cur)) {
                        Class.Verify.nbr(cur) && !(prop in this.__get("Const").STYLE_PROPS) && (cur += "px");
                        dom.style[prop] = cur;
                    }
                }
            }

            __break(ev, e) {
                ev.forEach(function(_e) {
                    switch (_e) {
                        case "prevent":
                            e.preventDefault();
                        case "propagation":
                            e.stopPropagation();
                        case "immediate":
                            e.stopImmediatePropagation();
                    }
                });
            }

            __run(dom, instance, fiber) {
                if (instance === undefined) {
                    const instance = this.__instance(fiber);
                    dom.appendChild(instance.dom);
                    return instance;
                } else {
                    if (fiber === undefined) {
                        instance.dom.remove();
                        return undefined;
                    } else if (instance.fiber.tag !== fiber.tag) {
                        const newInstance = this.__instance(fiber);
                        if (dom.tagName === "TEMPLATE") dom = this.container;
                        dom.replaceChild(newInstance.dom, instance.dom);
                        return newInstance;
                    } else if (instance.fiber.tag === fiber.tag) {
                        this.__props(instance.dom, instance.fiber.props, fiber.props);
                        instance.children = this.__children(instance, fiber);
                        return instance;
                    }
                }
            }

            exec(tree) {
                tree && (this.tree = tree);
                Class.REFS = {};
                this.instance = this.__run(this.container, this.instance, this.tree);
                const first = this.container.children[0];
                if (first.tagName === "TEMPLATE") {
                    [...first.children].forEach((child) => {
                        this.container.appendChild(child);
                    });
                    first.remove();
                }
            }

            __get(object) {
                return this.constructor[object];
            }

            static Const = class {
                static TEXT_ELEMENT = "text"; //Symbol.for("TEXT_ELEMENT");

                static SVG_TAGS = {
                    svg: true,
                    animate: true,
                    animateMotion: true,
                    animateTransform: true,
                    circle: true,
                    clipPath: true,
                    defs: true,
                    desc: true,
                    discard: true,
                    ellipse: true,
                    feBlend: true,
                    feColorMatrix: true,
                    feComponentTransfer: true,
                    feComposite: true,
                    feConvolveMatrix: true,
                    feDiffuseLighting: true,
                    feDisplacementMap: true,
                    feDistantLight: true,
                    feDropShadow: true,
                    feFlood: true,
                    feFuncA: true,
                    feFuncB: true,
                    feFuncG: true,
                    feFuncR: true,
                    feGaussianBlur: true,
                    feImage: true,
                    feMerge: true,
                    feMergeNode: true,
                    feMorphology: true,
                    feOffset: true,
                    fePointLight: true,
                    feSpecularLighting: true,
                    feSpotLight: true,
                    feTile: true,
                    feTurbulence: true,
                    filter: true,
                    foreignObject: true,
                    g: true,
                    hatch: true,
                    hatchpath: true,
                    image: true,
                    line: true,
                    linearGradient: true,
                    marker: true,
                    mask: true,
                    metadata: true,
                    mpath: true,
                    path: true,
                    pattern: true,
                    polygon: true,
                    polyline: true,
                    radialGradient: true,
                    rect: true,
                    script: true,
                    set: true,
                    stop: true,
                    style: true,
                    switch: true,
                    symbol: true,
                    text: true,
                    textPath: true,
                    title: true,
                    tspan: true,
                    use: true,
                    view: true,
                    animateColor: true,
                    "missing-glyph": true,
                    font: true,
                    "font-face": true,
                    "font-face-format": true,
                    "font-face-name": true,
                    "font-face-src": true,
                    "font-face-uri": true,
                    hkern: true,
                    vkern: true,
                    solidcolor: true,
                    altGlyph: true,
                    altGlyphDef: true,
                    altGlyphItem: true,
                    glyph: true,
                    glyphRef: true,
                    tref: true,
                    cursor: true,
                };

                static STYLE_PROPS = {
                    "animation-iteration-count": true,
                    "border-image-slice": true,
                    "border-image-width": true,
                    "column-count": true,
                    "counter-increment": true,
                    "counter-reset": true,
                    flex: true,
                    "flex-grow": true,
                    "flex-shrink": true,
                    "font-size-adjust": true,
                    "font-weight": true,
                    "line-height": true,
                    "nav-index": true,
                    opacity: true,
                    order: true,
                    orphans: true,
                    "tab-size": true,
                    widows: true,
                    "z-index": true,
                    "pitch-range": true,
                    richness: true,
                    "speech-rate": true,
                    stress: true,
                    volume: true,
                    "lood-opacity": true,
                    "mask-box-outset": true,
                    "mask-border-outset": true,
                    "mask-box-width": true,
                    "mask-border-width": true,
                    "shape-image-threshold": true,
                };
            };

            static Instance = class {
                constructor(opt) {
                    this.dom = opt.dom;
                    this.fiber = opt.fiber;
                    this.children = opt.children;
                }
            }
        };

        static Verify = class {
            static type = (element) => {
                return Object.prototype.toString.call(element).slice(8, -1).toLowerCase();
            };

            static null = (element) => {
                return this.type(element) === "null";
            };

            static undefined = (element) => {
                return this.type(element) === "undefined";
            };

            static str = (element) => {
                return this.type(element) === "string";
            };

            static nbr = (element) => {
                return this.type(element) === "number";
            };

            static obj = (element) => {
                return this.type(element) === "object";
            };

            static arr = (element) => {
                return this.type(element) === "array";
            };

            static fn = (element) => {
                return this.type(element) === "function";
            };

            static absent = (element) => {
                return (
                    this.null(element) ||
                    this.undefined(element) ||
                    (this.nbr(element) && isNaN(element)) ||
                    (this.str(element) && element === "") ||
                    (this.arr(element) && element.length === 0) ||
                    (this.obj(element) && Object.keys(element).length === 0)
                );
            };

            static present = (element) => {
                return !this.absent(element);
            };
        };

        static __kebab(str) {
            return str.replace(/([a-z])([A-Z])/g, (match) => match[0] + "-" + match[1]).toLowerCase();
        }

        static __uid(length) {
            let result = "";
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }

            return /\d/g.test(result[0]) ? Class.__uid(length) : result;
        }
    };
})();