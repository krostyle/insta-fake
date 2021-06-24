$('#js-form').submit(async(e) => {
    e.preventDefault();
    const email = document.getElementById('js-input-email').value;
    const password = document.getElementById('js-input-password').value;
    const JWT = await postData(email, password);
    await getPosts(JWT);



});

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
        console.log('Usuario o contraseña Incorrecta');
    }
}

const getPosts = async(jwt) => {
    try {
        const urlPost = 'http://localhost:3000/api/posts'
        const response = await fetch(urlPost, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        })
        const { data } = await response.json();
        if (data) {
            fillTable(data, 'js-table-posts')
            toggleFormAndTable('js-form-wrapper', 'js-table-wrapper')
        }
    } catch (error) {
        localStorage.clear();
        console.error(error);
    }

}

const fillTable = (data, table) => {
    let rows = "";
    $.each(data, (i, row) => {
        rows += `<tr>
        <td> ${row.title} </td>
        <td> ${row.body} </td>
        </tr>`

    })
    $(`#${table} tbody`).append(rows)
}


const toggleFormAndTable = (form, table) => {
    $(`#${form}`).toggle()
    $(`#${table}`).toggle()
}


const init = (async() => {
    const token = localStorage.getItem('jwt-token')
    if (token) {
        await getPosts(token);
    }
})();