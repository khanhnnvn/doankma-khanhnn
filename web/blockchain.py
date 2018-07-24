# -*- coding:utf-8 -*-
from flask import Flask, render_template, request, redirect
import requests
import config

app = Flask(__name__)

session = requests.session()


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/login', methods=['POST'])
def login():
    username = request.form["username"]
    password = request.form["password"]
    if username == "admin" and password == "admin":
        return render_template("chuc_nang.html")
    return redirect('/')


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
            "account_user": config.ACCOUNT_USER,
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
                "account_user": config.ACCOUNT_USER,
                "channel_name": config.CHANNEL_NAME,
                "chaincodeId": config.CHAINCODEID,
                "url_peer": config.URL_PEER,
                "person": {
                    "clientId": clientId
                }
            }
        ).json()
        message = ""
        if "transaction returned with failure:" in data:
            message = u"Không tìm thấy CMT {}".format(clientId)
    except:
        data = None
        message = u"Không tìm thấy CMT {}".format(clientId)
    return render_template("ket_qua_tim_kiem.html", data=data, message=message)


@app.route('/change-status', methods=['POST'])
def change_status():
    clientId = request.form["clientId"]
    data = requests.post(
        url=config.URL_CHANGE_PROFILE_STATUS,
        json={
            "account_user": config.ACCOUNT_USER,
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


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8686)
