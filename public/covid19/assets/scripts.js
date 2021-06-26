const ls = localStorage;

const formLogin = document.getElementById('form-login');
const table = document.getElementById("table");
formLogin.addEventListener('submit', async(e) => {
    e.preventDefault()
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
    const JWT = await getToken(email, password);
    await getData(JWT);

})




//Función para mostrar o ocultar secciones , recibe como parámetro el id del elemento a ocultar
const showHideSection = (section) => {
    const hide = document.getElementById(section)
    if (hide.style.display === 'none') {
        hide.style.display = 'block'
    } else {
        hide.style.display = 'none'
    }
}


const deleteSection = (section) => {
    const del = document.getElementById(section)
    del.innerHTML = ""
}

//Función para obtener token  y en caso de existir se guarda en el local storage
const getToken = async(email, password) => {
    try {
        const urlLogin = "http://localhost:3000/api/login"
        const response = await fetch(urlLogin, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
        const { token } = await response.json();
        ls.clear();
        ls.setItem('jwt-token-covid', token)
    } catch (error) {
        console.error(error);
        console.log('Usuario o Contraseña Incorrecta');
    }
}

//Función para obtener la Data
const getData = async(jwt) => {
    try {
        const urlPost = `http://localhost:3000/api/total`
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { data } = await response.json();
        showHideSection('login');
        createNav();
        const filters = filter(data)
        createTable(data)
        table.addEventListener('click', (e) => {
            if (e.target.tagName === "BUTTON") {
                const id = e.srcElement.attributes['id'].value
                createModal(data, id)
            }
        })
        createMainChart(filters)
    } catch (error) {
        console.error(error);
    }
}

//Función para filtrar aquellos paises con más de 10000 casos activos.
const filter = (data) => {
    const filtrados = data.filter(pais => pais.active >= 10000)
    return filtrados;
}


//Función para crear navbar
const createNav = () => {
    const nav = document.getElementById('navbar')
    nav.setAttribute('class', 'navbar navbar-dark bg-dark navbar-expand-lg')
    nav.innerHTML =
        /*HTML */
        `<div class="container-fluid">
    <a class="navbar-brand" href="#">Covid 19</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse d-flex" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
        <a class="nav-link active" id="cerrar-sesion" aria-current="page" href="#">Cerrar Sesión</a>
      </li>
      </ul>
    </div>
  </div>`

    //Cerrar sesión
    const cerrarSesion = document.getElementById('cerrar-sesion')
    cerrarSesion.addEventListener('click', (e) => {
        ls.clear();
        showHideSection('login')
        deleteSection('chart')
        deleteSection('navbar')
        deleteSection('table')
    })

}


//Función para crear el gráfico
const createMainChart = (countries) => {
    const divCanvas = document.getElementById('chart');
    divCanvas.innerHTML = `<canvas id="myChart" width="400" height="400"></canvas>`;
    const ctx = document.getElementById('myChart').getContext('2d');
    const locations = []
    const muertes = []
    const actives = []
    const confirmados = []
    const recuperados = []
    countries.forEach(country => {
        actives.push(country.active)
        confirmados.push(country.confirmed)
        muertes.push(country.deaths)
        locations.push(country.location)
        recuperados.push(country.recovered)
    })
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locations,
            datasets: [{
                    label: "Activos",
                    data: actives,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: "Confirmados",
                    data: confirmados,
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: "Muertos",
                    data: muertes,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: "Recuperados",
                    data: recuperados,
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.2)',
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })
}

//Funcion para crear grafico dentro del modal , recibe como parametro el pais
const createModalChart = (pais) => {
    const { active, confirmed, location, deaths, recovered } = pais
    const ctx = document.getElementById('modalChartCountry').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Casos Activos', 'Casos Confirmados', 'Muertos', 'Recuperados'],
            datasets: [{
                label: "Activos",
                data: [active, confirmed, deaths, recovered],
                backgroundColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
            }],
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: location
                    }
                }
            }
        }
    })
}

//Función para crear tabla
const createTable = (data) => {
    const tableMain = document.getElementById("table")
    tableMain.innerHTML = ""
    tableMain.innerHTML = /*HTML */
        `
    <thead>
    <tr>
        <th scope="col">País</th>
        <th scope="col">Confirmados</th>
        <th scope="col">Muertes</th>
        <th scope="col">Recuperados</th>
        <th scope="col">Activos</th>
        <th scope="col">Detalles</th>
    </tr>
    </thead>
        <tbody id="table-covid-pais">
        </tbody>
    `
    const tableBody = document.getElementById('table-covid-pais')
    data.forEach(e => {
        tableBody.innerHTML +=
            /*HTML */
            `
            <tr>
            <td scope="col">${e.location}</td>
            <td scope="col">${e.confirmed}</td>
            <td scope="col">${e.deaths}</td>
            <td scope="col">${e.recovered}</td>
            <td scope="col">${e.active}</td>
            <td scope="col"><button class="btn btn-primary" id="${e.location}" data-bs-toggle="modal" data-bs-target="#modal-chart">Ver detalle</button></td>
            </tr>
            `
    });
    document.getElementById('table').style.display = "table";

}

//Función para crear moda, recibe toda la data y el nombre del pais para luego crear un grafico con los datos de dicho pais
const createModal = (data, nombrePais) => {
    const pais = data.find(p => p.location === nombrePais)
    const modalChart = document.getElementById('modal-chart')
    modalChart.innerHTML = ""
    const modal = /*HTML */
        ` <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">${nombrePais}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <canvas id="modalChartCountry" width="400" height="400"></canvas>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        </div>
    </div>`
    modalChart.innerHTML = modal
    createModalChart(pais)
}


const login = (async() => {

    const jwt = localStorage.getItem('jwt-token-covid');
    if (jwt) {
        getData(jwt);
    }
})();