//const socketReminder = require("../../../socket-reminder");

// Check authentication - redirect to login if not authenticated
if (typeof Auth !== 'undefined' && !Auth.isAuthenticated()) {
    window.location.href = '/login.html';
}

var total = 5000;
var totalPanelItems = 0;
var url = window.location.origin;
var interval = '00:00', nextReminder = Date.now();

// Faz chamadas REST no servidor para buscar os dados
function sendGetRest(url, callback) {
    console.log(`[GET] ${url}`);

    fetch(url, {
        headers: {
            ...Auth.getAuthHeader()
        }
    })
        .then(response => {
            if (response.status === 401) {
                Auth.logout();
                return;
            }
            if (!response.ok) {
                throw new Error(`${response.status} (${response.statusText})`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                console.log('Resposta:', data);
                callback(null, data);
            }
        })
        .catch(err => {
            console.error('Erro no fetch:', err);
            callback(err, null);
        });
}

function sendHttpRest(path, method, data, callbackSuccess) {
    $.ajax({
        url: `${url}/${path}`,
        type: method,
        data: JSON.stringify(data),
        processData: false,
        contentType: "application/json; charset=UTF-8",
        headers: Auth.getAuthHeader(),
        beforeSend: function () {
            console.log(`Enviando transação para o servidor: [${method}] ${this.url}`);
            $("#processando")[0].style.visibility = 'visible';
        },
        success: function (data) {
            console.log(`Dados retornado da transação com o servidor: ${JSON.stringify(data)}`);
            if (callbackSuccess)
                callbackSuccess(data);
            $("#processando")[0].style.visibility = 'hidden';
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (xhr.status === 401) {
                Auth.logout();
                return;
            }
            console.log(`Ocorreu um erro na transação com o servidor: ${this.url}`);
            $("#processando")[0].style.visibility = 'hidden';
        }
    });
}

// Funcoes auxiliares
function pad(n) {
    return n < 10 ? '0' + n : n;
}

function getHMS(dateTime, seconds = true) {
    let strTime = `${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}`

    if (seconds)
        strTime += `:${pad(dateTime.getSeconds())}`

    return strTime;
}

function getHM(dateTime) {
    return getHMS(dateTime, false);
}


// DADOS DO PERFIL: Funcoes para exibir, obter e salvar os dados.
function showPerfil() {
    $("#conf").show();
    getPerfil();
}

let perfilNotExists = true;

function getPerfil() {
    let urlRest = `${url}/perfil/1`;

    sendGetRest(`${urlRest}`, function (error, data) {
        if (error) {
            $('#email').val('');
            $('#passwd').val('');
            $('#weight').val('');
            console.log(error);
            perfilNotExists = true;
        } else {
            $('#email').val(data.email);
            $('#passwd').val(data.passwd);
            $('#weight').val(data.weight);
            perfilNotExists = false;
        }
    });
}

function savePerfil() {
    const idValue = 1;
    const emailValue = $('#email').val();
    const passwdValue = $('#passwd').val();
    const weightValue = $('#weight').val();
    let data = { id: idValue, email: emailValue, passwd: passwdValue, weight: weightValue };

    let url = perfilNotExists ? `perfil` : `perfil/${idValue}`;
    let method = perfilNotExists ? "POST" : "PATCH";

    sendHttpRest(url, method, data);
    perfilNotExists = false;
}

function calculateTotalConsumption() {
    let qntByWeight = 35;
    $.getJSON(`${url}/perfil/1`, function (data) {
        total = qntByWeight * parseInt(data.weight);
    });
}

// DADOS DA NOTIFICACAO: Funcoes para exibir, obter e salvar os dados.
function showNotification() {
    $("#notification").show();

    getNotification();
}

let notificationNotExists = true;

function getNotification() {
    sendGetRest(`${url}/notification/1`, (error, data) => {
        if (error) {
            $('#start').val('');
            $('#end').val('');
            $('#interval').val('');
            console.error(error);
            notificationNotExists = true;
        } else {
            $('#start').val(data.start);
            $('#end').val(data.end);
            $('#interval').val(data.interval);
            notificationNotExists = false;
        }
    });
}

function saveNotification() {
    const idValue = 1;
    const startValue = $('#start').val();
    const endValue = $('#end').val();
    const intervalValue = $('#interval').val();
    let data = { id: idValue, start: startValue, end: endValue, interval: intervalValue };

    let url = notificationNotExists ? `notification` : `notification/${idValue}`
    let method = notificationNotExists ? "POST" : "PATCH";

    sendHttpRest(url, method, data);
}

// DADOS DE CONSUMO DE AGUA: Funcoes para exibir, obter e salvar os dados.
function clearPanelConsumption() {
    $('#listItem').empty();
    totalPanelItems = 0;
    updateStatusBar(0);
}

function showConsumption() {
    $("#divConsumption").show();
    $('#btnDay').addClass("active");
    clearPanelConsumption();
    getConsumption();
};

let consumptionNotExists = true;

function getConsumption() {
    let dateConsumption = $('#dateConsumption').val();
    let queryDate = dateConsumption ? `?date=${dateConsumption}` : "";

    sendGetRest(`${url}/water-consumption${queryDate}`, (error, data) => {
        if (error) {
            // Limpa painel de consumo
            // $('#listItem').empty();
            consumptionNotExists = true;
        } else {
            // Preenche os dados no painel de consumo
            data.forEach(item => {
                addItemPanel(item._id, $(`#${item.type}`).clone(), item.time.substring(0, 5));
                updateStatusBar(item.quantity);
            });

            consumptionNotExists = true;
        }
    });
}

function removeConsumption(id) {
    let _id = id.split('-')[1];
    sendHttpRest(`water-consumption/${_id}`, "DELETE", {});
}

function updateStatusBar(quantity) {
    if (quantity === 0) {
        $('#progress-bar').text();
        $('#progress-bar').css("width", 0);
        return;
    }

    let width = !$('#progress-bar')[0].style.width ? 0 : $('#progress-bar')[0].style.width;

    let percentNow = parseInt(width);
    let percentItem = Math.trunc((100 * quantity) / total);
    let percentTotal = percentNow + percentItem;

    let percentText = percentTotal + "%";

    $('#progress-bar').text(percentText);
    $('#progress-bar').css("width", percentText);
}

function addItemPanel(_id, item, time) {
    let component = item.find("figcaption");
    component.append(`<div><small>${time}</small></div>`);

    let id = item.attr('id');
    item.attr('id', `${id}-${_id}`);
    item.on('click', (e) => {
        let id = item.attr('id');

        $("#modal-edit").modal("show");
        $('#val-img')[0].src = item.find("img")[0].src;
        $('#val-quantity')[0].innerText = item.find("small")[0].innerText;
        $('#val-time')[0].innerText = time;
        $('#val-id')[0].innerText = id;
    });
    $('#listItem').append(item[0]);
}

function clickAddItem(item) {
    let consumption = {};
    let dateTime = new Date();
    let componentQuantity = item.find("small");
    let quantity = parseInt(componentQuantity[0].innerText);

    consumption.type = item.attr('id');
    consumption.quantity = quantity;
    consumption.time = getHMS(dateTime);
    consumption.date = $('#dateConsumption').val() ? $('#dateConsumption').val() : "";

    sendHttpRest("water-consumption", "POST", consumption, (data) => {
        addItemPanel(data._id, item, getHM(dateTime));
        updateStatusBar(quantity);
        socket.emit('resetreminder', '');
        console.log("Send reminder to server reset reminder: " + socket.id);
    });
}

function renderChart(data, labels) {
    let dateConsumption = $('#dateChart').val();
    let queryDate = dateConsumption ? `?date=${dateConsumption}` : "";

    $.getJSON(`${url}/water-consumption${queryDate}`, (data) => {
        const canvas = document.getElementById("myChart").getContext('2d');
        let labels = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
        let values = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        let hour = 0;
        let subtotal = 0;

        if (data) {
            data.forEach((item) => {
                subtotal += item.quantity;
                hour = parseInt(item.time.substring(0, 2));
                values[hour] = subtotal;
            })
        }

        value = 0;
        for (let index = 0; index < values.length; index++) {
            const v = values[index];
            if (v > value)
                value = v;
            values[index] = value;
        }
        // console.log(values);

        var myChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hoje',
                    data: values,
                }]
            },
            //HERE COMES THE AXIS Y LABEL
            options: {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'quantidade consumida em (ml)'
                        },
                        ticks: {
                            min: 0,
                            max: total,
                            stepSize: 200,
                        }
                    },]

                }
            }
        });
    });
}


function showChart() {
    $("#chart").show();
    $('#btnDay').removeClass("active");
    renderChart();
};


$(() => {

    $('#btn-ok').on('click', (e) => {
        $('#modal-edit').modal("hide");
    })

    $('#btn-remove').on('click', (e) => {
        $('#modal-edit').modal("hide");
    })

    $("#btnChart").on('click', e => {
        $("#divConsumption").hide();
        $("#conf").hide();
        $("#notification").hide();
        showChart();
    });
    $("#btnDay").on('click', e => {
        $("#chart").hide();
        $("#conf").hide();
        $("#notification").hide();
        showConsumption();
    });
    $("#mnPerfil").on('click', e => {
        $("#chart").hide();
        $("#divConsumption").hide();
        $("#notification").hide();
        showPerfil();
    });
    $("#mnNotification").on('click', e => {
        $("#chart").hide();
        $("#divConsumption").hide();
        $("#conf").hide();
        showNotification();
    });
    $('#dateConsumption').on('change', e => {
        clearPanelConsumption();
        getConsumption();
    })

    $('#dateChart').on('change', e => {
        renderChart();
    })

    $('#glass').on('click', (e) => {
        clickAddItem($('#glass').clone());
    })
    $('#bottle').on('click', (e) => {
        clickAddItem($('#bottle').clone());
    })
    $('#jar').on('click', (e) => {
        clickAddItem($('#jar').clone());
    })

    $("#btn-remove").on('click', (e) => {
        let id = $("#val-id")[0].innerHTML;

        removeConsumption(id);

        $(`#${id}`).remove();

        let value = parseInt($("#val-quantity")[0].innerHTML);
        updateStatusBar(-value);
    })

    showConsumption();

    calculateTotalConsumption();
})

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('dateConsumption');
    const chartInput = document.getElementById('dateChart');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    input.value = `${yyyy}-${mm}-${dd}`;
    chartInput.value = `${yyyy}-${mm}-${dd}`;

    document
        .getElementById('btnSalvar')
        .addEventListener('click', savePerfil);
    document
        .getElementById('btnSalvarNotificacao')
        .addEventListener('click', saveNotification);

    // Date picker navigation helpers
    function formatDateForInput(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function changeDate(inputId, days) {
        const input = document.getElementById(inputId);
        const currentDate = input.value ? new Date(input.value + 'T00:00:00') : new Date();
        currentDate.setDate(currentDate.getDate() + days);
        input.value = formatDateForInput(currentDate);
        $(input).trigger('change');
    }

    function setToday(inputId) {
        const input = document.getElementById(inputId);
        input.value = formatDateForInput(new Date());
        $(input).trigger('change');
    }

    // Consumption date navigation
    document.getElementById('consumptionPrevDay').addEventListener('click', () => changeDate('dateConsumption', -1));
    document.getElementById('consumptionNextDay').addEventListener('click', () => changeDate('dateConsumption', 1));
    document.getElementById('consumptionToday').addEventListener('click', () => setToday('dateConsumption'));

    // Chart date navigation
    document.getElementById('chartPrevDay').addEventListener('click', () => changeDate('dateChart', -1));
    document.getElementById('chartNextDay').addEventListener('click', () => changeDate('dateChart', 1));
    document.getElementById('chartToday').addEventListener('click', () => setToday('dateChart'));

    // Time preset buttons
    document.querySelectorAll('.time-presets').forEach(container => {
        container.querySelectorAll('.time-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = container.getAttribute('data-target');
                const time = btn.getAttribute('data-time');
                const input = document.getElementById(targetId);
                input.value = time;

                // Update active state
                container.querySelectorAll('.time-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update summary
                updateScheduleSummary();
            });
        });
    });

    // Interval preset buttons
    document.querySelectorAll('.interval-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const interval = btn.getAttribute('data-interval');
            document.getElementById('interval').value = interval;

            // Update active state
            document.querySelectorAll('.interval-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update summary
            updateScheduleSummary();
        });
    });

    // Update summary when inputs change manually
    document.getElementById('start').addEventListener('change', updateScheduleSummary);
    document.getElementById('end').addEventListener('change', updateScheduleSummary);

    // Update schedule summary display
    function updateScheduleSummary() {
        const start = document.getElementById('start').value || '08:00';
        const end = document.getElementById('end').value || '18:00';
        const interval = document.getElementById('interval').value || '00:30';

        document.getElementById('summaryStart').textContent = start;
        document.getElementById('summaryEnd').textContent = end;

        // Format interval for display
        const [hours, minutes] = interval.split(':').map(Number);
        let intervalText = '';
        if (hours > 0) {
            intervalText = hours === 1 ? '1 hora' : `${hours} horas`;
            if (minutes > 0) intervalText += ` e ${minutes} min`;
        } else {
            intervalText = `${minutes} minutos`;
        }
        document.getElementById('summaryInterval').textContent = intervalText;

        // Highlight active presets based on current values
        highlightActivePresets();
    }

    function highlightActivePresets() {
        const start = document.getElementById('start').value;
        const end = document.getElementById('end').value;
        const interval = document.getElementById('interval').value;

        // Start time presets
        document.querySelectorAll('[data-target="start"] .time-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-time') === start);
        });

        // End time presets
        document.querySelectorAll('[data-target="end"] .time-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-time') === end);
        });

        // Interval presets
        document.querySelectorAll('.interval-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-interval') === interval);
        });
    }

    // Initial summary update when notification data loads
    const originalGetNotification = window.getNotification;
    window.getNotification = function() {
        sendGetRest(`${url}/notification/1`, (error, data) => {
            if (error) {
                $('#start').val('08:00');
                $('#end').val('18:00');
                $('#interval').val('00:30');
                console.error(error);
                notificationNotExists = true;
            } else {
                $('#start').val(data.start);
                $('#end').val(data.end);
                $('#interval').val(data.interval);
                notificationNotExists = false;
            }
            updateScheduleSummary();
        });
    };

    // ========== PROFILE SECTION ENHANCEMENTS ==========

    // Password toggle visibility
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwd');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle icon
            const icon = togglePasswordBtn.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Weight preset buttons
    document.querySelectorAll('.weight-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const weight = btn.getAttribute('data-weight');
            document.getElementById('weight').value = weight;

            // Update active state
            document.querySelectorAll('.weight-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update profile summary
            updateProfileSummary();
        });
    });

    // Update summary when weight input changes manually
    const weightInput = document.getElementById('weight');
    if (weightInput) {
        weightInput.addEventListener('input', updateProfileSummary);
        weightInput.addEventListener('change', () => {
            updateProfileSummary();
            highlightActiveWeightPreset();
        });
    }

    // Update summary when email changes
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', updateProfileSummary);
    }

    // Update profile summary display
    function updateProfileSummary() {
        const email = document.getElementById('email').value || 'seu@email.com';
        const weight = parseInt(document.getElementById('weight').value) || 60;
        const waterGoal = weight * 35;

        document.getElementById('summaryEmail').textContent = email;
        document.getElementById('summaryWaterGoal').textContent = waterGoal + 'ml';
    }

    // Highlight active weight preset based on current value
    function highlightActiveWeightPreset() {
        const weight = document.getElementById('weight').value;
        document.querySelectorAll('.weight-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-weight') === weight);
        });
    }

    // Override getPerfil to update summary after loading
    const originalGetPerfil = window.getPerfil;
    window.getPerfil = function() {
        let urlRest = `${url}/perfil/1`;

        sendGetRest(`${urlRest}`, function (error, data) {
            if (error) {
                $('#email').val('');
                $('#passwd').val('');
                $('#weight').val('');
                console.log(error);
                perfilNotExists = true;
            } else {
                $('#email').val(data.email);
                $('#passwd').val(data.passwd);
                $('#weight').val(data.weight);
                perfilNotExists = false;
            }
            updateProfileSummary();
            highlightActiveWeightPreset();
        });
    };
});