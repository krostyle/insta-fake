//Declaración de variables Iniciales
const ls = localStorage;
const iniciarSesion = document.getElementById('iniciar-sesion');
const modalIniciarSesion = document.getElementById('modal-iniciar-sesion')
let cont = 1;



iniciarSesion.addEventListener('click', (e) => {
    e.preventDefault();
    modalIniciarSesion.innerHTML = /*HTML */
        `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header ">
                    <h5 class="modal-title text-center" id="exampleModalLabel">Casos Covid 19</h5>
                    <i class="fa fa-virus fa-3x px-2"></i>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row justify-content-center align-items-center p-5 m-5">
                        <div class="col-12 d-block">
                            <form id="form-login" class="needs-validation" novalidate>
                                <div class="form-group py-2">
                                    <label>Email address</label>
                                    <input type="email" class="form-control" aria-describedby="emailHelp" id="email" required>
                                </div>
                                <div class="form-group py-2">
                                    <label>Password</label>
                                    <input type="password" class="form-control" id="password" required>
                                </div>
                                <div class="py-5 text-center">
                                    <button type="submit" class="btn btn-primary" id="btn-login" data-bs-dismiss="">Iniciar Sesión</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>`

    //Función que valida el formulario, extraída directamente desde BS5
    const validate = function() {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function(form) {
                form.addEventListener('submit', function(event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    }

                    form.classList.add('was-validated')
                }, false)
            })
    }
    validate();

    // const btnIniciarSesion = document.getElementById('btn-login')
    const formLogin = document.getElementById('form-login')
    formLogin.addEventListener('submit', async(e) => {
        e.preventDefault();
        const email = document.getElementById('email');
        const password = document.getElementById('password')
        const JWT = await getToken(email.value, password.value);
        if (JWT) {
            $(modalIniciarSesion).modal('hide')
            Swal.fire({
                icon: 'success',
                title: 'Iniciaste Sesión Correctamente',
                showConfirmButton: false,
                timer: 1500
            })
            updateNavbar(JWT, 'Situación Chile', 'situacion-chile')
        } else {
            $(modalIniciarSesion).modal('hide')
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Usuario o Contraseña Incorrecta',
            })
        }
    })




})

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
        if (token) {
            ls.clear();
            ls.setItem('jwt-token-covid', token)
            return token
        } else {
            return false
        }
    } catch (error) {
        console.error(error);
        console.log('Usuario o Contraseña Incorrecta');
    }
}

//Función para obtener la Data, Se utiliza para aquellos casos donde hay problemas en la API
const getDataApiError = async() => {
    try {
        const urlPost = `http://localhost:3000/api/total`
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer`
            }
        })
        const { data } = await response.json();
        return data
    } catch (error) {
        console.error(error);
    }
}

//Función para obtener la Data
const getData = async() => {
    try {
        Swal.fire({
            title: 'Cargando...',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
        });
        swal.showLoading();
        const urlPost = `http://localhost:3000/api/total`
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer`
            }
        })
        const { data } = await response.json();
        const filters = filter(data)
        createMainChart(filters)
        createTable(data)

        const tableMain = document.getElementById("table")
            //Para agregar Listener solo una vez
        if (cont === 1) {
            tableMain.addEventListener('click', (e) => {
                if (e.target.tagName === "BUTTON") {
                    const id = e.srcElement.attributes['id'].value
                    createModal(id)
                    return;
                }
            })
        }
        cont++
        swal.close();
    } catch (error) {
        console.error(error);
    }
}
getData();

//Función para filtrar aquellos paises con más de 10000 casos activos.
const filter = (data) => {
    const filtrados = data.filter(pais => pais.active >= 10000)
    return filtrados;
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
            },
            title: {
                display: true,
                text: 'Casos por País'
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

//Función para crear modal, recibe el nombre del pais para luego crear un grafico con los datos de dicho pais
const createModal = async(nombrePais) => {
    try {
        Swal.fire({
            title: 'Cargando...',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
        });
        swal.showLoading();
        const urlPost = `http://localhost:3000/api/countries/${nombrePais}`
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer`
            }
        })
        let { data } = await response.json();
        const flag = JSON.stringify(data) === JSON.stringify({})
        if (flag) {
            const paises = await getDataApiError();
            data = paises.find(p => p.location === nombrePais)
        }
        const modalChart = document.getElementById('modal-chart')
        modalChart.innerHTML = ""
        const modal = /*HTML */
            ` <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">${data.location}</h5>
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
        createModalChart(data)
        swal.close();
    } catch (error) {
        console.error(error)
    }
}


const updateNavbar = (JWT, text, id) => {
    const navbar = document.getElementById('navbar')
    navbar.innerHTML = /*HTML */
        `<div class="container-fluid">
        <a class="navbar-brand" href="#">Covid 19</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" id="${id}" aria-current="page" href="#">${text}</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" id="cerrar-sesion" aria-current="page" href="#">Cerrar Sesión</a>
                </li>
            </ul>
        </div>
    </div>`;

    const cerrarSesion = document.getElementById('cerrar-sesion');
    cerrarSesion.addEventListener('click', (e) => {
        Swal.fire({
            icon: 'info',
            title: 'Cerraste Sesión Correctamente',
            showConfirmButton: false,
            timer: 1500
        })
        ls.clear();
        createNavbar();
        getData();

    })

    const situacion = document.getElementById(`${id}`);
    situacion.addEventListener('click', async(e) => {
        if (id === 'situacion-chile') {
            await getDataChile(JWT);
            updateNavbar(JWT, 'Situación Por País', 'situacion-pais')
        } else {
            getData();
            updateNavbar(JWT, 'Situación Chile', 'situacion-chile')
        }


    })
}


const createNavbar = () => {
    const navbar = document.getElementById('navbar')
    navbar.innerHTML = /*HTML */
        `<div class="container-fluid">
        <a class="navbar-brand" href="#">Covid 19</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="#">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" id="iniciar-sesion" aria-current="page" href="#" data-bs-toggle="modal" data-bs-target="#modal-iniciar-sesion">Iniciar Sesión</a>
                </li>
            </ul>
        </div>
    </div>`;
}



const getDataChile = async(jwt) => {
    try {
        Swal.fire({
            title: 'Cargando...',
            showLoaderOnConfirm: true,
            allowOutsideClick: false
        });
        swal.showLoading();

        const urlPost1 = `http://localhost:3000/api/confirmed`
        const urlPost2 = `http://localhost:3000/api/deaths`
        const urlPost3 = `http://localhost:3000/api/recovered`
        const response1 = await fetch(urlPost1, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const response2 = await fetch(urlPost2, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const response3 = await fetch(urlPost3, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })

        const data1 = await response1.json();
        const data2 = await response2.json();
        const data3 = await response3.json();

        const confirmados = data1.data
        const muertes = data2.data
        const recuperados = data3.data
        createChartChile(confirmados, muertes, recuperados)
        deleteSection('table')
        swal.close();
    } catch (error) {
        console.error(error);
    }
}


const createChartChile = (confirmed, deaths, recovered) => {
    const fechas = []
    const confirmados = []
    const muertes = []
    const recuperados = []
    confirmed.forEach(e => {
        fechas.push(e.date)
        confirmados.push(e.total)
    })
    deaths.forEach(e => {
        muertes.push(e.total)
    })
    recovered.forEach(e => {
        recuperados.push(e.total)
    })

    const divCanvas = document.getElementById('chart');
    divCanvas.innerHTML = `<canvas id="myChart" width="400" height="400"></canvas>`;
    const ctx = document.getElementById('myChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                    label: "Confirmados",
                    data: confirmados,
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: "Recuperados",
                    data: recuperados,
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1
                },
                {
                    label: "Muertes",
                    data: muertes,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Casos Chile'
                }
            }
        },
    })
}