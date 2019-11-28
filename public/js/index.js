const $nameForm = document.querySelector('#name-form')
const $freeTables = document.querySelector('#available-tables')
const $reservationButton = document.querySelector('#reservation-button')
const $availabilityButton = document.querySelector('#check-availability')

let vacantTables;

$availabilityButton.addEventListener('click', () => {
    fetch('/reservations').then((response) => {
        response.json().then((data) => {
            vacantTables = data.vacantTables
            const freedTables = data.freedTables

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
    }).catch((err) => {
        throw new Error(err)
    })
})

$reservationButton.addEventListener('click', () => {
    const user = $nameForm.value
    $nameForm.value = ''
    if (!user) {
        return
    }
    fetch('/reservations/' + user).then((response) => {
        response.json().then((data) => {
            vacantTables = data.vacantTables
            alert('Reservation for ' + data.user + ' created')
            $freeTables.innerHTML = `Available tables: ${vacantTables}`
            if (vacantTables === 0) {
                $reservationButton.disabled = true
                $nameForm.disabled = true
                $availabilityButton.disabled = false
            }
        })
    }).catch((error) => {
        throw new Error(error)
    })
})