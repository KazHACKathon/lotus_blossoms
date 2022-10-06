const getState = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { cmd: "getState" },
            response => {
                if (response) {
                    resolve(response.state)
                } else {
                    reject(`Cannot resolve status`)
                }
            }
        )
    })
}
const inputKeyUpEventHandler = async (i, c, b) => {

    if (await getState() === true) {

        if ((i.value && !i.hasAttribute('defaultValue')) || (i.value && i.hasAttribute('defaultValue') && (i.value !== i.defaultValue))) {
            const strength = calculate(i.value)
            const balloon_text = b.querySelector('.password-checker__balloon-text')
            let strengthText = ''


            c.style.visibility = 'visible'

            if (5 == strength) {
                strengthText = 'Are you from Pentagon?'
                c.className = `password-checker__icon ${'verystrong'}`
            } else if (4 == strength) {
                strengthText = 'FBI will be jealous'
                c.className = `password-checker__icon ${'strong'}`
            } else if (3 == strength) {
                strengthText = 'the same as my grandma`s'
                c.className = `password-checker__icon ${'good'}`
            } else if (2 == strength) {
                strengthText = 'Not bad password for under 5 years old'
                c.className = `password-checker__icon ${'weak'}`
            } else {
                strengthText = 'Do you care about your data'
                c.className = `password-checker__icon ${'veryweak'}`
            }

            // appending to balloon 
            balloon_text.innerHTML = ''
            balloon_text.appendChild(document.createTextNode(strengthText))
        } else {
            c.style.visibility = 'hidden'
            b.style.display = 'none'
            c.className = `password-checker__icon`
        }
    }
}

const iconClickEventHandler = b => {
    if (window.getComputedStyle(b).display === 'none') {
        b.style.display = 'block'
    } else {
        b.style.display = 'none'
    }
}

const destroyContainers = () => {
    const containers = document.getElementsByClassName('password-checker')

    while (containers.length > 0) {
        containers[0].parentNode.removeChild(containers[0]);
    }
}

const constructContainers = () => {
    const inputs = document.getElementsByTagName("input")

    // Starting search from inputs
    for (let o = 0; o < inputs.length; o++) {

        // If find type is password
        if (inputs[o].type.toLowerCase() === "password") {
            const i = inputs[o]
            const ipos = i.getBoundingClientRect()
            const pc = document.createElement('div')
            const pc_icon = document.createElement('div')
            const pc_balloon = document.createElement('div')
            const pc_balloon_arrow = document.createElement('div')
            const pc_balloon_text = document.createElement('div')

            // Creating a container

            // Creating an icon
            pc.className = `password-checker`
            pc_icon.className = `password-checker__icon`
            pc_icon.style.cssText = (`
				top: calc(3px + ${window.getComputedStyle(i).getPropertyValue('margin-top')}) !important;
				left: 3px !important;
				height: calc(${ipos.bottom}px - ${ipos.top}px - 6px) !important;
			`)
            i.parentNode.insertBefore(pc, i)
            pc.appendChild(pc_icon)

            // Creating a balloon
            pc_balloon.className = 'password-checker__balloon'
            pc_balloon_arrow.className = 'password-checker__balloon-arrow'
            pc_balloon_text.className = 'password-checker__balloon-text'
            pc_balloon_arrow.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 3px) !important;
				left: -2px !important;
			`)
            pc_balloon_text.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 13px) !important;
				left: -10px !important;
			`)
            pc_balloon.appendChild(pc_balloon_arrow)
            pc_balloon.appendChild(pc_balloon_text)
            pc.appendChild(pc_balloon)

            // return to initial case
            inputKeyUpEventHandler(i, pc_icon, pc_balloon)

            // Listener for changing 
            i.addEventListener('keyup', inputKeyUpEventHandler.bind(null, i, pc_icon, pc_balloon))
            pc_icon.addEventListener('click', iconClickEventHandler.bind(null, pc_balloon))
        }
    }
}
chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.cmd === 'setState') {
            if (request.state === true) {
                constructContainers()
            } else {
                destroyContainers()
            }
        }
    }
)
function calculate(password) {
    let strengthValue = {
        'caps': false,
        'length': false,
        'special': false,
        'numbers': false,
        'small': false
    };
    if (password.length >= 8) {
        strengthValue.length = true;
    } else {
        return 0
    }
    for (let index = 0; index < password.length; index++) {
        let char = password.charCodeAt(index);
        if (!strengthValue.caps && char >= 65 && char <= 90) {
            strengthValue.caps = true;
        } else if (!strengthValue.numbers && char >= 48 && char <= 57) {
            strengthValue.numbers = true;
        } else if (!strengthValue.small && char >= 97 && char <= 122) {
            strengthValue.small = true;
        } else if (!strengthValue.numbers && char >= 48 && char <= 57) {
            strengthValue.numbers = true;
        } else if (!strengthValue.special && (char >= 33 && char <= 47) || (char >= 58 && char <= 64)) {
            strengthValue.special = true;
        }
    }
    let strengthIndicator = 0;
    for (let metric in strengthValue) {
        if (strengthValue[metric] === true) {
            strengthIndicator++;
        }
    }
    return strengthIndicator
}
window.onload = async () => {

    // if switcher is true
    if (await getState() === true) {
        constructContainers()
    }
}
