import axios from "axios"

const getAnecdotes = () => {
    axios.get(baseUrl)
        .then(res => res.data)
}

export {
    getAnecdotes
}
