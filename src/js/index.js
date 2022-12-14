const generatePassword = len => {
    // generator password
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";
    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
        password += chars[array[i] % chars.length];
    }
    return password;
}
const passwordRegenerateClickHandler = () => {
    const generatorInput = document.getElementById('password-generator-input')
    const lengthInput = document.getElementById('password-length')
    const lengthText = document.getElementById('password-length-text')

    generatorInput.value = generatePassword(lengthInput.value)

    try {
        localStorage.setItem('password_length', JSON.stringify(lengthInput.value))
    } catch (e) {
        console.error(e)
    }

    lengthText.innerHTML = lengthInput.value
}


window.onload = () => {
    const checkSwitcher = document.getElementById('password-check')
    const lengthInput = document.getElementById('password-length')
    const regenerateButton = document.getElementById('password-regenerate')

    try {
        checkSwitcher.checked = (n = JSON.parse(localStorage.getItem('password_checker'))) ? n : false
        lengthInput.value = (n = JSON.parse(localStorage.getItem('password_length'))) ? n : 16
    } catch (e) {
        checkSwitcher.checked = false
        lengthInput.value = 16
        console.error(e)
    }

    // handle and save to local storage of switcher
    checkSwitcher.addEventListener('change', e => {
        const state = e.target.checked

        try {
            localStorage.setItem('password_checker', JSON.stringify(state))
        } catch (e) {
            console.error(e)
        }

        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: "setState", state });
        })
    })
    passwordRegenerateClickHandler()

    regenerateButton.addEventListener('click', passwordRegenerateClickHandler.bind(null))
    lengthInput.addEventListener('input', passwordRegenerateClickHandler.bind(null))
}

