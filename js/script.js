const showRequiredCategory = event => {
    const getID = event.id
    const links = document.querySelectorAll('.project-category button')
    for (i = 0; i < links.length; i++) {
        if (links[i].hasAttribute('class')){
            links[i].classList.remove('active')
        }
    }

    event.classList.add('active')
    const getCategory = document.querySelector(`.category-${getID}`)
    const categories = document.querySelectorAll('div[class ^= "category-"]')
    for (i = 0; i < categories.length; i++) {
        if (categories[i].hasAttribute('class')){
            categories[i].classList.remove('showCategory')
            categories[i].classList.add('hideCategory')
        }
    }

    getCategory.classList.remove('hideCategory')
    getCategory.classList.add('showCategory')
}
