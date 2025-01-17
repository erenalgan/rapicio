const jwtDecode = require('jwt-decode');
const axios = require('axios');

const rapicUrl = "https://rapicapi.herokuapp.com/"
const loginUrl = rapicUrl + "api/token/";

let access = "";
let refresh = "";

class Rapic {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    async login() {
        let body = {
            username: this.username,
            password: this.password
        }
        return new Promise((resolve, reject) => {
            axios({
              method: 'post',
              url: loginUrl,
              headers: {
                'Content-type': 'application/json',
              },
              data: JSON.stringify(body),
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject("Failed to login");
                }
                return response.data;
            })
            .then(async (data) => {
                refresh = data.refresh;
                access = data.access;
                resolve("success");
            })
            .catch(error => {
                reject(error);
            });
        })
    }

    async getData(projectName, objectName, filter) {
        await this.getAccessToken();
        return new Promise((resolve, reject) => {
            axios({
              method: 'get',
              url: `http://${this.username}.rapic.io/${projectName}/${objectName}/`,
              headers: {
                'Authorization': `Bearer ${access}`
              },
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject("Failed to get data");
                }
                return response.data;
            })
            .then(async (data) => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    async postData(projectName, objectName, data) {
        await this.getAccessToken();
        return new Promise((resolve, reject) => {
            axios({
              method: 'post',
              url: `http://${this.username}.rapic.io/${projectName}/${objectName}/`,
              headers: {
                'Authorization': `Bearer ${access}`,
                'Content-type': 'application/json'
              },
              data: JSON.stringify(data),
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject(`failed to post data ${response.data}`);
                }
                return response.data;
            })
            .then(async (body) => {
                resolve("success");
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    async updateData(projectName, objectName, id, data) {
        await this.getAccessToken();
        return new Promise((resolve, reject) => {
            axios({
              method: 'post',
              url: `http://${this.username}.rapic.io/${projectName}/${objectName}/${id}`,
              headers: {
                'Authorization': `Bearer ${access}`,
                'Content-type': 'application/json'
              },
              data: JSON.stringify(data),
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject(`failed to update data ${response.data}`);
                }
                return response.data;
            })
            .then(async (body) => {
                resolve("success");
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    async deleteData(projectName, objectName, id) {
        await this.getAccessToken();
        return new Promise((resolve, reject) => {
            axios({
              method: 'delete',
              url: `http://${this.username}.rapic.io/${projectName}/${objectName}/${id}`,
              headers: {
                'Authorization': `Bearer ${access}`,
                'Content-type': 'application/json'
              },
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject(`failed to delete data ${response.data}`);
                }
                return response.data;
            })
            .then(async (body) => {
                resolve("success");
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    async getAccessToken() {
        let refreshToken = refresh;
        let accessToken = access;
        if (accessToken) {
            var decoded = jwtDecode(accessToken);
            let now = Date.now() / 1000;
            // if not expired or not about to expire, don't do anything
            if (decoded.exp - now > 60) {
                return;
            }
        }
        let body = {
            "refresh": refreshToken
        }
        return new Promise((resolve, reject) => {
            axios({
              method: 'post',
              url: loginUrl + "refresh/",
              headers: {
                    'Content-type': 'application/json',
              },
              body: JSON.stringify(body),
            })
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    reject("Failed to get access token");
                }
                return response.data;
            })
            .then(async (data) => {
                access = data.access;
                resolve("success");
            })
            .catch(error => {
                reject(error);
            });
        });
    }
}

module.exports = function (username, password) {
    return new Rapic(username, password);
}
