export function showSection(id) {
    document.querySelectorAll('.section').forEach((section) => {
        if (section.id !== id)
            section.style.display = 'none'
        else section.style.display = 'block'
    })
}