

registerPageInit("settings", initSettingsPage);

async function initSettingsPage() {
        const $ = (selector) => document.querySelector(selector);
        const usersBody = $("#users-table-body");
        const usersStatus = $("#users-status");
        const usersEmpty = $("#users-empty");
        const dialog = $("#user-dialog");
        const form = $("#user-form");
        const salaryPercentDialog = $("#salary-percent-dialog");
        const salaryPercentForm = $("#salary-percent-form");
        let users = [];
        let query = "";
        let userEdited = false;
        let activeSalaryPercentUser = "";
        let salaryPercentEdited = false;
        const salaryPaymentMethods = ["Cash", "Transfer", "Terminal", "RUB_QR"];
        const schedulePalette = [
            "#004d40", "#00bcd4", "#0d47a1", "#2979ff", "#4a148c", "#aa00ff", "#880e4f", "#ff4081",
            "#813232", "#ff1745", "#e65100", "#136484", "#ffea00", "#1b5e20", "#00e676", "#263238",
        ];

        function unwrapList(raw, keys) {
            let value = raw;
            for (let depth = 0; depth < 5; depth += 1) {
                if (typeof value === "string") {
                    try { value = JSON.parse(value); } catch (_) { return []; }
                }
                if (Array.isArray(value)) return value;
                if (!value || typeof value !== "object") return [];
                if (value.json && typeof value.json === "object") {
                    value = value.json;
                    continue;
                }
                if (value.brand !== undefined || value.Brand !== undefined) return [value];
                const key = keys.find((candidate) => value[candidate] !== undefined)
                    || Object.keys(value).find((candidate) => keys.some((keyName) => keyName.toLowerCase() === candidate.toLowerCase()));
                if (!key) return [];
                value = value[key];
            }
            return [];
        }

        function normalizeUser(raw) {
            const name = String(raw?.Name ?? raw?.name ?? raw?.username ?? raw?.login ?? "");
            const availableValue = raw?.Available ?? raw?.available;
            const available = availableValue === 1 || availableValue === true || String(availableValue ?? "").trim() === "1";
            return {
                id: String(raw?.id ?? raw?.userId ?? raw?.user_id ?? ""),
                name,
                revision: raw?.Revision ?? raw?.revision ?? null,
                role: raw?.role ?? "",
                salaryFixHour: raw?.salaryFixHour ?? 0,
                available,
                schedulecolor: normalizeHexColor(raw?.schedulecolor),
                fontcolor: normalizeHexColor(raw?.fontcolor),
            };
        }

        function normalizeHexColor(value) {
            const color = String(value ?? "").trim();
            return /^#[0-9a-f]{6}$/i.test(color) ? color : "";
        }

        function formatRevision(value) {
            if (value == null || value === "") return "—";
            const date = new Date(Number(value) * 1000);
            return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("ru-RU");
        }

        function setStatus(message, kind = "") {
            usersStatus.textContent = message;
            usersStatus.className = `users-status${kind ? ` is-${kind}` : ""}`;
        }

        function renderUsers() {
            const needle = query.trim().toLocaleLowerCase();
            const filtered = users
                .filter((user) => [user.name, String(user.role), String(user.salaryFixHour)]
                    .some((value) => value.toLocaleLowerCase().includes(needle)))
                .sort((a, b) => Number(b.available) - Number(a.available));
            usersBody.replaceChildren();
            filtered.forEach((user) => {
                const row = document.createElement("tr");
                const nameCell = document.createElement("td");
                const preview = document.createElement("span");
                preview.className = "user-name-preview user-name-preview-small";
                preview.textContent = user.name || "—";
                preview.style.backgroundColor = user.schedulecolor || "#000000";
                preview.style.color = user.fontcolor || "#ffffff";
                nameCell.appendChild(preview);
                const roleCell = document.createElement("td");
                roleCell.textContent = user.role === "" ? "—" : String(user.role);
                const salaryCell = document.createElement("td");
                salaryCell.textContent = String(user.salaryFixHour);
                const availableCell = document.createElement("td");
                const status = document.createElement("span");
                status.className = `user-status${user.available ? " is-active" : " is-inactive"}`;
                status.textContent = user.available ? "Активен" : "Отключён";
                availableCell.appendChild(status);
                const revisionCell = document.createElement("td");
                revisionCell.className = "user-revision";
                revisionCell.textContent = formatRevision(user.revision);
                const actionCell = document.createElement("td");
                const edit = document.createElement("button");
                edit.className = "button-secondary button-edit-user";
                edit.type = "button";
                edit.textContent = "Изменить";
                edit.addEventListener("click", () => openEditor(user));
                const salaryPercent = document.createElement("button");
                salaryPercent.className = "button-secondary button-edit-user";
                salaryPercent.type = "button";
                salaryPercent.textContent = "Проценты";
                salaryPercent.addEventListener("click", () => openSalaryPercentEditor(user));
                const actions = document.createElement("div");
                actions.className = "user-actions";
                actions.append(edit, salaryPercent);
                actionCell.appendChild(actions);
                row.append(nameCell, roleCell, salaryCell, availableCell, revisionCell, actionCell);
                usersBody.appendChild(row);
            });
            usersEmpty.hidden = filtered.length > 0;
        }

        function renderSalaryPercentRows(rawRows) {
            const tbody = $("#salary-percent-rows");
            tbody.replaceChildren();
            const readField = (raw, field) => {
                const key = Object.keys(raw || {}).find((candidate) => candidate.trim().toLowerCase() === field.toLowerCase());
                return key === undefined ? "" : raw[key] ?? "";
            };
            const rows = rawRows.map((raw) => {
                const record = raw?.json && typeof raw.json === "object" ? raw.json : raw;
                const brand = readField(record, "brand") || readField(record, "BrandName");
                const recordId = readField(record, "id");
                return {
                    id: recordId === "" ? readField(record, "Id") : recordId,
                    brand: String(brand).trim(),
                    Cash: readField(record, "Cash"),
                    Transfer: readField(record, "Transfer"),
                    Terminal: readField(record, "Terminal"),
                    RUB_QR: readField(record, "RUB_QR"),
                };
            }).filter((row) => row.brand);

            if (!rows.length) {
                const emptyRow = document.createElement("tr");
                const emptyCell = document.createElement("td");
                emptyCell.colSpan = salaryPaymentMethods.length + 1;
                emptyCell.className = "salary-percent-empty";
                emptyCell.textContent = "Для пользователя нет данных по процентам";
                emptyRow.appendChild(emptyCell);
                tbody.appendChild(emptyRow);
                return 0;
            }

            rows.forEach((row) => {
                const tableRow = document.createElement("tr");
                tableRow.dataset.brand = row.brand;
                if (row.id !== "") tableRow.dataset.recordId = JSON.stringify(row.id);
                const brandCell = document.createElement("td");
                brandCell.textContent = row.brand;
                tableRow.appendChild(brandCell);
                salaryPaymentMethods.forEach((method) => {
                    const percentCell = document.createElement("td");
                    const input = document.createElement("input");
                    input.className = "salary-percent-input";
                    input.type = "number";
                    input.step = "any";
                    input.required = true;
                    input.value = row[method] === "" ? "" : String(row[method]);
                    input.dataset.paymentMethod = method;
                    input.setAttribute("aria-label", `${row.brand}, ${method}, процент продаж`);
                    input.addEventListener("input", () => { salaryPercentEdited = true; });
                    percentCell.appendChild(input);
                    tableRow.appendChild(percentCell);
                });
                tbody.appendChild(tableRow);
            });
            return rows.length;
        }

        async function openSalaryPercentEditor(user) {
            activeSalaryPercentUser = user.name;
            salaryPercentEdited = false;
            $("#salary-percent-dialog-title").textContent = `Проценты: ${user.name}`;
            $("#salary-percent-error").textContent = "";
            $("#salary-percent-rows").replaceChildren();
            const saveButton = $("#salary-percent-save");
            saveButton.disabled = true;
            const loadingRow = document.createElement("tr");
            const loadingCell = document.createElement("td");
            loadingCell.colSpan = 2;
            loadingCell.textContent = "Загружаю проценты…";
            loadingRow.appendChild(loadingCell);
            $("#salary-percent-rows").appendChild(loadingRow);
            salaryPercentDialog.showModal();

            try {
                const result = await window.API.getSalaryPercent({ token: window.token, username: user.name }, { overlayId: "settings" });
                if (result == null) throw new Error("Не удалось загрузить проценты");
                const rows = unwrapList(result, ["rows", "salaryPercent", "percentages", "records", "data", "items", "result", "response", "body", "values"]);
                saveButton.disabled = renderSalaryPercentRows(rows) === 0;
            } catch (error) {
                console.error("Failed to load salary percentages", error);
                $("#salary-percent-error").textContent = error.message || "Не удалось загрузить проценты";
                $("#salary-percent-rows").replaceChildren();
            }
        }

        async function saveSalaryPercent(event) {
            event.preventDefault();
            const errorEl = $("#salary-percent-error");
            const saveButton = $("#salary-percent-save");
            errorEl.textContent = "";
            const records = Array.from($("#salary-percent-rows").querySelectorAll("tr[data-brand]"))
                .map((row) => {
                    const record = { username: activeSalaryPercentUser, brand: row.dataset.brand };
                    if (row.dataset.recordId) record.Id = JSON.parse(row.dataset.recordId);
                    salaryPaymentMethods.forEach((method) => {
                        const value = row.querySelector(`[data-payment-method="${method}"]`).value.trim();
                        record[method] = value === "" ? NaN : Number(value);
                    });
                    return record;
                });
            if (records.some((record) => salaryPaymentMethods.some((method) => !Number.isFinite(record[method])))) {
                errorEl.textContent = "Укажите корректный процент для каждого способа оплаты";
                return;
            }

            saveButton.disabled = true;
            try {
                const result = await window.API.updateSalaryPercent({
                    token: window.token,
                    username: activeSalaryPercentUser,
                    records,
                }, { overlayId: "settings" });
                const response = responseObject(result);
                if (response.success === false || response.error) {
                    throw new Error(response.message || response.error || "Сервис отклонил запрос");
                }
                salaryPercentDialog.close();
                setStatus(`Проценты пользователя «${activeSalaryPercentUser}» сохранены`, "success");
            } catch (error) {
                console.error("Failed to save salary percentages", error);
                errorEl.textContent = error.message || "Не удалось сохранить проценты";
            } finally {
                saveButton.disabled = false;
            }
        }

        async function loadUsers() {
            setStatus("Загружаю пользователей…");
            try {
                const userResponse = await window.API.getUsers({ visible: true, token: window.token }, { overlayId: "settings" });
                users = unwrapList(userResponse, ["users", "data", "items", "records"]).map(normalizeUser);
                renderUsers();
                setStatus(`${users.length} пользователей`, "success");
            } catch (error) {
                console.error("Failed to load users", error);
                setStatus("Не удалось загрузить пользователей. Проверьте подключение сервиса.", "error");
                usersBody.replaceChildren();
                usersEmpty.hidden = false;
            }
        }

        function setColorField(field, value) {
            const input = $(`#user-${field}`);
            const normalized = normalizeHexColor(value);
            input.value = normalized || (field === "fontcolor" ? "#ffffff" : "#000000");
            input.dataset.empty = normalized ? "false" : "true";
            $(`#user-${field}-value`).textContent = normalized || "Пусто";
        }

        function getColorField(field) {
            return $(`#user-${field}`).dataset.empty === "true" ? "" : $(`#user-${field}`).value;
        }

        function updateColorPreview() {
            const preview = $("#user-name-preview");
            preview.textContent = $("#user-name").value.trim() || "Имя пользователя";
            preview.style.backgroundColor = getColorField("schedulecolor") || "#000000";
            preview.style.color = getColorField("fontcolor") || "#ffffff";
        }

        function buildColorPalette(field) {
            const container = $(`#user-${field}-palette`);
            const currentColors = users.map((user) => user[field]).filter(Boolean);
            const palette = Array.from(new Set([...schedulePalette, ...currentColors]));
            container.replaceChildren(...palette.map((color) => {
                const swatch = document.createElement("button");
                swatch.type = "button";
                swatch.className = "color-swatch";
                swatch.style.backgroundColor = color;
                swatch.title = color;
                swatch.setAttribute("aria-label", color);
                swatch.addEventListener("click", () => {
                    userEdited = true;
                    const input = $(`#user-${field}`);
                    input.value = color;
                    input.dataset.empty = "false";
                    $(`#user-${field}-value`).textContent = color;
                    updateColorPreview();
                });
                return swatch;
            }));
        }

        function openEditor(user = null) {
            userEdited = false;
            form.reset();
            $("#user-dialog-title").textContent = user ? "Изменить пользователя" : "Новый пользователь";
            $("#user-id").value = user?.id || "";
            $("#user-name").value = user?.name || "";
            $("#user-role").value = user?.role ?? "";
            $("#user-salary").value = user?.salaryFixHour ?? 0;
            $("#user-available").value = user ? (user.available ? "1" : "") : "1";
            ["schedulecolor", "fontcolor"].forEach(buildColorPalette);
            setColorField("schedulecolor", user?.schedulecolor);
            setColorField("fontcolor", user?.fontcolor);
            updateColorPreview();
            $("#user-form-error").textContent = "";
            $("#created-password").hidden = true;
            $("#generated-password").value = "";
            $("#user-save").textContent = user ? "Сохранить" : "Создать";
            $("#user-save").hidden = false;
            dialog.showModal();
            $("#user-name").focus();
        }

        function formUser() {
            const userId = $("#user-id").value.trim();
            const role = Number($("#user-role").value);
            const salaryFixHour = Number($("#user-salary").value);
            return {
                id: userId ? (/^\d+$/.test(userId) ? Number(userId) : userId) : undefined,
                Name: $("#user-name").value.trim(),
                Available: $("#user-available").value || null,
                role,
                salaryFixHour,
                schedulecolor: getColorField("schedulecolor"),
                fontcolor: getColorField("fontcolor"),
            };
        }

        function responseObject(raw) {
            let value = raw;
            for (let depth = 0; depth < 5; depth += 1) {
                if (typeof value === "string") {
                    try { value = JSON.parse(value); } catch (_) { break; }
                }
                if (!value || typeof value !== "object" || Array.isArray(value)) break;
                if (value.data !== undefined && typeof value.data === "object") value = value.data;
                else if (value.result !== undefined && typeof value.result === "object") value = value.result;
                else break;
            }
            return value && typeof value === "object" ? value : {};
        }

        async function saveUser(event) {
            event.preventDefault();
            const user = formUser();
            const isEdit = Boolean(user.id);
            const saveButton = $("#user-save");
            const errorEl = $("#user-form-error");
            saveButton.disabled = true;
            errorEl.textContent = "";
            try {
                const result = await (isEdit
                    ? window.API.updateUser({ token: window.token, user }, { overlayId: "settings" })
                    : window.API.createUser({ token: window.token, user }, { overlayId: "settings" }));
                const response = responseObject(result);
                if (response.success === false || response.error) {
                    throw new Error(response.message || response.error || "Сервис отклонил запрос");
                }
                if (!isEdit) {
                    const password = response.password ?? response.generatedPassword ?? response.temporaryPassword;
                    if (!password) throw new Error("Пользователь создан, но сервис не вернул пароль. Проверьте ответ backend.");
                    $("#generated-password").value = String(password);
                    $("#created-password").hidden = false;
                    $("#user-save").hidden = true;
                    setStatus("Пользователь создан", "success");
                } else {
                    dialog.close();
                    setStatus("Изменения сохранены", "success");
                }
                await reloadUsersAfterWrite();
            } catch (error) {
                console.error("Failed to save user", error);
                errorEl.textContent = error.message || "Не удалось сохранить пользователя";
            } finally {
                saveButton.disabled = false;
            }
        }

        async function reloadUsersAfterWrite() {
            try {
                const response = await window.API.getUsers({ visible: true, token: window.token }, { overlayId: "settings" });
                users = unwrapList(response, ["users", "data", "items", "records"]).map(normalizeUser);
                renderUsers();
            } catch (error) {
                console.warn("Could not refresh user list", error);
            }
        }

        document.querySelectorAll(".tab-button").forEach((button) => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".tab-button").forEach((tab) => {
                    const selected = tab === button;
                    tab.classList.toggle("active", selected);
                    tab.setAttribute("aria-selected", String(selected));
                });
                document.querySelectorAll(".tab-pane").forEach((pane) => {
                    const selected = pane.id === button.dataset.tab;
                    pane.classList.toggle("active", selected);
                    pane.hidden = !selected;
                });
            });
        });

        $("#user-add").addEventListener("click", () => openEditor());
        $("#users-search").addEventListener("input", (event) => { query = event.target.value; renderUsers(); });
        form.addEventListener("input", () => { userEdited = true; });
        form.addEventListener("change", () => { userEdited = true; });
        $("#user-name").addEventListener("input", updateColorPreview);
        ["schedulecolor", "fontcolor"].forEach((field) => {
            $(`#user-${field}`).addEventListener("input", () => {
                $(`#user-${field}`).dataset.empty = "false";
                $(`#user-${field}-value`).textContent = $(`#user-${field}`).value.toUpperCase();
                updateColorPreview();
            });
            $(`#user-${field}-clear`).addEventListener("click", () => {
                userEdited = true;
                setColorField(field, "");
                updateColorPreview();
            });
        });
        $("#user-dialog-close").addEventListener("click", () => dialog.close());
        $("#user-cancel").addEventListener("click", () => dialog.close());
        $("#user-form").addEventListener("submit", saveUser);
        $("#copy-password").addEventListener("click", async () => {
            const password = $("#generated-password").value;
            try {
                await navigator.clipboard.writeText(password);
                $("#copy-password").textContent = "Скопировано";
            } catch (_) {
                $("#generated-password").select();
                document.execCommand("copy");
                $("#copy-password").textContent = "Скопировано";
            }
        });
        dialog.addEventListener("close", () => {
            $("#generated-password").value = "";
            $("#created-password").hidden = true;
        });
        dialog.addEventListener("cancel", (event) => {
            if (userEdited) event.preventDefault();
        });
        $("#user-dialog").addEventListener("click", (event) => {
            if (event.target === dialog && !userEdited) dialog.close();
        });
        $("#salary-percent-dialog-close").addEventListener("click", () => salaryPercentDialog.close());
        $("#salary-percent-cancel").addEventListener("click", () => salaryPercentDialog.close());
        salaryPercentForm.addEventListener("submit", saveSalaryPercent);
        salaryPercentDialog.addEventListener("cancel", (event) => {
            if (salaryPercentEdited) event.preventDefault();
        });
        salaryPercentDialog.addEventListener("click", (event) => {
            if (event.target === salaryPercentDialog && !salaryPercentEdited) salaryPercentDialog.close();
        });

        await loadUsers();
    }

