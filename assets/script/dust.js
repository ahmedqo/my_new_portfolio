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
        static __CONT = false;
        static __MEMO = [];
        static __REFS = {};
        static __HELP = {
            media: {
                sm: () => {
                    return window.matchMedia("(" + Class.Const.medias.sm.break+")").matches;
                },
                md: () => {
                    return window.matchMedia("(" + Class.Const.medias.md.break+")").matches;
                },
                lg: () => {
                    return window.matchMedia("(" + Class.Const.medias.lg.break+")").matches;
                },
                xl: () => {
                    return window.matchMedia("(" + Class.Const.medias.xl.break+")").matches;
                },
            },
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
        static __STRT = [];
        static __UPDT = [];

        get refs() {
            return Class.__REFS;
        }

        constructor(container, style, state) {
            window[$NAME] = Class;
            const self = this;
            this.state = state;
            this.style = document.querySelector(style);
            this.container = document.querySelector(container);
            Object.defineProperty(this.container, "src", {
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
            Object.defineProperty(this.style, "src", {
                get() {
                    return this.__src;
                },
                set(value) {
                    this.innerHTML = "";
                    if (!value) return undefined;
                    this.__src = value;
                    (async() => {
                        var code = await fetch(this.__src);
                        self.sass = await code.text();
                        self.__run();
                    })();
                },
            });
            this.template = this.container.querySelector("template").innerHTML;
            if (this.container.hasAttribute("src")) {
                this.src = this.container.getAttribute("src");
            } else {
                this.style && (this.sass = this.style.textContent);
                this.container.innerHTML = "";
                this.style.innerHTML = "";
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

        async __run() {
            if (this.style) {
                const sass = new(Class.Preset)(this.sass, this.state).exec("html");
                this.style.textContent = new(Class.Sass)(sass).exec();
            }
            const tree = await new(Class.Preset)(this.template, this.state, true).exec();
            if (tree.children.length) {
                if (!this.props) this.props = new(Class.Maker)(this.container, tree);
                this.props.exec(tree);
                this.constructor.__CONT = true;
                this.constructor.__exec("__UPDT");
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

            const repeatOften = () => {
                if (this.constructor.__CONT === true) this.constructor.__exec("__STRT");
                else requestAnimationFrame(repeatOften);
            }
            requestAnimationFrame(repeatOften);
        }

        static Helper(name, fn) {
            if (["loop", "self", ...Object.keys(Class.__HELP)].includes(name)) throw new Error("reserved helper name (" + name + ")");
            this.__HELP[name] = fn;
        }

        static start(fn) {
            this.__STRT.push(fn);
        }

        static update(fn) {
            this.__UPDT.push(fn);
        }

        static init(fn) {
            document.addEventListener("DOMContentLoaded", fn);
        }

        static __exec(name) {
            const current = this[name];
            for (let fn of current) fn();
        }

        static Sass = class {
            constructor(template) {
                this.template = template.replace(new RegExp(/url\("(.*)"\)/g), (_, s) => {
                    return `url("${encodeURIComponent(s)}")`;
                });
                Class.Const.tree = [];
                Class.Const.imports = [];
                Class.Const.frames = [];
                Class.Const.variables = [];
                Class.Const.mixins = [];
                Class.Const.medias = {
                    sm: {
                        break: "min-width:640px",
                        tree: []
                    },
                    md: {
                        break: "min-width:768px",
                        tree: []
                    },
                    lg: {
                        break: "min-width:1024px",
                        tree: []
                    },
                    xl: {
                        break: "min-width:1280px",
                        tree: []
                    },
                }
            }

            __object() {
                const node = {};
                let match = null;
                this.template = this.template.replace(Class.Const.commentX, '');
                while ((match = Class.Const.altX.exec(this.template)) != null) {
                    if (!this.__empty(match[ /*selector*/ 2])) {
                        const name = match[ /*selector*/ 2].trim();
                        const newNode = this.__object(this.template);
                        newNode["@position"] = String(Class.Const.sasscount++);
                        node[name] = newNode;
                    } else if (!this.__empty(match[ /*end*/ 3])) {
                        return node;
                    } else if (!this.__empty(match[ /*attr*/ 4])) {
                        const line = match[ /*attr*/ 4].trim();
                        const attr = Class.Const.lineAttrX.exec(line);
                        if (attr) {
                            const name = attr[1].trim();
                            const value = attr[2].trim();
                            node[name] = value;
                        }
                    }
                }
                return node;
            }

            __mixin(csstree) {
                var newtree = {};
                Object.keys(csstree).forEach(key => {
                    if (typeof csstree[key] === "object") {
                        newtree[key] = this.__mixin(csstree[key]);
                    } else {
                        if (key === "@include") {
                            const names = csstree[key].split(",").map(e => e.trim());
                            names.forEach(name => {
                                const object = Class.Const.mixins.find(e => e.name === name).properties;
                                newtree = {
                                    ...newtree,
                                    ...this.__mixin(object)
                                };
                            });
                        } else {
                            newtree[key] = csstree[key];
                        }
                    }
                });
                return newtree;
            }

            __variable(csstree) {
                Object.keys(csstree).forEach(key => {
                    if (typeof csstree[key] === "object") {
                        csstree[key] = this.__variable(csstree[key]);
                    } else {
                        csstree[key] = csstree[key].replace(/\$([A-za-z0-9_-]+)/g, (_, s) => {
                            return Class.Const.variables.find(e => e.name === s).value;
                        });
                    }
                });
                return csstree
            }

            __property(csstree, parent, newtree) {
                const properties = [];
                Object.keys(csstree).forEach(key => {
                    if (typeof csstree[key] === "object") {
                        var _ = [];
                        const selector = key.split(",").map(e => e.trim());
                        for (let i = 0; i < parent.length; i++) {
                            for (let j = 0; j < selector.length; j++) {
                                const text = parent[i] + (selector[j][0] === "&" ? selector[j].substr(1) : " " + selector[j]);
                                _.push(text);
                            }
                        }
                        newtree.push({
                            selector: _,
                            properties: this.__property(csstree[key], _, newtree)
                        });
                    } else {
                        properties.push({
                            name: key,
                            value: csstree[key],
                        })
                    }
                });
                return properties;
            }

            __extract() {
                const csstree = this.__object();
                Object.keys(csstree).forEach(key => {
                    let found = false;
                    if (key[0] === "$") {
                        Class.Const.variables.push({
                            name: key.slice(1),
                            value: csstree[key],
                        });
                        found = true;
                    } else if (key.slice(1, 6) === "mixin") {
                        Class.Const.mixins.push({
                            name: key.slice(6).trim(),
                            properties: {
                                ...csstree[key]
                            }
                        });
                        found = true;
                    } else if (key.slice(1, 7) === "import") {
                        Class.Const.imports.push(decodeURIComponent(csstree[key]));
                        found = true;
                    }
                    if (found)
                        delete csstree[key];
                });
                Class.Const.tree = this.__variable(this.__mixin(csstree));
            }

            __clean() {
                const position = [];
                Class.Const.tree = Class.Const.tree.sort((a, b) => {
                    const apos = parseInt(a.properties.find(e => e.name === "@position").value);
                    const bpos = parseInt(b.properties.find(e => e.name === "@position").value);
                    return apos - bpos;
                }).map(e => {
                    var position = e.properties.find(e => e.name === "@position");
                    position = e.properties.indexOf(position);
                    e.properties.splice(position, 1);
                    return e;
                }).filter(e => e.properties.length);

                Class.Const.tree.forEach((tree, i) => {
                    if (tree.selector[0].startsWith("@media.")) {
                        const _ = {},
                            con = tree.selector[0].split(" ")[0].slice(7);
                        _.selector = tree.selector.map(e => e.slice(10));
                        _.properties = tree.properties;
                        Class.Const.medias[con].tree.push(_);
                        position.push(i);
                    }
                    if (tree.selector[0].startsWith("@frame")) {
                        const name = tree.selector[0].split(" ")[1];
                        var found = Class.Const.frames.find(e => e.name === name);
                        if (!found) {
                            Class.Const.frames.push({
                                name: name,
                                tree: []
                            });
                            found = Class.Const.frames[Class.Const.frames.length - 1];
                        }
                        const _ = {};
                        _.selector = tree.selector.map(e => e.slice(7 + name.length).trim());
                        _.properties = tree.properties;
                        found.tree.push(_);
                        position.push(i);
                    }
                });

                Class.Const.tree = Class.Const.tree.filter((_, i) => !position.includes(i));
            }

            __parse() {
                this.__extract();
                const csstree = Class.Const.tree;
                Class.Const.tree = [];
                Object.keys(csstree).forEach(key => {
                    const selector = key.split(",").map(e => e.trim());
                    Class.Const.tree.push({
                        selector: selector,
                        properties: this.__property(csstree[key], selector, Class.Const.tree),
                    });
                });
                this.__clean();
            }

            __empty(str) {
                return typeof str === 'undefined' || str.length === 0 || str === null;
            }

            __string(object) {
                var str = `${object.selector.join()}{`;
                Object.keys(object.properties).forEach(key => {
                    const current = object.properties[key];
                    str += `${current.name}:${current.value};`;
                });
                return str && (str += "}");
            }

            exec() {
                this.__parse();
                const stylesheet = [...Class.Const.imports.map(e => `@import ${e};`)];
                Class.Const.tree.forEach(obj => {
                    stylesheet.push(this.__string(obj));
                });

                Class.Const.frames.forEach(obj => {
                    stylesheet.push(`@keyframes ${obj.name} {${obj.tree.map(e => this.__string(e)).join("")}}`);
                });

                Object.keys(Class.Const.medias).forEach(key => {
                    const curr = Class.Const.medias[key];
                    if (curr.tree.length)
                        stylesheet.push(`@media (${curr.break}) {${curr.tree.map(e => this.__string(e)).join("")}}`);
                });

                return stylesheet.join("");
            }
        }

        static Preset = class {
            constructor(str, data = {}, fetch = false) {
                this.template = str.replace(Class.Const.COMMENT_REG, "");
                this.data = data;
                this.fetch = fetch;
            }

            __clean(str) {
                str = str.replace(/&lt;/g, "<");
                str = str.replace(/&gt;/g, ">");
                str = str.replace(/&quot;/g, '"');
                str = str.replace(/&#39;/g, "'");
                str = str.replace(/&amp;/g, "&");
                str = str.replace(/\n/g, "");
                str = str.replace(/\s+/g, " ");
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
                    .filter((str) => str && str.length > 0);
            }

            __place(str) {
                str = str.replaceAll(/(@loop)(?=(?:[^'"`]|["'`][^'"`]*["'`])*$)/g, "$LOOP");
                str = str.replaceAll(/(@self)(?=(?:[^'"`]|["'`][^'"`]*["'`])*$)/g, "$SELF");
                str = str.replaceAll(/(@refs)(?=(?:[^'"`]|["'`][^'"`]*["'`])*$)/g, $NAME + ".__REFS");
                str = str.replaceAll(/(@)(?=(?:[^'"`]|["'`][^'"`]*["'`])*$)/g, $NAME + ".__HELP.");
                str = str.replaceAll(/([.]+[\w\d-_]+)(?=(?:[^'"`]|["'`][^'"`]*["'`])*$)/g, (e) => "['" + e.slice(1) + "']");
                return str;
            }

            __parse(str) {
                const data = {
                    txt: [],
                    jsx: [],
                };
                var state = Class.Const.OPEN_TAG;
                str = this.__clean(str).replaceAll(Class.Const.COMMENT_REG, "");
                while (str.length) {
                    switch (state) {
                        case Class.Const.OPEN_TAG:
                            var index = str.indexOf(Class.Const.OPEN_TAG);
                            if (index > -1) {
                                var code = str.slice(0, index);
                                if (["#js"].includes(data.jsx[data.jsx.length - 1])) data.jsx.push("<js:code>" + code);
                                else data.txt.push(code);
                                str = str.slice(index);
                                state = Class.Const.CLSE_TAG;
                            } else {
                                str.length && data.txt.push(str);
                                str = "";
                            }
                        case Class.Const.CLSE_TAG:
                            var index = str.indexOf(Class.Const.CLSE_TAG);
                            if (index > -1) {
                                index = this.__last(str, index);
                                var code = str.slice(state.length, index).trim();
                                data.jsx.push(code);
                                str = str.slice(index + state.length);
                                state = Class.Const.OPEN_TAG;
                            } else {
                                str.length && data.jsx.push(str);
                                str = "";
                            }
                    }
                }
                return data;
            }

            __last(str, index) {
                if (str[index + 2] === Class.Const.CLSE_TAG[0]) index = index + 1;
                else return index;
                return this.__last(str, index);
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

            __bind(object) {
                for (var fn in object) {
                    if (typeof object[fn] === "function")
                        object[fn] = object[fn].bind(this.data);
                    else this.__bind(object[fn]);
                }
            }

            __run(type) {
                const str = this.__token(this.template);
                this.__bind(Class.__HELP);
                const res = new Function(
                    "",
                    "return function($SELF) {" +
                    "var $TXT = '', $JSX = [], $EACH = (obj, func) => {if (obj ===null) {return obj;}let index = -1;if (Array.isArray(obj)) {const length = obj.length;let count = 1;while (++index < length) {if (func(obj[index], {key: index,round: count,index: count - 1,}) === false) {break;}count++;}}let key = Object.keys(obj);const length = key.length;let count = 1;while (++index < length) {if (func(obj[key[index]], {key: key[index],round: count,index: count - 1,}) === false) {break;}count++;}}, $RANGE = (times, func) => {for (let i = 0; i < times; i++) {func({round: i + 1,index: i,});}};" +
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
                return new Class.Jsx(...res).exec();
            }

            exec(type) {
                if (this.fetch) {
                    return new Promise(async res => {
                        this.template = await this.__include(this.template);
                        res(this.__run(type));
                    });
                }
                return this.__run(type);
            }

            __get(object) {
                return this.constructor[object];
            }

            async __fetch(path) {
                path = path.startsWith("/") ? path.slice(1) : path;
                path = "/views/" + path.replaceAll(".", "/") + ".dust.html";
                if (!Class.__MEMO[path]) {
                    const r = await fetch(path);
                    Class.__MEMO[path] = r.status === 200 ? (await r.text()) : "";
                }
                return Class.__MEMO[path];
            }

            async __include(code) {
                code = code.replace(Class.Const.COMMENT_REG, "");
                const matches = [];
                code = code.replace(/{{\s*#import\s+['|"|`](.*?)['|"|`]\s*}}/g, (_, path) => {
                    const hold = "___import__placement__code__" + (Class.Const.presetcount++) + "___"
                    matches.push({
                        path,
                        hold
                    });
                    return hold;
                });
                for (var match of matches) {
                    var _code = await this.__fetch(match.path);
                    code = code.replace(match.hold, this.__clean(_code));
                    code = await this.__include(code);
                }
                return code;
            }
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
                            props[attr.name] = (typeof opt.args[opt.current] === "string") ? opt.args[opt.current].trim() : opt.args[opt.current];
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
                stack.push(new(Class.TreeNode)({
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
        };

        static Maker = class {
            constructor(container, tree) {
                this.container = container;
                this.instance = undefined;
                this.tree = tree;
            }

            __instance(fiber) {
                const dom =
                    fiber.tag === Class.Const.TEXT_ELEMENT ?
                    document.createTextNode("") :
                    fiber.tag in Class.Const.SVG_TAGS ?
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
                return new(Class.Instance)({
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
                    const is_s = _ in Class.Const.SVG_TAGS;
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
                        const _ = prop.split(".").reduce((a, e) => e.length ? a + `["${e}"]` : a, "");
                        eval(`dom${_} = _new[prop]`);
                        continue;
                    }
                    if (is_r) {
                        if (Class.__REFS[_new[prop]])
                            Array.isArray(Class.__REFS[_new[prop]]) ?
                            Class.__REFS[_new[prop]].push(dom) :
                            (Class.__REFS[_new[prop]] = [Class.__REFS[_new[prop]], dom]);
                        else Class.__REFS[_new[prop]] = dom;
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
                        Class.Verify.nbr(cur) && !(prop in Class.Const.STYLE_PROPS) && (cur += "px");
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
                Class.__REFS = {};
                this.instance = this.__run(this.container, this.instance, this.tree);
                const first = this.container.children[0];
                if (first.tagName === "TEMPLATE") {
                    [...first.children].forEach((child) => {
                        this.container.appendChild(child);
                    });
                    first.remove();
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

        static Instance = class {
            constructor(opt) {
                this.dom = opt.dom;
                this.fiber = opt.fiber;
                this.children = opt.children;
            }
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

        static Const = class {
            static sasscount = 0;
            static selX = /([^\s\;\{\}][^\;\{\}]*)\{/g;
            static endX = /\}/g;
            static lineX = /([^\;\{\}]*)\;/g;
            static commentX = /\/\*[\s\S]*?\*\//g;
            static lineAttrX = /([^\:]+):([^\;]*);/;
            static altX = /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gim;
            static tree = [];
            static imports = [];
            static frames = [];
            static variables = [];
            static mixins = [];
            static medias = {
                sm: {
                    break: "min-width:640px",
                    tree: []
                },
                md: {
                    break: "min-width:768px",
                    tree: []
                },
                lg: {
                    break: "min-width:1024px",
                    tree: []
                },
                xl: {
                    break: "min-width:1280px",
                    tree: []
                },
            };

            static TEXT_ELEMENT = "text";

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

            static IMPORTS_REG = /{{\s*#import\s+['|"|`](.*?)['|"|`]\s*}}/g;
            static COMMENT_REG = /{{!--(.*?)--}}/gms;
            static OPEN_TAG = "{{";
            static CLSE_TAG = "}}";
            static presetcount = 0;
        }

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