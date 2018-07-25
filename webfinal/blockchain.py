# -*- coding:utf-8 -*-
from flask import Flask, render_template, request, redirect, session
import requests
import config

app = Flask(__name__)
app.secret_key = 'you will never walk alone'


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/login', methods=['POST'])
def login():
    username = request.form["username"]
    password = request.form["password"]
    if password == "admin":
        session["username"] = username
        return render_template("chuc_nang.html", message=u"Xin chào ngân hàng {}".format(username))
    return redirect('/')

@app.route('/tao_ngan_hang.html')
def tao_ngan_hang():
    return render_template("tao_ngan_hang.html")


@app.route('/tao_ho_so_vay.html')
def tao_ho_so_vay():
    return render_template("tao_ho_so_vay.html")


@app.route('/tim_kiem.html')
def tim_kiem():
    return render_template("tim_kiem.html")


@app.route('/cap_nhat_ho_so.html')
def cap_nhat_ho_so():
    return render_template("cap_nhat_ho_so.html")


@app.route('/createLoansDocument', methods=['POST'])
def createLoansDocument():
    clientId = request.form["clientId"]
    name = request.form["name"]
    address = request.form["address"]
    population = request.form["population"]
    resident = request.form["resident"]
    description = request.form["description"]
    res = requests.post(
        url=config.URL_CREATE_LOANS,
        json={
            "account_user": session["username"],
            "channel_name": config.CHANNEL_NAME,
            "chaincodeId": config.CHAINCODEID,
            "url_peer": config.URL_PEER,
            "url_order": config.URL_ORDER,
            "person": {
                "clientId": clientId,
                "name": name,
                "address": address,
                "population": population,
                "resident": resident,
                "description": description
            }
        }
    ).json()
    return render_template("chuc_nang.html", message=u"Đã tạo hồ sơ vay thành công")


@app.route('/query', methods=['POST'])
def query():
    try:
        clientId = request.form["clientId"]
        data = requests.post(
            url=config.URL_QUERY,
            json={
                "account_user": session["username"],
                "channel_name": config.CHANNEL_NAME,
                "chaincodeId": config.CHAINCODEID,
                "url_peer": config.URL_PEER,
                "person": {
                    "clientId": clientId
                }
            }
        ).json()
        print(data)
        message = ""
        if "transaction returned with failure:" in data:
            message = u"Không tìm thấy CMT {}".format(clientId)
    except Exception as e:
        print(e)
        data = None
        message = u"Không tìm thấy CMT {}".format(clientId)
    return render_template("ket_qua_tim_kiem.html", data=data, message=message)


@app.route('/change-status', methods=['POST'])
def change_status():
    clientId = request.form["clientId"]
    data = requests.post(
        url=config.URL_CHANGE_PROFILE_STATUS,
        json={
            "account_user": session["username"],
            "channel_name": config.CHANNEL_NAME,
            "chaincodeId": config.CHAINCODEID,
            "url_peer": config.URL_PEER,
            "url_order": config.URL_ORDER,
            "person": {
                "clientId": clientId
            }
        }
    ).json()
    return render_template("chuc_nang.html", message=u"Đã thay đổi trạng thái hồ sơ thành công")


@app.route('/createBank', methods=['POST'])
def create_bank():
    bankname = request.form["bankname"]
    fullbankname = request.form["fullbankname"]
    data = requests.post(
        url=config.URL_REGISTER_USER,
        json={
            "account_user": bankname,
            "account_admin": "admin",
            "ca_hostname": config.CA_HOSTNAME,
            "ca_name": config.CA_NAME
        }
    )
    print(data.text)
    data = requests.post(
        url=config.URL_ENROLL_ADMIN,
        json={
            "account": bankname,
            "password": "adminpw",
            "ca_hostname": config.CA_HOSTNAME,
            "ca_name": config.CA_NAME
        }
    )
    print(data.text)

    return render_template("tao_ngan_hang.html")


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8686)
