const $nameForm = document.querySelector('#name-form')
const $freeTables = document.querySelector('#available-tables')
const $reservationButton = document.querySelector('#reservation-button')
const $availabilityButton = document.querySelector('#check-availability')

let vacantTables;

$availabilityButton.addEventListener('click', async() => {
    let result
    try {

        let response = await fetch('/reservations')
        result = await response.json()
    } catch (error) {
        throw new Error(error)
    }

    vacantTables = result.vacantTables
    const freedTables = result.freedTables

    $freeTables.innerHTML = `Available tables: ${vacantTables}`
    if (vacantTables > 0) {
        $reservationButton.disabled = false
        $nameForm.disabled = false

        $availabilityButton.disabled = true

    } else {
        alert('All tables are taken, try again next time.')
    }
    if (freedTables > 0) {
        alert(`${freedTables} tables are no longer reserved`)
    }
})

$reservationButton.addEventListener('click', async() => {
    let result
    const user = $nameForm.value
    $nameForm.value = ''
    if (!user) {
        return
    }
    try {
        let response = await fetch('/reservations/' + user, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: user
        })
        result = await response.json()
    } catch (error) {
        throw new Error(error)
    }
    vacantTables = result.vacantTables
    alert('Reservation for ' + result.user + ' created')
    $freeTables.innerHTML = `Available tables: ${vacantTables}`
    if (vacantTables === 0) {
        $reservationButton.disabled = true
        $nameForm.disabled = true
        $availabilityButton.disabled = false
    }
})