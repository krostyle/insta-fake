const form = document.getElementById('form')
let contador = 1
form.addEventListener('submit', async(e) => {
    e.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
    const JWT = await postData(email, password);
    contador = 1
    await getPhotos(JWT, contador);
})



const postData = async(email, password) => {
    try {
        const urlLogin = "http://localhost:3000/api/login"
        const response = await fetch(urlLogin, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
        const { token } = await response.json();
        localStorage.setItem('jwt-token', token)
        return token
    } catch (error) {
        console.error(error);
        console.log('Usuario o Contraseña Incorrecta');
    }
}



const getPhotos = async(jwt, numpage = 1) => {
    try {
        const urlPost = `http://localhost:3000/api/photos?page=${numpage}`
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { data } = await response.json();
        if (contador === 1) {
            createBtnCerrarSesion();
            createBtnShowMore();
            hideSection('form')
        }
        createTable(data);
        contador++;
    } catch (error) {
        localStorage.clear();
        console.error(error);
    }

}

const hideSection = (section) => {
    const hide = document.getElementById(section)
    if (hide.style.display === "none") {
        hide.style.display = 'block'
    } else {
        hide.style.display = "none"
    }

}

const createTable = (data) => {
    const divTable = document.getElementById('js-table-wrapper')
    divTable.style.display = 'block'
    const table = document.getElementById('table-photos').getElementsByTagName('tbody')[0]
    if (contador === 1) {
        table.innerHTML = ''
        data.forEach(e => {
            table.innerHTML += /*HTML */
                `
            <tr>
            <td>${e.author}</td>
            <td><img src="${e.download_url}" class="img-fluid"></td>
          </tr>
            `
        })
    } else {
        data.forEach(e => {
            table.innerHTML += /*HTML */
                `
            <tr>
            <td>${e.author}</td>
            <td><img src="${e.download_url}" class="img-fluid"></td>
          </tr>
            `
        })
    }
}

const createBtnCerrarSesion = () => {
    const btn = document.getElementById('div-cerrar-sesion')
    btn.innerHTML = ""
    btn.innerHTML =
        /*HTML */
        `
    <button id="btn-cerrar-sesion" type="button" class="btn btn-danger">Cerrar Sesión</button>
    `
    btn.style.display = "block"
    const cerrarSesion = document.getElementById('btn-cerrar-sesion')
    cerrarSesion.addEventListener('click', e => {
        e.preventDefault();
        hideSection('mostrarMas')
        hideSection('js-table-wrapper')
        hideSection('div-cerrar-sesion')
            //hideSection('btn-cerrar-sesion')
        hideSection('form')
        localStorage.clear();
    })

}


const createBtnShowMore = () => {
    const mostrarMas = document.getElementById('mostrarMas')
    mostrarMas.innerHTML = ""
    mostrarMas.style.display = "block"
    mostrarMas.innerHTML += /*HTML*/
        `
    <button id="show-more" type="button" class="btn btn-primary">Mostrar más</button>
    `
    const showMore = document.getElementById('show-more');
    const jwt = localStorage.getItem('jwt-token')
    showMore.addEventListener('click', (e) => {
        e.preventDefault();
        getPhotos(jwt, contador)
    })
}


const login = (async() => {
    const jwt = localStorage.getItem('jwt-token');
    if (jwt) {
        getPhotos(jwt, 1);
    }
})();