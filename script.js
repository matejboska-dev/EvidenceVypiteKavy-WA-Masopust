$(document).ready(function () {
    const apiUrl = "http://ajax1.lmsoft.cz/procedure.php";
    const username = "coffe";
    const password = "kafe";

    function sendRequest(endpoint, data, method = 'POST', callback) {
        $.ajax({
            url: `${apiUrl}?cmd=${endpoint}`,
            type: method,
            data: data,
            headers: {
                "Authorization": "Basic " + btoa(username + ":" + password),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            beforeSend: function () {
                $('#loader').show();
            },
            complete: function () {
                $('#loader').hide();
            },
            success: function (response) {
                console.log("Server response:", response);  // Debugging
                callback(response);
            },
            error: function (xhr, status, error) {
                // chybove zpravy, pokus o debugging :D, nevim co je spatne
                console.error("AJAX error status:", status);
                console.error("AJAX error details:", error);
                console.error("XHR response:", xhr.responseText);
                displayFeedback('error', 'Chyba při odesílání dat.');
            }
        });
    }

    function displayFeedback(type, message) {
        const feedbackDiv = $('#feedback');
        feedbackDiv.removeClass('alert-success alert-danger');
        feedbackDiv.addClass(type === 'success' ? 'alert-success' : 'alert-danger');
        feedbackDiv.text(message).fadeIn().delay(3000).fadeOut();
    }

    function showSuccessOverlay() {
        $('#successOverlay').fadeIn();
        setTimeout(function() {
            $('#successOverlay').fadeOut();
        }, 2000);
    }

    function loadPeopleList() {
        sendRequest('getPeopleList', {}, 'GET', function (data) {
            let peopleList = '';
            $.each(data, function (key, person) {
                peopleList += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="person" id="person${person.ID}" value="${person.ID}" required>
                        <label class="form-check-label" for="person${person.ID}">${person.name}</label>
                    </div>
                `;
            });
            $('#peopleList').html(peopleList);
        });
    }

    function loadDrinkTypes() {
        sendRequest('getTypesList', {}, 'GET', function (data) {
            let drinkTypes = '';
            $.each(data, function (key, drink) {
                drinkTypes += `
                    <div class="form-group d-flex justify-content-between align-items-center">
                        <label for="drink${drink.ID}" class="mr-3">${drink.typ}</label>
                        <input type="range" class="form-control-range drink-slider" id="drink${drink.ID}" name="drink${drink.ID}" min="0" max="10" value="0">
                        <input type="number" min="0" max="10" class="form-control range-value-input" id="inputDrink${drink.ID}" value="0" style="width: 60px; margin-left: 10px;">
                    </div>
                `;
            });
            $('#drinkTypes').html(drinkTypes);

            $('.drink-slider').on('input', function () {
                let rangeValue = $(this).val();
                let relatedInput = $(this).siblings('input[type="number"]');
                relatedInput.val(rangeValue);
            });

            $('.range-value-input').on('input', function () {
                let inputValue = $(this).val();
                let relatedSlider = $(this).siblings('.drink-slider');
                relatedSlider.val(inputValue);
            });
        });
    }

    function validateForm() {
        const selectedPerson = $('input[name="person"]:checked').val();
        if (!selectedPerson) {
            displayFeedback('error', 'Musíte vybrat osobu.');
            return false;
        }

        let drinksSelected = false;
        $('#drinkTypes input[type="range"]').each(function () {
            if ($(this).val() > 0) {
                drinksSelected = true;
            }
        });

        if (!drinksSelected) {
            displayFeedback('error', 'Musíte zadat alespoň jeden nápoj.');
            return false;
        }

        return true;
    }

    $('#coffeeForm').on('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        let formData = {};
        formData.person = $('input[name="person"]:checked').val();

        $('#drinkTypes input[type="range"]').each(function () {
            const drinkID = $(this).attr('id').replace('drink', '');
            formData[`drink${drinkID}`] = $(this).val();
        });

        const formUrlEncodedData = $.param(formData);

        sendRequest('saveDrinks', formUrlEncodedData, 'POST', function (response) {
            if (response.msg === -1) {
                displayFeedback('error', 'Chyba při odesílání dat.');
            } else if (response.msg === 1) {
                displayFeedback('success', 'Úspěšně odesláno!');
                $('#coffeeForm')[0].reset();
                $('#peopleList input[type="radio"]').prop('checked', false);
                $('#drinkTypes input[type="range"]').val(0);
                $('#drinkTypes input[type="number"]').val(0);
                showSuccessOverlay();
            } else {
                displayFeedback('error', 'Neznámá odpověď ze serveru.');
            }
        });
    });

    $('#toggleResults').on('click', function () {
        let resultsDiv = $('#results');
        if (resultsDiv.is(':visible')) {
            resultsDiv.hide();
            $(this).text('Zobrazit výsledky');
        } else {
            sendRequest('getSummaryOfDrinks', {}, 'GET', function (data) {
                let resultHtml = '<h4>Výsledky:</h4><ul class="list-group">';
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
