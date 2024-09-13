$(document).ready(function () {
    const url = "http://ajax1.lmsoft.cz/procedure.php";
    const username = "coffe";
    const password = "kafe";

    function sendRequest(endpoint, data, method, callback) {
        $.ajax({
            url: `${url}?cmd=${endpoint}`,
            type: method,
            data: data,
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password)
            },
            beforeSend: function () {
                $('#loader').show();
            },
            complete: function () {
                $('#loader').hide();
            },
            success: function (response) {
                callback(response);
            },
            error: function () {
                alert(error);
            }
        });
    }

    function loadPeopleList() {
        sendRequest('getPeopleList', {}, 'GET', function (data) {
            let peopleList = '';
            $.each(data, function (key, person) {
                peopleList += `
                    <div class="form-check">
                        <input type="radio" name="user" id="person${person.ID}" value="${person.ID}" required>
                        <label for="person${person.ID}">${person.name}</label>
                    </div>
                `;
            });
            $('#people-list-container').html(peopleList);
        });
    }

    function loadDrinkTypes() {
        sendRequest('getTypesList', {}, 'GET', function (data) {
            let drinkTypes = '';
            $.each(data, function (key,drink) {
                drinkTypes += `
                    <div class="slider-container">
                        <label class="slider-label" for="drink${drink.ID}">${drink.typ}</label>
                        <input class="drink-slider" type="range" id="drink${drink.ID}" name="type[]" min="0" max="10" value="0">
                        <span class="slider-value" id="slider-value${drink.ID}">0</span>
                    </div>
                `;
            });
            $('#drink-list-container').html(drinkTypes);
    
            $('.drink-slider').on('input', function () {
                let rangeValue = $(this).val();
                let relatedInput = $(this).siblings('.slider-value');
                console.log(relatedInput)
                relatedInput.text(rangeValue)
            });
    
        });
    }

    $('#coffee-form').on('submit', function (e) {
        e.preventDefault();
        let formData = $(this).serialize();

        sendRequest('saveDrinks', formData, 'POST', function (response) {
            if (response.msg === -1) {
                alert('error', 'Chyba při odesílání dat.');
            } else if (response.msg === 1) { 
                alert('success', 'Úspěšně odesláno!');
            } else {
                alert('error', 'Neznámá odpověď ze serveru.');
            }
        });
    });


    $('#toggleResults').on('click', function () {
        let resultsDiv = $('#results');
        if (resultsDiv.is(':visible')) {
            resultsDiv.hide();
            $(this).text('Zobrazit výsledky');
        } else {
            let month = $("#month-selector").val();
            console.log(month + " month")
            sendRequest('getSummaryOfDrinks&month='+month, {}, 'GET', function (data) {
                let resultHtml = '<h4>Výsledky:</h4><ul class="list-group">';
                console.log(data)
                $.each(data, function (key, entry) {
                    resultHtml += `<li class="list-group-item">${entry[2]} vypil ${entry[1]}x ${entry[0]}</li>`;
                });
                resultHtml += '</ul>';
                $('#results').html(resultHtml);
            });
            resultsDiv.show();
            $(this).text('Skrýt výsledky');
        }
    });

    loadPeopleList();
    loadDrinkTypes();
});
