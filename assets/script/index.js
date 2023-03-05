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