Dust.init(async function() {
    var darkMode = false;
    const min = 4;
    const req = await fetch("/assets/data.json");
    const res = await req.json();

    const time = new Date().getHours();
    if (time <= 6 || time >= 19) darkMode = true;
    else darkMode = false;

    Dust.Helper("show-more", function() {
        return this.projects.length > min;
    });

    App = new Dust(document.querySelector("#code"), document.querySelector("#sass"), {
        dark: darkMode,
        auto: true,
        shrink: false,
        limit: min,
        info: {
            phone: "+2126-7971-9118",
            email: "ahmedqo1995@gmail.com",
            social: {
                facebook: "https://www.facebook.com/ahmed.qo/",
                linkedin: "https://www.linkedin.com/in/ahmed-qoreichi-3a3475a7/",
                instagran: "https://www.instagram.com/ah_med_qo/",
                github: "https://github.com/ahmedqo",
            }
        },
        services: [{
                name: "Design",
                desc: "Create digital products with unique ideas.",
                path: "M4.7 43v-9.3l9.35-9.35-7.85-7.8q-.7-.7-1.025-1.5-.325-.8-.325-1.7 0-.9.325-1.75T6.2 10.1l3.65-3.75q.7-.65 1.5-1.025.8-.375 1.7-.375.9 0 1.775.375.875.375 1.525 1.025l7.9 7.9 9.3-9.3q.25-.25.7-.45.45-.2.95-.2.4 0 .825.2.425.2.775.45l5.95 6q.25.25.45.7.2.45.2.9t-.2.9q-.2.45-.45.7l-9.3 9.3 7.9 7.85q.65.65 1.025 1.5.375.85.375 1.7 0 .95-.375 1.775T41.35 37.8l-3.7 3.6q-.65.7-1.5 1.05-.85.35-1.75.35t-1.725-.35q-.825-.35-1.525-1.05l-7.8-7.8-9.4 9.4Zm12.15-21.4 4.6-4.55-3.35-3.3-2.4 2.4L13.55 14 16 11.6l-2.85-2.9-4.55 4.65Zm17.5 17.5 4.5-4.55-2.8-2.85-2.45 2.45-2.1-2.2 2.4-2.4-3.3-3.3-4.55 4.6ZM8.7 39h3.55l20-20.05-3.5-3.55-20.05 20Zm26.4-22.9 3.55-3.45-3.55-3.6-3.55 3.6Z",
            },
            {
                name: "Back-End",
                desc: "I develop back-end with coding super smooth.",
                path: "M5.94981 46.2998L33.7498 18.5498L39.0498 23.8498L29.1998 33.6498L32.5498 36.9998L45.6498 23.8998L36.9998 15.2998L46.2998 5.9498L43.8998 3.5498L3.5498 43.8998L5.94981 46.2998ZM10.4498 31.9498L13.6998 28.7498L8.8498 23.9498L18.6998 14.0998L15.4498 10.8498L2.2998 23.8998L10.4498 31.9498Z",
            },
            {
                name: "SEO",
                desc: "Boost your business with SEO optimize.",
                path: "M24 46.2q-4.6 0-8.625-1.7T8.3 39.75q-3.05-3.05-4.775-7.075Q1.8 28.65 1.8 24.05q0-6.65 3.5-12.1Q8.8 6.5 14.95 3.7q-.25 1.15-.25 2.2 0 1.05.25 2.3-4.3 2.4-6.725 6.675T5.8 24.05q0 7.55 5.325 12.85T24 42.2q7.6 0 12.925-5.3 5.325-5.3 5.325-12.85 0-4.95-2.475-9.175Q37.3 10.65 33 8.15q.25-1.3.3-2.3.05-1-.2-2.15 6.1 2.8 9.625 8.25 3.525 5.45 3.525 12.1 0 4.6-1.75 8.625t-4.8 7.075q-3.05 3.05-7.1 4.75-4.05 1.7-8.6 1.7Zm0-8.9q-5.55 0-9.4-3.875-3.85-3.875-3.85-9.375 0-3.3 1.475-6.1t4.125-4.75q.2.85.575 1.875.375 1.025.825 2.325-1.45 1.3-2.225 3-.775 1.7-.775 3.65 0 3.9 2.675 6.55T24 33.25q3.9 0 6.6-2.65 2.7-2.65 2.7-6.55 0-1.95-.8-3.65t-2.15-3q.4-1.45.75-2.425.35-.975.6-1.775 2.6 2 4.1 4.775 1.5 2.775 1.5 6.075 0 5.5-3.85 9.375T24 37.3Zm-2-21.1q-2.05-5.2-2.55-7.125-.5-1.925-.5-3.775 0-2.15 1.475-3.65T24 .15q2.1 0 3.625 1.5T29.15 5.3q0 1.8-.55 3.625T26.05 16.2Zm2 11.6q-1.65 0-2.725-1.075Q20.2 25.65 20.2 24q0-1.65 1.075-2.75T24 20.15q1.65 0 2.75 1.125T27.85 24q0 1.65-1.125 2.725Q25.6 27.8 24 27.8Z",
            }
        ],
        projects: res.projects || [],
        gotoLink(event) {
            const {
                web
            } = event.target.pocket;
            web && (window.location = web);
        },
        toggleDarkMode() {
            this.state.dark = !this.state.dark;
            this.state.auto = false;
        },
        loadProjects() {
            this.state.limit = this.state.shrink ? min : this.state.projects.length;
            this.state.shrink = !this.state.shrink;
        },
    });

    App.update = () => {
        AOS.init();
    }

    function repeatOften() {
        const time = new Date().getHours();
        if (time <= 6 || time >= 19) darkMode = true;
        else darkMode = false;
        if (App.state.dark !== darkMode && App.state.auto) App.state.dark = darkMode;
        requestAnimationFrame(repeatOften);
    }

    requestAnimationFrame(repeatOften);
    AOS.init();
});


class Sass {
    constructor(template) {
        this.template = template.replace(new RegExp(/url\("(.*)"\)/g), (_, s) => {
            return `url("${encodeURIComponent(s)}")`;
        });
        this.__tree = [];
        this.__imports = [];
        this.__frames = [];
        this.__variables = [];
        this.__mixins = [];
        this.__medias = {
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
        this.__count = 0;
        this.__regex = {
            selX: /([^\s\;\{\}][^\;\{\}]*)\{/g,
            endX: /\}/g,
            lineX: /([^\;\{\}]*)\;/g,
            commentX: /\/\*[\s\S]*?\*\//g,
            lineAttrX: /([^\:]+):([^\;]*);/,
            altX: /(\/\*[\s\S]*?\*\/)|([^\s\;\{\}][^\;\{\}]*(?=\{))|(\})|([^\;\{\}]+\;(?!\s*\*\/))/gim
        }
    }

    // __toLines() {
    //     return this.template.split("\n").map(e => e.trim()).filter(e => e.length);
    // }

    // __toObject() {
    //     const lines = this.__toLines();
    //     var OBJECTSTRING = "",
    //         position = 0;
    //     for (let j = 0; j < lines.length; j++) {
    //         const line = lines[j].replace(new RegExp("(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?"), (_, s) => {
    //             return encodeURIComponent(_);
    //         }).replaceAll("\"", "\\\"");
    //         console.log(line);
    //         var string = "";
    //         for (let i = 0; i < line.length; i++) {
    //             const char = line[i];
    //             if (char == "{") {
    //                 const value = string.trim()
    //                 OBJECTSTRING += `"${value}": {`
    //                 OBJECTSTRING += `"@position": "${position++}",`
    //                 string = "";
    //             } else if (char == ":") {
    //                 const value = string.trim();
    //                 OBJECTSTRING += `"${value.replaceAll("\"", "\\\"")}":`
    //                 string = "";
    //             } else if (i == line.length - 1 && char !== "}") {
    //                 const value = string.trim();
    //                 OBJECTSTRING += `"${value}",`;
    //                 string = "";
    //             } else if (char == "}") {
    //                 OBJECTSTRING += `},`;
    //                 string = "";
    //             } else {
    //                 string += char;
    //             }
    //         }
    //     }
    //     OBJECTSTRING = `{${OBJECTSTRING.replaceAll(",}", "}").slice(0, -1)}}`;
    //     return JSON.parse(OBJECTSTRING);
    // }

    __toObject() {
        const node = {};
        let match = null;
        this.template = this.template.replace(this.__regex.commentX, '');
        while ((match = this.__regex.altX.exec(this.template)) != null) {
            if (!this.__isEmpty(match[ /*selector*/ 2])) {
                const name = match[ /*selector*/ 2].trim();
                const newNode = this.__toObject(this.template);
                newNode["@position"] = String(this.__count++);
                node[name] = newNode;
            } else if (!this.__isEmpty(match[ /*end*/ 3])) {
                return node;
            } else if (!this.__isEmpty(match[ /*attr*/ 4])) {
                const line = match[ /*attr*/ 4].trim();
                const attr = this.__regex.lineAttrX.exec(line);
                if (attr) {
                    const name = attr[1].trim();
                    const value = attr[2].trim();
                    node[name] = value;
                }
            }
        }
        return node;
    }

    __toMixin(csstree) {
        var newtree = {};
        Object.keys(csstree).forEach(key => {
            if (typeof csstree[key] == "object") {
                newtree[key] = this.__toMixin(csstree[key]);
            } else {
                if (key == "@include") {
                    const name = csstree[key];
                    const object = this.__mixins.find(e => e.name == name).properties;
                    newtree = {
                        ...newtree,
                        ...this.__toMixin(object)
                    };
                } else {
                    newtree[key] = csstree[key];
                }
            }
        });
        return newtree;
    }

    __toVariable(csstree) {
        Object.keys(csstree).forEach(key => {
            if (typeof csstree[key] == "object") {
                csstree[key] = this.__toVariable(csstree[key]);
            } else {
                csstree[key] = csstree[key].replace(/\$([A-za-z0-9_-]+)/g, (_, s) => {
                    return this.__variables.find(e => e.name == s).value;
                });
            }
        });
        return csstree
    }

    __toProperty(csstree, parent, newtree) {
        const properties = [];
        Object.keys(csstree).forEach(key => {
            if (typeof csstree[key] == "object") {
                var _ = [];
                const selector = key.split(",").map(e => e.trim());
                for (let i = 0; i < parent.length; i++) {
                    for (let j = 0; j < selector.length; j++) {
                        const text = parent[i] + (selector[j][0] == "&" ? selector[j].substr(1) : " " + selector[j]);
                        _.push(text);
                    }
                }
                newtree.push({
                    selector: _,
                    properties: this.__toProperty(csstree[key], _, newtree)
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

    __toExtract() {
        const csstree = this.__toObject();
        Object.keys(csstree).forEach(key => {
            let found = false;
            if (key[0] == "$") {
                this.__variables.push({
                    name: key.slice(1),
                    value: csstree[key],
                });
                found = true;
            } else if (key.slice(1, 6) == "mixin") {
                this.__mixins.push({
                    name: key.slice(6).trim(),
                    properties: {
                        ...csstree[key]
                    }
                });
                found = true;
            } else if (key.slice(1, 7) == "import") {
                this.__imports.push(decodeURIComponent(csstree[key]));
                found = true;
            }
            if (found)
                delete csstree[key];
        });
        this.__tree = this.__toVariable(this.__toMixin(csstree));
    }

    __toClean() {
        const position = [];
        this.__tree = this.__tree.sort((a, b) => {
            const apos = parseInt(a.properties.find(e => e.name == "@position").value);
            const bpos = parseInt(b.properties.find(e => e.name == "@position").value);
            return apos - bpos;
        }).map(e => {
            var position = e.properties.find(e => e.name == "@position");
            position = e.properties.indexOf(position);
            e.properties.splice(position, 1);
            return e;
        }).filter(e => e.properties.length);

        this.__tree.forEach((tree, i) => {
            if (tree.selector[0].startsWith("@media.")) {
                const _ = {},
                    con = tree.selector[0].split(" ")[0].slice(7);
                _.selector = tree.selector.map(e => e.slice(10));
                _.properties = tree.properties;
                this.__medias[con].tree.push(_);
                position.push(i);
            }
            if (tree.selector[0].startsWith("@frame")) {
                const name = tree.selector[0].split(" ")[1];
                var found = this.__frames.find(e => e.name == name);
                if (!found) {
                    this.__frames.push({
                        name: name,
                        tree: []
                    });
                    found = this.__frames[this.__frames.length - 1];
                }
                const _ = {};
                _.selector = tree.selector.map(e => e.slice(7 + name.length).trim());
                _.properties = tree.properties;
                found.tree.push(_);
                position.push(i);
            }
        });

        this.__tree = this.__tree.filter((_, i) => !position.includes(i));
    }

    __toParse() {
        this.__toExtract();
        const csstree = this.__tree;
        this.__tree = [];
        Object.keys(csstree).forEach(key => {
            const selector = key.split(",").map(e => e.trim());
            this.__tree.push({
                selector: selector,
                properties: this.__toProperty(csstree[key], selector, this.__tree),
            });
        });
        this.__toClean();
    }

    __isEmpty(str) {
        return typeof str == 'undefined' || str.length == 0 || str == null;
    }

    __toString(object) {
        var str = `${object.selector.join()}{`;
        Object.keys(object.properties).forEach(key => {
            const current = object.properties[key];
            str += `${current.name}:${current.value};`;
        });
        return str && (str += "}");
    }

    exec() {
        this.__toParse();
        const stylesheet = [...this.__imports.map(e => `@import ${e};`)];
        this.__tree.forEach(obj => {
            stylesheet.push(this.__toString(obj));
        });

        this.__frames.forEach(obj => {
            stylesheet.push(`@keyframes ${obj.name} {${obj.tree.map(e => this.__toString(e)).join("")}}`);
        });

        Object.keys(this.__medias).forEach(key => {
            const curr = this.__medias[key];
            if (curr.tree.length)
                stylesheet.push(`@media (${curr.break}) {${curr.tree.map(e => this.__toString(e)).join("")}}`);
        });

        return stylesheet.join("");
    }
}


var str = `
    @import: url("https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap");
    $border-color: #0000001a;
    $shadow-color: #ffffff;

    * {
        box-sizing: border-box;
        font-family: "Tajawal", sans-serif;
    }

    html {
        scroll-behavior: smooth;
    }

    .pos {
        &-1 {
            left: 60%;
            top: 70%;
        }
        &-2 {
            left: 5%;
            top: 50%;
        }
        &-3 {
            left: 80%;
            top: 20%;
        }
    }

    .hov:hover {
        h1 {
            color: rgb(168 85 247 / 1);
        }
        svg {
            fill: rgb(168 85 247 / 1);
        }
    }

    .shad  > div {
        box-shadow: 0px 10px 20px -20px $shadow-color;
    }

    .show {
        img {
            object-position: center;
        }
        div {
            border: 1px solid $border-color;
            box-shadow: 0px 10px 20px -12px $shadow-color;
        }
    }

    @media.md {
        .show div {
            &:nth-of-type(odd) {
                position: relative;
                top: -2.5rem !important;
            }
        }
    }
`;