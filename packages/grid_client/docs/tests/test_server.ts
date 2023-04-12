import axios from "axios";

axios
    .post("http://localhost:3000/hamada/deploy", {
        payload: {},
    })
    .then(function (response: any) {
        console.log(response);
    })
    .catch(function (error: any) {
        console.log(error.response.data, error.response);
    });
