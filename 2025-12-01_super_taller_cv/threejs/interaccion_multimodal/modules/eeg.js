export const eegState = {
    alpha: 10,
    beta: 50,
    gamma: 10
};

let onUpdate = null;

export function initEEG(callback) {
    onUpdate = callback;

    const sliders = ['alpha', 'beta', 'gamma'];

    sliders.forEach(type => {
        const slider = document.getElementById(`slider-${type}`);
        const display = document.getElementById(`val-${type}`);

        // Set inicial
        display.innerText = slider.value;
        eegState[type] = parseInt(slider.value);

        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            eegState[type] = val;
            display.innerText = val;
            if(onUpdate) onUpdate(eegState);
        });
    });
}