

function bodyOnLoad(){


    const buttons = document.querySelectorAll(".tab-button");
    const panes = document.querySelectorAll(".tab-pane");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove active class from all buttons and panes
            buttons.forEach(btn => btn.classList.remove("active"));
            panes.forEach(pane => pane.classList.remove("active"));

            // Add active class to the clicked button and the corresponding pane
            button.classList.add("active");
            const tabId = button.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });




// Example settings data
const settingsData = [
    {
        title: "General Settings",
        options: [
            {
                type: "select",
                label: "Time Zone",
                choices: [
                    "GMT+00:00 London",
                    "GMT+01:00 Berlin",
                    "GMT+03:00 Moscow",
                    "GMT+09:00 Tokyo",
                ],
                selected: "GMT+03:00 Moscow",
            },
            {
                type: "checkbox",
                label: "Log uncaught exceptions to the Cloud Console",
                checked: true,
            },
            {
                type: "checkbox",
                label: "Enable Chrome V8 runtime",
                checked: true,
            },
        ],
    },
    {
        title: "Project Identifiers",
        options: [
            {
                type: "text",
                label: "Script Identifier",
                value: "1RL_83b-nhZVVSkS6fwhxKAifTdxOz4KTPXdtrm-HZCMUHMfcRlnVul",
                readonly: true,
            },
        ],
    },
    {
        title: "Google Cloud Platform (GCP)",
        options: [
            {
                type: "dropdown",
                label: "GCP Project",
                choices: ["Default", "Custom"],
                selected: "Default",
            },
        ],
    },
];

// Function to generate settings UI
function generateSettings(containerId, settings) {
    const container = document.getElementById(containerId);

    settings.forEach((section) => {
        // Section title
        const sectionTitle = document.createElement("div");
        sectionTitle.className = "section-title";
        sectionTitle.textContent = section.title;
        container.appendChild(sectionTitle);

        // Section options
        const sectionGroup = document.createElement("div");
        sectionGroup.className = "setting-group";

        section.options.forEach((option) => {
            const item = document.createElement("div");
            item.className = "setting-item";

            if (option.type === "select" || option.type === "dropdown") {
                const label = document.createElement("label");
                label.textContent = option.label;
                item.appendChild(label);

                const select = document.createElement("select");
                option.choices.forEach((choice) => {
                    const opt = document.createElement("option");
                    opt.textContent = choice;
                    opt.value = choice;
                    if (choice === option.selected) {
                        opt.selected = true;
                    }
                    select.appendChild(opt);
                });
                item.appendChild(select);
            } else if (option.type === "checkbox") {
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = option.checked;
                const label = document.createElement("label");
                label.textContent = option.label;
                item.appendChild(checkbox);
                item.appendChild(label);
            } else if (option.type === "text") {
                const label = document.createElement("label");
                label.textContent = option.label;
                item.appendChild(label);

                const input = document.createElement("input");
                input.type = "text";
                input.value = option.value;
                if (option.readonly) {
                    input.readOnly = true;
                }
                item.appendChild(input);
            }

            sectionGroup.appendChild(item);
        });

        container.appendChild(sectionGroup);
    });
}

// Generate the settings UI
generateSettings("content-container", settingsData);

}

